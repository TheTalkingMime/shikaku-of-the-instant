/**
 * Shikaku puzzle generator — seeded Natural algorithm.
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

function finalize(rects, rng, size, seedStr) {
  const clues = rects.map(r => ({
    ...r,
    area: r.w * r.h,
    numR: r.r + Math.floor(rng() * r.h),
    numC: r.c + Math.floor(rng() * r.w),
  }));
  return { size, clues, seed: seedStr };
}

// ─── Algorithm: Natural (recursive guillotine with heavy-tailed distribution) ─
// Uses recursive subdivision with a sigmoid stopping probability based on
// rectangle area. Each branch decides independently whether to stop, producing
// a heavy-tailed size distribution: a few massive blocks coexist with many tiny
// fillers. This matches the organic, hierarchical feel of professionally
// generated boards.
function generateNatural(size, seedStr) {
  if (!seedStr) seedStr = makeSeed(size);
  const rng = mulberry32(hashString(seedStr));
  const rects = [];

  // M = characteristic area where stopping probability is 50%.
  // Calibrated so 40×40 ≈ 80 rects, scaling reasonably to other sizes.
  const M = Math.max(3, size * 0.55);
  const k = 1.2;  // sigmoid steepness

  function subdivide(r, c, w, h) {
    const area = w * h;

    if (Math.min(w, h) <= 1) {
      rects.push({ r, c, w, h });
      return;
    }

    // Sigmoid stopping probability: P(stop) = 1 / (1 + (area/M)^k)
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
function generatePuzzle(size, seedStr) {
  return generateNatural(size, seedStr);
}
