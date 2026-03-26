/**
 * Shikaku puzzle generator — four algorithms, all seeded.
 *
 * Uses a mulberry32 PRNG so the same seed always produces the same board.
 * Seed format: "{size}_{6-digit-number}", e.g. "20_847291"
 */

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function makeSeed(size) {
  return size + '_' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
}

function targetClueCount(size) {
  return Math.max(2, Math.round(Math.pow(size, 1.4)));
}

function finalize(rects, rng, size, seedStr) {
  const clues = rects.map(r => ({
    ...r,
    area: r.w * r.h,
    numR: r.r + Math.floor(rng() * r.h),
    numC: r.c + Math.floor(rng() * r.w),
  }));
  return { size, clues, seed: seedStr };
}

// Shuffle array in-place using seeded rng
function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Algorithm: Guillotine ───────────────────────────────────────────────────
// Iterative edge-to-edge splits. Simple, fast, produces clean layouts but every
// partition has the "guillotine cut" property.
function generateGuillotine(size, seedStr) {
  if (!seedStr) seedStr = makeSeed(size);
  const rng = mulberry32(hashString(seedStr));
  const target = targetClueCount(size);
  const rects = [{ r: 0, c: 0, w: size, h: size }];

  while (rects.length < target) {
    const splittable = [];
    let totalWeight = 0;
    for (let i = 0; i < rects.length; i++) {
      const area = rects[i].w * rects[i].h;
      if (area > 1) { splittable.push(i); totalWeight += area; }
    }
    if (splittable.length === 0) break;

    let roll = rng() * totalWeight;
    let chosen = splittable[0];
    for (const idx of splittable) {
      roll -= rects[idx].w * rects[idx].h;
      if (roll <= 0) { chosen = idx; break; }
    }

    const rect = rects.splice(chosen, 1)[0];
    let splitH;
    if (rect.h <= 1)                    splitH = false;
    else if (rect.w <= 1)               splitH = true;
    else if (rect.h > rect.w * 1.5)     splitH = true;
    else if (rect.w > rect.h * 1.5)     splitH = false;
    else                                splitH = rng() < 0.5;

    if (splitH) {
      const s = 1 + Math.floor(rng() * (rect.h - 1));
      rects.push(
        { r: rect.r, c: rect.c, w: rect.w, h: s },
        { r: rect.r + s, c: rect.c, w: rect.w, h: rect.h - s }
      );
    } else {
      const s = 1 + Math.floor(rng() * (rect.w - 1));
      rects.push(
        { r: rect.r, c: rect.c, w: s, h: rect.h },
        { r: rect.r, c: rect.c + s, w: rect.w - s, h: rect.h }
      );
    }
  }

  return finalize(rects, rng, size, seedStr);
}

// ─── Shared: irregular scan-line tiling ──────────────────────────────────────
// Used by Irregular and Constraint Solver generators. Returns raw rect array.
function irregularTile(size, rng) {
  const target = targetClueCount(size);
  const avgArea = (size * size) / target;
  const covered = Array.from({ length: size }, () => new Array(size).fill(false));
  const rects = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (covered[r][c]) continue;

      let maxW = 0;
      while (c + maxW < size && !covered[r][c + maxW]) maxW++;

      const maxHByW = new Array(maxW);
      for (let w = 1; w <= maxW; w++) {
        let mh = 0;
        for (let dr = 0; r + dr < size; dr++) {
          let rowOk = true;
          for (let dc = 0; dc < w; dc++) {
            if (covered[r + dr][c + dc]) { rowOk = false; break; }
          }
          if (!rowOk) break;
          mh++;
        }
        maxHByW[w - 1] = mh;
      }

      const candidates = [];
      for (let w = 1; w <= maxW; w++) {
        const mh = maxHByW[w - 1];
        if (mh < 1) continue;
        const idealH = Math.max(1, Math.min(mh, Math.round(avgArea / w)));
        const lo = Math.max(1, idealH - 2);
        const hi = Math.min(mh, idealH + 2);
        for (let h = lo; h <= hi; h++) candidates.push({ w, h });
      }
      if (candidates.length === 0) candidates.push({ w: 1, h: 1 });

      let totalW = 0;
      const weights = candidates.map(cd => {
        const wt = 1 / (1 + Math.abs(cd.w * cd.h - avgArea));
        totalW += wt;
        return wt;
      });

      let roll = rng() * totalW;
      let pick = candidates[0];
      for (let i = 0; i < candidates.length; i++) {
        roll -= weights[i];
        if (roll <= 0) { pick = candidates[i]; break; }
      }

      rects.push({ r, c, w: pick.w, h: pick.h });
      for (let dr = 0; dr < pick.h; dr++)
        for (let dc = 0; dc < pick.w; dc++)
          covered[r + dr][c + dc] = true;
    }
  }
  return rects;
}

// ─── Algorithm: Irregular ────────────────────────────────────────────────────
function generateIrregular(size, seedStr) {
  if (!seedStr) seedStr = makeSeed(size);
  const rng = mulberry32(hashString(seedStr));
  return finalize(irregularTile(size, rng), rng, size, seedStr);
}

// ─── Algorithm: Anchor-Grow ─────────────────────────────────────────────────
// Scatters seed points across the grid on a jittered grid, then grows each
// rectangle outward in random directions. Produces organic, Voronoi-like
// layouts with varied shapes.
function generateAnchorGrow(size, seedStr) {
  if (!seedStr) seedStr = makeSeed(size);
  const rng = mulberry32(hashString(seedStr));

  const target = targetClueCount(size);
  const owner = Array.from({ length: size }, () => new Array(size).fill(-1));

  // ── Place seeds on a jittered grid ──
  const gridDim = Math.ceil(Math.sqrt(target));
  const cellW = size / gridDim;
  const cellH = size / gridDim;
  const placed = new Set();
  const rects = [];

  for (let i = 0; i < target; i++) {
    const gr = Math.floor(i / gridDim);
    const gc = i % gridDim;
    let r = Math.min(size - 1, Math.floor(gr * cellH + rng() * cellH));
    let c = Math.min(size - 1, Math.floor(gc * cellW + rng() * cellW));
    let key = r * size + c;
    // Resolve collisions with random placement
    let tries = 0;
    while (placed.has(key) && tries < 100) {
      r = Math.floor(rng() * size);
      c = Math.floor(rng() * size);
      key = r * size + c;
      tries++;
    }
    if (placed.has(key)) continue; // skip if truly stuck
    placed.add(key);
    owner[r][c] = rects.length;
    rects.push({ r, c, w: 1, h: 1 });
  }

  // ── Growth phase ──
  // Each round: shuffle rects, each tries to grow in one random valid direction
  let grew = true;
  while (grew) {
    grew = false;
    const order = Array.from({ length: rects.length }, (_, i) => i);
    shuffle(order, rng);

    for (const idx of order) {
      const rect = rects[idx];
      const dirs = shuffle([0, 1, 2, 3], rng); // up, down, left, right
      for (const dir of dirs) {
        if (tryGrow(rect, dir, owner, idx, size)) {
          grew = true;
          break;
        }
      }
    }
  }

  // ── Fill remaining gaps with scan-line packing ──
  const avgArea = (size * size) / target;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (owner[r][c] !== -1) continue;

      // Find largest rectangle that fits this gap
      let maxW = 0;
      while (c + maxW < size && owner[r][c + maxW] === -1) maxW++;

      let bestW = 1, bestH = 1, bestScore = Infinity;
      for (let w = 1; w <= maxW; w++) {
        let mh = 0;
        for (let dr = 0; r + dr < size; dr++) {
          let rowOk = true;
          for (let dc = 0; dc < w; dc++) {
            if (owner[r + dr][c + dc] !== -1) { rowOk = false; break; }
          }
          if (!rowOk) break;
          mh++;
        }
        if (mh < 1) continue;
        // Pick height closest to avgArea
        const idealH = Math.max(1, Math.min(mh, Math.round(avgArea / w)));
        const score = Math.abs(w * idealH - avgArea);
        if (score < bestScore) { bestW = w; bestH = idealH; bestScore = score; }
      }

      const newIdx = rects.length;
      const rect = { r, c, w: bestW, h: bestH };
      rects.push(rect);
      for (let dr = 0; dr < bestH; dr++)
        for (let dc = 0; dc < bestW; dc++)
          owner[r + dr][c + dc] = newIdx;
    }
  }

  return finalize(rects, rng, size, seedStr);
}

// Growth helpers for anchor-grow
function tryGrow(rect, dir, owner, idx, size) {
  switch (dir) {
    case 0: // up
      if (rect.r <= 0) return false;
      for (let c = rect.c; c < rect.c + rect.w; c++)
        if (owner[rect.r - 1][c] !== -1) return false;
      rect.r--; rect.h++;
      for (let c = rect.c; c < rect.c + rect.w; c++) owner[rect.r][c] = idx;
      return true;
    case 1: // down
      if (rect.r + rect.h >= size) return false;
      for (let c = rect.c; c < rect.c + rect.w; c++)
        if (owner[rect.r + rect.h][c] !== -1) return false;
      rect.h++;
      for (let c = rect.c; c < rect.c + rect.w; c++) owner[rect.r + rect.h - 1][c] = idx;
      return true;
    case 2: // left
      if (rect.c <= 0) return false;
      for (let r = rect.r; r < rect.r + rect.h; r++)
        if (owner[r][rect.c - 1] !== -1) return false;
      rect.c--; rect.w++;
      for (let r = rect.r; r < rect.r + rect.h; r++) owner[r][rect.c] = idx;
      return true;
    case 3: // right
      if (rect.c + rect.w >= size) return false;
      for (let r = rect.r; r < rect.r + rect.h; r++)
        if (owner[r][rect.c + rect.w] !== -1) return false;
      rect.w++;
      for (let r = rect.r; r < rect.r + rect.h; r++) owner[r][rect.c + rect.w - 1] = idx;
      return true;
  }
  return false;
}

// ─── Algorithm: Unique (Constraint Solver) ───────────────────────────────────
// Generates a tiling, places numbers at constraint-minimizing positions, then
// runs a Shikaku solver to verify the puzzle has a unique solution. Retries
// with different seeds if not unique. For boards > 20×20, uniqueness checking
// is skipped (too expensive) but smart placement is still used.
function generateUnique(size, seedStr) {
  if (!seedStr) seedStr = makeSeed(size);

  // Op limits scale with board size (deterministic, not time-based, so seeds
  // always reproduce the same board regardless of machine speed)
  const maxOps = size <= 7 ? 100000 : size <= 10 ? 300000 :
                 size <= 15 ? 800000 : 2000000;
  const maxAttempts = size <= 15 ? 20 : size <= 20 ? 8 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const attSeed = attempt === 0 ? seedStr : seedStr + '#' + attempt;
    const rng = mulberry32(hashString(attSeed));
    const rects = irregularTile(size, rng);
    const clues = smartPlacement(rects, size);

    // For small–medium boards, verify uniqueness
    if (size <= 20 && maxAttempts > 1) {
      const result = countSolutions(size, clues, maxOps);
      if (result.solutions === 1) {
        return { size, clues, seed: seedStr };
      }
      // Multiple solutions or op-limit hit → try next attempt
      continue;
    }

    // Large boards: return immediately with smart placement
    return { size, clues, seed: seedStr };
  }

  // Fallback: return the first attempt's board (may not be unique)
  const rng = mulberry32(hashString(seedStr));
  const rects = irregularTile(size, rng);
  return { size, clues: smartPlacement(rects, size), seed: seedStr };
}

// Place each clue number at the cell within its rectangle that has the fewest
// possible alternative rectangle placements. This maximizes constraint and
// makes unique solutions far more likely.
function smartPlacement(rects, size) {
  return rects.map(rect => {
    const area = rect.w * rect.h;
    let bestR = rect.r, bestC = rect.c, bestCount = Infinity;
    for (let dr = 0; dr < rect.h; dr++) {
      for (let dc = 0; dc < rect.w; dc++) {
        const nr = rect.r + dr;
        const nc = rect.c + dc;
        const count = countPossibleRects(nr, nc, area, size);
        if (count < bestCount) {
          bestCount = count;
          bestR = nr;
          bestC = nc;
        }
      }
    }
    return { ...rect, area, numR: bestR, numC: bestC };
  });
}

// How many distinct rectangles of the given area could contain cell (numR, numC)?
function countPossibleRects(numR, numC, area, size) {
  let count = 0;
  for (let w = 1; w <= Math.min(area, size); w++) {
    if (area % w !== 0) continue;
    const h = area / w;
    if (h > size) continue;
    const rMin = Math.max(0, numR - h + 1);
    const rMax = Math.min(numR, size - h);
    const cMin = Math.max(0, numC - w + 1);
    const cMax = Math.min(numC, size - w);
    if (rMin <= rMax && cMin <= cMax) {
      count += (rMax - rMin + 1) * (cMax - cMin + 1);
    }
  }
  return count;
}

// Shikaku solver — counts solutions (stops at 2). Uses backtracking with
// forward checking, processing most-constrained clues first.
function countSolutions(size, clues, maxOps) {
  // For each clue, enumerate all legal rectangle placements
  const options = clues.map(clue => {
    const rects = [];
    for (let w = 1; w <= Math.min(clue.area, size); w++) {
      if (clue.area % w !== 0) continue;
      const h = clue.area / w;
      if (h > size) continue;
      for (let r = Math.max(0, clue.numR - h + 1); r <= Math.min(size - h, clue.numR); r++) {
        for (let c = Math.max(0, clue.numC - w + 1); c <= Math.min(size - w, clue.numC); c++) {
          rects.push({ r, c, w, h });
        }
      }
    }
    return rects;
  });

  // Process most-constrained clues first
  const order = Array.from({ length: clues.length }, (_, i) => i);
  order.sort((a, b) => options[a].length - options[b].length);

  const grid = Array.from({ length: size }, () => new Array(size).fill(-1));
  let solutions = 0;
  let ops = 0;

  function backtrack(oi) {
    if (solutions >= 2 || ops >= maxOps) return;
    if (oi >= order.length) { solutions++; return; }

    const ci = order[oi];
    for (const rect of options[ci]) {
      ops++;
      if (ops >= maxOps) return;

      // Check placement
      let ok = true;
      for (let dr = 0; dr < rect.h && ok; dr++)
        for (let dc = 0; dc < rect.w && ok; dc++)
          if (grid[rect.r + dr][rect.c + dc] !== -1) ok = false;
      if (!ok) continue;

      // Place
      for (let dr = 0; dr < rect.h; dr++)
        for (let dc = 0; dc < rect.w; dc++)
          grid[rect.r + dr][rect.c + dc] = ci;

      // Forward check: every remaining clue must have ≥ 1 valid option
      let feasible = true;
      for (let fi = oi + 1; fi < order.length && feasible; fi++) {
        const fci = order[fi];
        let has = false;
        for (const opt of options[fci]) {
          let optOk = true;
          for (let dr = 0; dr < opt.h && optOk; dr++)
            for (let dc = 0; dc < opt.w && optOk; dc++)
              if (grid[opt.r + dr][opt.c + dc] !== -1) optOk = false;
          if (optOk) { has = true; break; }
        }
        if (!has) feasible = false;
      }

      if (feasible) backtrack(oi + 1);

      // Remove
      for (let dr = 0; dr < rect.h; dr++)
        for (let dc = 0; dc < rect.w; dc++)
          grid[rect.r + dr][rect.c + dc] = -1;
    }
  }

  backtrack(0);
  return { solutions, complete: ops < maxOps };
}

// ─── Algorithm: Natural (recursive guillotine with heavy-tailed distribution) ─
// Reverse-engineered from real Shikaku websites. Uses recursive subdivision with
// a sigmoid stopping probability based on rectangle area. Each branch decides
// independently whether to stop, producing a heavy-tailed size distribution:
// a few massive blocks (area 80-130) coexist with many tiny fillers (area 1-5).
// This matches the organic, hierarchical feel of professionally generated boards.
function generateNatural(size, seedStr) {
  if (!seedStr) seedStr = makeSeed(size);
  const rng = mulberry32(hashString(seedStr));
  const rects = [];
  const totalArea = size * size;

  // M = characteristic area where stopping probability is 50%.
  // Calibrated so 40×40 ≈ 80 rects, scaling reasonably to other sizes.
  // size*0.55 gives: 5→2.8, 10→5.5, 20→11, 30→16.5, 40→22
  const M = Math.max(3, size * 0.55);
  const k = 1.2;  // sigmoid steepness (lower = more gradual = wider distribution)

  function subdivide(r, c, w, h) {
    const area = w * h;

    // Can't subdivide a strip of width/height 1
    if (Math.min(w, h) <= 1) {
      rects.push({ r, c, w, h });
      return;
    }

    // Sigmoid stopping probability: P(stop) = 1 / (1 + (area/M)^k)
    // - At area >> M: probability ≈ 0 (almost always cut)
    // - At area  = M: probability = 0.5
    // - At area << M: probability ≈ 1 (almost always stop)
    const stopP = 1 / (1 + Math.pow(area / M, k));

    if (rng() < stopP) {
      rects.push({ r, c, w, h });
      return;
    }

    // Cut direction: bias toward the longer dimension
    let cutH;
    if      (h > w * 1.5) cutH = true;
    else if (w > h * 1.5) cutH = false;
    else                  cutH = rng() < 0.5;

    // Uniform random cut position
    if (cutH) {
      const s = 1 + Math.floor(rng() * (h - 1));
      subdivide(r, c, w, s);
      subdivide(r + s, c, w, h - s);
    } else {
      const s = 1 + Math.floor(rng() * (w - 1));
      subdivide(r, c, s, h);
      subdivide(r, c + s, w - s, h);
    }
  }

  subdivide(0, 0, size, size);
  return finalize(rects, rng, size, seedStr);
}

// ─── Public API ──────────────────────────────────────────────────────────────
const GENERATORS = {
  natural:    { name: 'Natural', fn: generateNatural,
    desc: 'Recursive cuts with heavy-tailed sizes — large blocks + small fillers' },
  guillotine: { name: 'Guillotine', fn: generateGuillotine,
    desc: 'Clean edge-to-edge splits — fast, structured layouts' },
  irregular:  { name: 'Irregular',  fn: generateIrregular,
    desc: 'Interlocking packing — varied, non-uniform layouts' },
  anchor:     { name: 'Anchor-Grow', fn: generateAnchorGrow,
    desc: 'Organic growth from seed points — Voronoi-like shapes' },
  unique:     { name: 'Unique',      fn: generateUnique,
    desc: 'Verifies unique solution (best up to 15×15, smart placement on all sizes)' },
};

function generatePuzzle(size, seedStr, algorithm) {
  const key = algorithm && GENERATORS[algorithm] ? algorithm : 'natural';
  return GENERATORS[key].fn(size, seedStr);
}
