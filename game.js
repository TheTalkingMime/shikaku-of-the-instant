// ─── Constants ───────────────────────────────────────────────────────────────
const CELL = 28;

const COLOR = {
  cellA:      '#1a2840',
  cellB:      '#192538',
  gridDot:    'rgba(255,255,255,0.4)',
  num:        '#ffffff',
  dragFill:   'rgba(255,255,255,0.08)',
  dragStroke: 'rgba(255,255,255,0.6)',
};

// ─── Color palettes ──────────────────────────────────────────────────────────
const PALETTES = {
  classic: {
    name: 'Classic',
    colors: [
      { fill: 'rgba(91,143,212,0.72)',  stroke: '#7aaee8' },
      { fill: 'rgba(210,130,55,0.75)',  stroke: '#e8a060' },
      { fill: 'rgba(175,65,65,0.75)',   stroke: '#e07070' },
      { fill: 'rgba(130,75,185,0.75)',  stroke: '#b088e0' },
      { fill: 'rgba(80,155,65,0.75)',   stroke: '#80cc60' },
      { fill: 'rgba(175,160,45,0.75)',  stroke: '#d4c445' },
      { fill: 'rgba(55,160,160,0.75)',  stroke: '#55d0d0' },
      { fill: 'rgba(185,75,130,0.75)',  stroke: '#e080b8' },
    ],
  },
  pastel: {
    name: 'Pastel',
    colors: [
      { fill: 'rgba(150,190,230,0.65)', stroke: '#a8c8e8' },
      { fill: 'rgba(230,180,140,0.65)', stroke: '#e8c8a0' },
      { fill: 'rgba(220,150,150,0.65)', stroke: '#e8b0b0' },
      { fill: 'rgba(180,160,220,0.65)', stroke: '#c8b8e0' },
      { fill: 'rgba(150,210,150,0.65)', stroke: '#a8d8a8' },
      { fill: 'rgba(220,215,140,0.65)', stroke: '#d8d8a0' },
      { fill: 'rgba(140,210,210,0.65)', stroke: '#a0d8d8' },
      { fill: 'rgba(220,160,190,0.65)', stroke: '#e0b0c8' },
    ],
  },
  neon: {
    name: 'Neon',
    colors: [
      { fill: 'rgba(0,150,255,0.7)',    stroke: '#00bbff' },
      { fill: 'rgba(255,100,0,0.7)',    stroke: '#ff8800' },
      { fill: 'rgba(255,30,80,0.7)',    stroke: '#ff4466' },
      { fill: 'rgba(180,0,255,0.7)',    stroke: '#bb44ff' },
      { fill: 'rgba(0,230,80,0.7)',     stroke: '#22ee66' },
      { fill: 'rgba(240,230,0,0.7)',    stroke: '#eedd00' },
      { fill: 'rgba(0,220,220,0.7)',    stroke: '#00eeee' },
      { fill: 'rgba(255,50,180,0.7)',   stroke: '#ff55bb' },
    ],
  },
  earth: {
    name: 'Earth',
    colors: [
      { fill: 'rgba(140,110,80,0.72)',  stroke: '#b09070' },
      { fill: 'rgba(100,130,80,0.72)',  stroke: '#88aa68' },
      { fill: 'rgba(160,90,70,0.72)',   stroke: '#c07858' },
      { fill: 'rgba(90,120,140,0.72)',  stroke: '#7098b0' },
      { fill: 'rgba(170,150,90,0.72)',  stroke: '#c8b868' },
      { fill: 'rgba(120,90,110,0.72)',  stroke: '#987088' },
      { fill: 'rgba(80,140,120,0.72)',  stroke: '#60b098' },
      { fill: 'rgba(155,120,100,0.72)', stroke: '#c09878' },
    ],
  },
  ocean: {
    name: 'Ocean',
    colors: [
      { fill: 'rgba(30,100,180,0.72)',  stroke: '#3388cc' },
      { fill: 'rgba(20,140,160,0.72)',  stroke: '#28aabb' },
      { fill: 'rgba(60,160,200,0.72)',  stroke: '#55bbdd' },
      { fill: 'rgba(40,80,140,0.72)',   stroke: '#4477aa' },
      { fill: 'rgba(80,180,180,0.72)',  stroke: '#66cccc' },
      { fill: 'rgba(100,140,200,0.72)', stroke: '#88aadd' },
      { fill: 'rgba(50,120,130,0.72)',  stroke: '#448899' },
      { fill: 'rgba(70,200,170,0.72)',  stroke: '#55ddbb' },
    ],
  },
  sunset: {
    name: 'Sunset',
    colors: [
      { fill: 'rgba(220,80,50,0.72)',   stroke: '#ee6644' },
      { fill: 'rgba(240,150,40,0.72)',  stroke: '#ffaa33' },
      { fill: 'rgba(200,50,90,0.72)',   stroke: '#dd4477' },
      { fill: 'rgba(250,200,50,0.72)',  stroke: '#ffcc44' },
      { fill: 'rgba(180,60,120,0.72)',  stroke: '#cc5588' },
      { fill: 'rgba(230,120,60,0.72)',  stroke: '#ee8844' },
      { fill: 'rgba(160,40,70,0.72)',   stroke: '#bb3355' },
      { fill: 'rgba(245,180,80,0.72)', stroke: '#ffbb55' },
    ],
  },
};

const SIZE_LABELS = {
  5: 'Beginner', 7: 'Easy', 10: 'Medium', 15: 'Hard',
  20: 'Expert', 25: 'Grandmaster', 30: 'Legend', 40: 'Master',
};

// ─── State ───────────────────────────────────────────────────────────────────
let puzzle    = null;
let userRects = [];
let owner     = null;
let zoom      = 1;
let cellPx    = CELL;

let timerStart = null;
let timerMs    = 0;
let timerRAF   = null;
let solved     = false;
let paused     = false;

let dragging  = false;
let dragStart = null;
let dragEnd   = null;

let history   = [];
let animRAF   = null;
let currentSeed = '';
let replayLog = [];
let _colorIdx = 0;

let activePalette = 'classic';
let activeGenerator = 'natural';
let canvas, ctx;

// ─── DOM refs ────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ─── Init ────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  canvas = $('gameCanvas');
  ctx    = canvas.getContext('2d');

  // Load saved settings
  const savedPal = localStorage.getItem('shikaku_palette');
  if (savedPal && PALETTES[savedPal]) activePalette = savedPal;
  const savedGen = localStorage.getItem('shikaku_generator');
  if (savedGen && GENERATORS[savedGen]) activeGenerator = savedGen;

  // --- Toolbar buttons ---
  $('clearBtn').addEventListener('click', clearAll);
  $('undoBtn').addEventListener('click', undo);

  // Size dropdown auto-starts new game
  $('sizeSelect').addEventListener('change', () => prepareNewGame());

  // Seed loading
  $('loadSeedBtn').addEventListener('click', loadSeed);
  $('seedInput').addEventListener('keydown', e => { if (e.key === 'Enter') loadSeed(); });

  // Copy seed
  $('copySeedBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(currentSeed).then(() => {
      $('copySeedBtn').textContent = 'Copied!';
      setTimeout(() => $('copySeedBtn').textContent = 'Copy', 1500);
    });
  });

  // Help dropdown
  $('helpBtn').addEventListener('click', e => {
    e.stopPropagation();
    $('helpMenu').classList.toggle('open');
  });
  document.addEventListener('click', () => $('helpMenu').classList.remove('open'));

  // Modals
  $('howToBtn').addEventListener('click', () => {
    $('helpMenu').classList.remove('open');
    $('howToModal').classList.remove('hidden');
  });
  $('closeHow').addEventListener('click', () => $('howToModal').classList.add('hidden'));
  $('nextGameBtn').addEventListener('click', () => {
    $('winModal').classList.add('hidden');
    prepareNewGame();
  });

  // Settings
  $('settingsBtn').addEventListener('click', openSettings);
  $('closeSettings').addEventListener('click', () => $('settingsModal').classList.add('hidden'));

  // Click outside modal to dismiss
  for (const modal of document.querySelectorAll('.modal')) {
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  // Zoom buttons
  $('fitBtn').addEventListener('click', fitToScreen);
  document.querySelectorAll('.zoom-btn[data-zoom]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.zoom-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      zoom   = parseFloat(btn.dataset.zoom);
      cellPx = Math.round(CELL * zoom);
      resizeCanvas();
      drawAll();
    });
  });

  // Focus mode
  $('fullscreenBtn').addEventListener('click', enterFocus);
  $('focusExit').addEventListener('click', exitFocus);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('focus-mode')) exitFocus();
  });

  // Pause / resume
  $('pauseBtn').addEventListener('click', togglePause);
  $('resumeBtn').addEventListener('click', togglePause);

  // Cover screen start button
  $('startGameBtn').addEventListener('click', startFromCover);

  // Race mode
  $('raceBtn').addEventListener('click', openRaceLobby);
  $('startRaceBtn').addEventListener('click', startRace);
  $('cancelRaceBtn').addEventListener('click', () => $('raceLobbyModal').classList.add('hidden'));
  $('shareRaceBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(buildShareText()).catch(() => {});
  });
  $('copyRaceSeedBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(raceSeed).catch(() => {});
  });
  $('closeRaceResultsBtn').addEventListener('click', () => $('raceResultsModal').classList.add('hidden'));

  // --- Mouse events ---
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('contextmenu', onRightClick);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  // --- Touch events ---
  let touchTimer = null;
  let touchCell  = null;

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const cell = getCell(e.touches[0].clientX, e.touches[0].clientY);
    if (!cell) return;
    touchCell = cell;
    dragging  = true;
    dragStart = cell;
    dragEnd   = cell;
    drawAll();
    touchTimer = setTimeout(() => {
      dragging = false;
      removeRectAt(touchCell.r, touchCell.c);
    }, 500);
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    clearTimeout(touchTimer); touchTimer = null;
    if (!dragging) return;
    dragEnd = getCellClamped(e.touches[0].clientX, e.touches[0].clientY);
    drawAll();
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    clearTimeout(touchTimer);
    if (dragging) { dragging = false; commitDrag(); }
  }, { passive: false });

  // --- Window resize ---
  window.addEventListener('resize', () => {
    if ($('fitBtn').classList.contains('active') && puzzle) fitToScreen();
  });

  // --- Initial game setup ---
  prepareNewGame();
});

// ─── Seed loading ────────────────────────────────────────────────────────────
function loadSeed() {
  const seed = $('seedInput').value.trim();
  if (!seed) return;
  const parts = seed.split('_');
  if (parts.length === 2) {
    const sizeVal = parseInt(parts[0], 10);
    const sel = $('sizeSelect');
    for (const opt of sel.options) {
      if (parseInt(opt.value, 10) === sizeVal) { sel.value = opt.value; break; }
    }
  }
  prepareNewGame(seed);
  $('seedInput').value = '';
}

// ─── Cover screen ────────────────────────────────────────────────────────────
function prepareNewGame(seedStr) {
  const size = parseInt($('sizeSelect').value, 10);
  puzzle      = generatePuzzle(size, seedStr || undefined, activeGenerator);
  currentSeed = puzzle.seed;
  userRects   = [];
  history     = [];
  replayLog   = [];
  _colorIdx   = 0;
  owner       = makeOwner(size);
  solved      = false;
  paused      = false;

  stopAnim();
  stopTimer();
  timerMs = 0;
  $('timer').textContent = '00:00.00';
  $('focusTimer').textContent = '00:00.00';
  $('pauseBtn').innerHTML = '&#x23F8;';
  $('pauseBtn').title = 'Pause';

  // Hide pause overlay
  $('pauseOverlay').classList.add('hidden');
  $('pauseOverlay').style.display = 'none';

  // Auto-place 1x1 clues
  for (const clue of puzzle.clues) {
    if (clue.area === 1) {
      const rect = { r: clue.r, c: clue.c, w: 1, h: 1 };
      Object.assign(rect, nextRectColor());
      userRects.push(rect);
    }
  }
  rebuildOwner();
  replayLog.push(userRects.map(r => ({ ...r })));

  resizeCanvas();
  fitToScreen();

  // Show cover screen over the grid
  const label = SIZE_LABELS[size] || '';
  $('coverSize').textContent = `${size}×${size}${label ? ' — ' + label : ''}`;
  $('coverSeed').textContent = `Seed: ${currentSeed}`;
  const cover = $('coverScreen');
  cover.style.display = '';
  cover.classList.remove('hidden');
}

function startFromCover() {
  const cover = $('coverScreen');
  cover.classList.add('hidden');
  setTimeout(() => cover.style.display = 'none', 350);
  startTimer();
}

// ─── Pause / resume ──────────────────────────────────────────────────────────
function togglePause() {
  if (solved || !timerStart) return;
  if (paused) {
    // Resume
    paused = false;
    $('pauseBtn').innerHTML = '&#x23F8;';
    $('pauseBtn').title = 'Pause';
    const overlay = $('pauseOverlay');
    overlay.classList.add('hidden');
    setTimeout(() => overlay.style.display = 'none', 300);
    startTimer();
  } else {
    // Pause
    paused = true;
    stopTimer();
    $('pauseBtn').innerHTML = '&#x25B6;';
    $('pauseBtn').title = 'Resume';
    const overlay = $('pauseOverlay');
    overlay.style.display = '';
    // Force reflow so transition plays
    overlay.offsetHeight;
    overlay.classList.remove('hidden');
  }
}

// ─── Rect color cycling ──────────────────────────────────────────────────────
function getActiveColors() {
  return PALETTES[activePalette].colors;
}

function nextRectColor() {
  const colors = getActiveColors();
  return colors[_colorIdx++ % colors.length];
}

// ─── Settings ────────────────────────────────────────────────────────────────
function openSettings() {
  // --- Palette picker ---
  const list = $('paletteList');
  list.innerHTML = '';
  for (const [key, pal] of Object.entries(PALETTES)) {
    const opt = document.createElement('div');
    opt.className = 'palette-option' + (key === activePalette ? ' active' : '');
    const name = document.createElement('span');
    name.className = 'palette-name';
    name.textContent = pal.name;
    const swatches = document.createElement('div');
    swatches.className = 'palette-swatches';
    for (const c of pal.colors) {
      const s = document.createElement('div');
      s.className = 'palette-swatch';
      s.style.background = c.fill;
      s.style.borderColor = c.stroke;
      swatches.appendChild(s);
    }
    opt.appendChild(name);
    opt.appendChild(swatches);
    opt.addEventListener('click', () => {
      activePalette = key;
      localStorage.setItem('shikaku_palette', key);
      list.querySelectorAll('.palette-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      recolorRects();
      drawAll();
    });
    list.appendChild(opt);
  }

  // --- Generator picker ---
  const genList = $('generatorList');
  genList.innerHTML = '';
  for (const [key, gen] of Object.entries(GENERATORS)) {
    const opt = document.createElement('div');
    opt.className = 'palette-option' + (key === activeGenerator ? ' active' : '');
    const name = document.createElement('span');
    name.className = 'palette-name';
    name.textContent = gen.name;
    const desc = document.createElement('span');
    desc.className = 'generator-desc';
    desc.textContent = gen.desc;
    opt.appendChild(name);
    opt.appendChild(desc);
    opt.addEventListener('click', () => {
      if (key === activeGenerator) return;
      activeGenerator = key;
      localStorage.setItem('shikaku_generator', key);
      genList.querySelectorAll('.palette-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      prepareNewGame();
    });
    genList.appendChild(opt);
  }

  $('settingsModal').classList.remove('hidden');
}

function recolorRects() {
  const colors = getActiveColors();
  for (let i = 0; i < userRects.length; i++) {
    const c = colors[i % colors.length];
    userRects[i].fill = c.fill;
    userRects[i].stroke = c.stroke;
  }
}

// ─── Invalid-rect animation ─────────────────────────────────────────────────
function startAnim() {
  if (animRAF) return;
  (function loop() {
    if (userRects.some(r => getRectState(r) !== 'ok')) {
      drawAll();
      animRAF = requestAnimationFrame(loop);
    } else {
      animRAF = null;
      drawAll();
    }
  })();
}

function stopAnim() {
  if (animRAF) { cancelAnimationFrame(animRAF); animRAF = null; }
}

// ─── Canvas sizing ───────────────────────────────────────────────────────────
function resizeCanvas() {
  const px = cellPx * puzzle.size;
  canvas.width  = px;
  canvas.height = px;
  canvas.style.width  = px + 'px';
  canvas.style.height = px + 'px';
  const wrapper = $('gridWrapper');
  wrapper.style.width  = px + 'px';
  wrapper.style.height = px + 'px';
}

function fitToScreen() {
  // Measure from the stable main-area element, not the grid container
  // which can be inflated by the current canvas size.
  const main = $('mainArea');
  const pad = 48; // breathing room on each axis
  const availW = main.clientWidth - pad;
  const availH = main.clientHeight - pad;
  const gridNat = CELL * puzzle.size;
  zoom   = Math.min(availW / gridNat, availH / gridNat);
  zoom   = Math.min(3, Math.max(0.1, zoom));
  cellPx = Math.round(CELL * zoom);

  document.querySelectorAll('.zoom-btn').forEach(b => b.classList.remove('active'));
  $('fitBtn').classList.add('active');
  resizeCanvas();
  drawAll();
}

// ─── Focus mode ──────────────────────────────────────────────────────────────
function enterFocus() {
  document.body.classList.add('focus-mode');
  requestAnimationFrame(() => fitToScreen());
}

function exitFocus() {
  document.body.classList.remove('focus-mode');
  requestAnimationFrame(() => fitToScreen());
}

// ─── Drawing ─────────────────────────────────────────────────────────────────
function drawAll() {
  const s  = puzzle.size;
  const px = cellPx;
  const W  = px * s;

  // Background
  ctx.clearRect(0, 0, W, W);
  for (let r = 0; r < s; r++)
    for (let c = 0; c < s; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? COLOR.cellA : COLOR.cellB;
      ctx.fillRect(c * px, r * px, px, px);
    }

  // Dotted grid lines
  ctx.strokeStyle = COLOR.gridDot;
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([3, 5]);
  ctx.lineDashOffset = 0;
  for (let i = 1; i < s; i++) {
    ctx.beginPath();
    ctx.moveTo(i * px, 0); ctx.lineTo(i * px, W);
    ctx.moveTo(0, i * px); ctx.lineTo(W, i * px);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  // Committed rectangles (with pulse for invalid)
  const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(performance.now() / 260));
  for (const rect of userRects) {
    const invalid = getRectState(rect) !== 'ok';
    if (invalid) ctx.globalAlpha = 0.35 + 0.45 * pulse;
    drawRect(rect.r, rect.c, rect.w, rect.h, rect.fill, rect.stroke, 2.5);
    if (invalid) ctx.globalAlpha = 1;
  }

  // Drag preview outline
  if (dragging && dragStart && dragEnd) {
    const dr = dragRect();
    drawRect(dr.r, dr.c, dr.w, dr.h, COLOR.dragFill, COLOR.dragStroke, 2);
  }

  // Clue numbers
  const fontSize = Math.max(9, Math.round(px * 0.38));
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
  for (const clue of puzzle.clues) {
    const cx = (clue.numC + 0.5) * px;
    const cy = (clue.numR + 0.5) * px;
    const label = String(clue.area);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillText(label, cx + 1, cy + 1);
    ctx.fillStyle = COLOR.num;
    ctx.fillText(label, cx, cy);
  }

  // Dimension label pill (on top of everything)
  if (dragging && dragStart && dragEnd) {
    const dr = dragRect();
    const label = `${dr.w}×${dr.h}`;
    const labelSize = Math.max(12, Math.round(px * 0.42));
    ctx.font = `bold ${labelSize}px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    const lx = (dr.c + dr.w / 2) * px;
    const ly = (dr.r + dr.h / 2) * px;
    const tm = ctx.measureText(label);
    const padX = 7, padY = 4;
    const tw = tm.width + padX * 2;
    const th = labelSize + padY * 2;
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.beginPath();
    ctx.roundRect(lx - tw / 2, ly - th / 2, tw, th, 5);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(label, lx, ly);
  }
}

function drawRect(r, c, w, h, fill, stroke, lw) {
  const m = 2;
  const x  = c * cellPx + m;
  const y  = r * cellPx + m;
  const rw = w * cellPx - m * 2;
  const rh = h * cellPx - m * 2;
  ctx.beginPath();
  ctx.rect(x, y, rw, rh);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.stroke();
}

// ─── Validation ──────────────────────────────────────────────────────────────
function getRectState(rect) {
  const cluesInside = puzzle.clues.filter(cl => clueInRect(cl, rect));
  if (cluesInside.length !== 1) return 'err';
  return rect.w * rect.h === cluesInside[0].area ? 'ok' : 'err';
}

function clueInRect(cl, rect) {
  return cl.numR >= rect.r && cl.numR < rect.r + rect.h &&
         cl.numC >= rect.c && cl.numC < rect.c + rect.w;
}

function rectsOverlap(a, b) {
  return a.r < b.r + b.h && a.r + a.h > b.r &&
         a.c < b.c + b.w && a.c + a.w > b.c;
}

// ─── Owner grid ──────────────────────────────────────────────────────────────
function makeOwner(size) {
  return Array.from({ length: size }, () => new Array(size).fill(-1));
}

function rebuildOwner() {
  owner = makeOwner(puzzle.size);
  for (let i = 0; i < userRects.length; i++) {
    const rect = userRects[i];
    for (let r = rect.r; r < rect.r + rect.h; r++)
      for (let c = rect.c; c < rect.c + rect.w; c++)
        owner[r][c] = i;
  }
}

// ─── Mouse input ─────────────────────────────────────────────────────────────
function getCell(clientX, clientY) {
  const bbox = canvas.getBoundingClientRect();
  const c = Math.floor((clientX - bbox.left) / cellPx);
  const r = Math.floor((clientY - bbox.top) / cellPx);
  if (r < 0 || c < 0 || r >= puzzle.size || c >= puzzle.size) return null;
  return { r, c };
}

function getCellClamped(clientX, clientY) {
  const bbox = canvas.getBoundingClientRect();
  const c = Math.max(0, Math.min(puzzle.size - 1, Math.floor((clientX - bbox.left) / cellPx)));
  const r = Math.max(0, Math.min(puzzle.size - 1, Math.floor((clientY - bbox.top) / cellPx)));
  return { r, c };
}

function onMouseDown(e) {
  if (e.button !== 0 || paused) return;
  const cell = getCell(e.clientX, e.clientY);
  if (!cell) return;
  dragging  = true;
  dragStart = cell;
  dragEnd   = cell;
  drawAll();
}

function onMouseMove(e) {
  if (!dragging) return;
  const cell = getCellClamped(e.clientX, e.clientY);
  if (cell.r !== dragEnd.r || cell.c !== dragEnd.c) {
    dragEnd = cell;
    drawAll();
  }
}

function onMouseUp() {
  if (!dragging) return;
  dragging = false;
  commitDrag();
}

function onRightClick(e) {
  e.preventDefault();
  if (paused) return;
  const cell = getCell(e.clientX, e.clientY);
  if (!cell) return;
  removeRectAt(cell.r, cell.c);
}

// ─── Drag / commit ───────────────────────────────────────────────────────────
function dragRect() {
  const r1 = Math.min(dragStart.r, dragEnd.r);
  const c1 = Math.min(dragStart.c, dragEnd.c);
  const r2 = Math.max(dragStart.r, dragEnd.r);
  const c2 = Math.max(dragStart.c, dragEnd.c);
  return { r: r1, c: c1, w: c2 - c1 + 1, h: r2 - r1 + 1 };
}

function commitDrag() {
  if (!dragStart || !dragEnd) return;
  const rect = dragRect();

  // Remove overlapping rects
  const toRemove = [];
  for (let i = 0; i < userRects.length; i++)
    if (rectsOverlap(userRects[i], rect)) toRemove.push(i);
  const removed = toRemove.map(i => userRects[i]);
  for (let i = toRemove.length - 1; i >= 0; i--) userRects.splice(toRemove[i], 1);

  Object.assign(rect, nextRectColor());
  userRects.push(rect);
  history.push({ type: 'add', rect, removed });
  rebuildOwner();
  replayLog.push(userRects.map(r => ({ ...r })));
  drawAll();
  startAnim();
  checkWin();
}

function removeRectAt(r, c) {
  const idx = owner[r][c];
  if (idx === -1) return;
  const removed = userRects.splice(idx, 1)[0];
  history.push({ type: 'remove', removed, idx });
  rebuildOwner();
  replayLog.push(userRects.map(r => ({ ...r })));
  drawAll();
  startAnim();
}

function clearAll() {
  if (userRects.length === 0) return;
  history.push({ type: 'clearAll', rects: [...userRects] });
  userRects = [];
  rebuildOwner();
  replayLog.push([]);
  stopAnim();
  drawAll();
}

function undo() {
  if (history.length === 0) return;
  const action = history.pop();
  if (action.type === 'add') {
    userRects.pop();
    for (const r of action.removed) userRects.push(r);
  } else if (action.type === 'remove') {
    userRects.splice(action.idx, 0, action.removed);
  } else if (action.type === 'clearAll') {
    userRects = action.rects;
  }
  rebuildOwner();
  replayLog.push(userRects.map(r => ({ ...r })));
  drawAll();
  startAnim();
}

// ─── Win check ───────────────────────────────────────────────────────────────
function checkWin() {
  if (solved) return;
  const s = puzzle.size;
  for (let r = 0; r < s; r++)
    for (let c = 0; c < s; c++) {
      const idx = owner[r][c];
      if (idx === -1 || getRectState(userRects[idx]) !== 'ok') return;
    }
  solved = true;
  stopTimer();

  if (raceActive) {
    onRaceWin();
    return;
  }

  $('winTime').textContent = `Solved in ${formatTime(timerMs)}`;
  $('seedDisplay').textContent = currentSeed;
  setTimeout(() => {
    $('winModal').classList.remove('hidden');
    renderReplay();
  }, 400);
}

// ─── Timer ───────────────────────────────────────────────────────────────────
function startTimer() {
  timerStart = performance.now() - timerMs;
  const focusTimerEl = $('focusTimer');
  const timerEl = $('timer');
  function tick() {
    timerMs = performance.now() - timerStart;
    const t = formatTime(timerMs);
    timerEl.textContent = t;
    focusTimerEl.textContent = t;
    timerRAF = requestAnimationFrame(tick);
  }
  timerRAF = requestAnimationFrame(tick);
}

function stopTimer() {
  if (timerRAF) { cancelAnimationFrame(timerRAF); timerRAF = null; }
}

function formatTime(ms) {
  const centis = Math.floor((ms % 1000) / 10);
  const secs   = Math.floor(ms / 1000) % 60;
  const mins   = Math.floor(ms / 60000);
  return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}.${String(centis).padStart(2,'0')}`;
}

// ─── Replay ──────────────────────────────────────────────────────────────────
function renderReplay() {
  const replayCanvas = $('replayCanvas');
  const statusEl     = $('replayStatus');

  if (replayLog.length < 2) return;

  const maxPx = 400;
  const rpx   = Math.min(maxPx, puzzle.size * CELL);
  const rCell = rpx / puzzle.size;
  replayCanvas.width  = rpx;
  replayCanvas.height = rpx;
  replayCanvas.style.display = 'block';
  statusEl.textContent = 'Generating replay...';

  const rctx = replayCanvas.getContext('2d');

  // Deduplicate consecutive identical frames
  const frames = [replayLog[0]];
  for (let i = 1; i < replayLog.length; i++) {
    if (JSON.stringify(replayLog[i]) !== JSON.stringify(replayLog[i - 1]))
      frames.push(replayLog[i]);
  }

  const totalMs = Math.min(10000, Math.max(5000, frames.length * 200));
  const delayMs = Math.max(50, Math.round(totalMs / frames.length));
  const lastDelay = 2000;

  function drawFrame(rectsSnap) {
    const s = puzzle.size, px = rCell, W = rpx;
    rctx.clearRect(0, 0, W, W);
    for (let r = 0; r < s; r++)
      for (let c = 0; c < s; c++) {
        rctx.fillStyle = (r + c) % 2 === 0 ? COLOR.cellA : COLOR.cellB;
        rctx.fillRect(c * px, r * px, px, px);
      }

    rctx.strokeStyle = COLOR.gridDot;
    rctx.lineWidth = 1;
    rctx.setLineDash([2, 4]);
    rctx.lineDashOffset = 0;
    for (let i = 1; i < s; i++) {
      rctx.beginPath();
      rctx.moveTo(i * px, 0); rctx.lineTo(i * px, W);
      rctx.moveTo(0, i * px); rctx.lineTo(W, i * px);
      rctx.stroke();
    }
    rctx.setLineDash([]);
    rctx.lineDashOffset = 0;

    for (const rect of rectsSnap) {
      const m = 1;
      rctx.beginPath();
      rctx.rect(rect.c * px + m, rect.r * px + m, rect.w * px - m * 2, rect.h * px - m * 2);
      rctx.fillStyle = rect.fill;
      rctx.fill();
      rctx.strokeStyle = rect.stroke;
      rctx.lineWidth = 1.5;
      rctx.stroke();
    }

    const fontSize = Math.max(7, Math.round(px * 0.38));
    rctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
    rctx.textAlign    = 'center';
    rctx.textBaseline = 'middle';
    rctx.fillStyle = COLOR.num;
    for (const clue of puzzle.clues)
      rctx.fillText(String(clue.area), (clue.numC + 0.5) * px, (clue.numR + 0.5) * px);
  }

  let frame = 0;
  let replayTimer = null;
  statusEl.textContent = '';

  function animate() {
    drawFrame(frames[frame]);
    frame++;
    if (frame >= frames.length) {
      replayTimer = setTimeout(() => { frame = 0; animate(); }, lastDelay);
    } else {
      replayTimer = setTimeout(animate, delayMs);
    }
  }
  animate();

  // Stop loop when modal closes
  const observer = new MutationObserver(() => {
    if ($('winModal').classList.contains('hidden')) {
      clearTimeout(replayTimer);
      observer.disconnect();
    }
  });
  observer.observe($('winModal'), { attributes: true, attributeFilter: ['class'] });
}

// ─── Race Mode ────────────────────────────────────────────────────────────────
const RACE_STAGES = [
  { size: 5,  label: 'Easy' },
  { size: 10, label: 'Medium' },
  { size: 20, label: 'Hard' },
  { size: 30, label: 'Expert' },
  { size: 40, label: 'Master' },
];

let raceActive  = false;
let raceStage   = 0;
let raceSeed    = '';
let raceTimes   = [];   // ms per stage
let raceBanner  = null;

function makeRaceSeed() {
  return 'R' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
}

function stageSeed(raceSeed, stageIdx) {
  const stage = RACE_STAGES[stageIdx];
  // Derive a per-stage seed: "{size}_{raceSeed hash for this stage}"
  const hash = Math.abs(hashString(raceSeed + '_stage' + stageIdx));
  return stage.size + '_' + String(hash % 1000000).padStart(6, '0');
}

function openRaceLobby() {
  $('raceSeedInput').value = '';
  $('raceLobbyModal').classList.remove('hidden');
}

function startRace() {
  const inputSeed = $('raceSeedInput').value.trim();
  raceSeed  = inputSeed || makeRaceSeed();
  raceStage = 0;
  raceTimes = [];
  raceActive = true;

  $('raceLobbyModal').classList.add('hidden');

  // Hide normal toolbar controls that shouldn't be used during race
  $('sizeSelect').disabled = true;
  $('loadSeedBtn').disabled = true;
  $('seedInput').disabled = true;
  $('raceBtn').disabled = true;

  // Create race banner
  if (!raceBanner) {
    raceBanner = document.createElement('div');
    raceBanner.className = 'race-banner';
    raceBanner.id = 'raceBanner';
    // Insert at top of main area
    const main = $('mainArea');
    main.insertBefore(raceBanner, main.firstChild);
  }
  raceBanner.style.display = '';
  updateRaceBanner();

  loadRaceStage();
}

function updateRaceBanner() {
  if (!raceBanner) return;
  const stage = RACE_STAGES[raceStage];
  raceBanner.innerHTML =
    `<span class="race-label">RACE</span>` +
    `<span class="race-progress">Stage ${raceStage + 1}/5: ${stage.label} (${stage.size}×${stage.size})</span>` +
    `<span style="color:var(--text-dim);">Seed: ${raceSeed}</span>`;
}

function loadRaceStage() {
  const stage = RACE_STAGES[raceStage];
  const seed  = stageSeed(raceSeed, raceStage);

  // Set the size dropdown to match (for fitToScreen calculations)
  const sel = $('sizeSelect');
  for (const opt of sel.options) {
    if (parseInt(opt.value, 10) === stage.size) { sel.value = opt.value; break; }
  }

  prepareNewGame(seed);

  // Override cover screen text for race
  $('coverSize').textContent = `Stage ${raceStage + 1}/5: ${stage.label} (${stage.size}×${stage.size})`;
  $('coverSeed').textContent = `Race seed: ${raceSeed}`;
}

function onRaceWin() {
  raceTimes.push(timerMs);

  raceStage++;
  if (raceStage < RACE_STAGES.length) {
    // Next stage — brief delay then load
    updateRaceBanner();
    setTimeout(() => loadRaceStage(), 300);
  } else {
    // Race complete!
    raceActive = false;
    endRace();
  }
}

function endRace() {
  // Restore normal controls
  $('sizeSelect').disabled = false;
  $('loadSeedBtn').disabled = false;
  $('seedInput').disabled = false;
  $('raceBtn').disabled = false;

  if (raceBanner) raceBanner.style.display = 'none';

  // Build results
  const list = $('raceResultsList');
  list.innerHTML = '';
  let total = 0;
  for (let i = 0; i < RACE_STAGES.length; i++) {
    total += raceTimes[i];
    const row = document.createElement('div');
    row.className = 'race-result-row';
    row.innerHTML =
      `<span class="race-result-name">${RACE_STAGES[i].label} (${RACE_STAGES[i].size}×${RACE_STAGES[i].size})</span>` +
      `<span class="race-result-time">${formatTime(raceTimes[i])}</span>`;
    list.appendChild(row);
  }

  $('raceTotalTime').textContent = `Total: ${formatTime(total)}`;
  $('raceSeedDisplay').textContent = raceSeed;

  $('raceResultsModal').classList.remove('hidden');
}

function buildShareText() {
  let total = 0;
  for (const t of raceTimes) total += t;
  let text = `Shikaku Race (${raceSeed})\n`;
  for (let i = 0; i < RACE_STAGES.length; i++) {
    text += `${RACE_STAGES[i].label} (${RACE_STAGES[i].size}×${RACE_STAGES[i].size}): ${formatTime(raceTimes[i])}\n`;
  }
  text += `Total: ${formatTime(total)}`;
  return text;
}
