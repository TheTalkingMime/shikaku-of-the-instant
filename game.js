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
  happy: {
    name: 'Happy Rectangles',
    faces: true,
    colors: [
      { fill: 'rgba(255,210,70,0.82)',  stroke: '#ffd246' },
      { fill: 'rgba(110,215,130,0.82)', stroke: '#6ed782' },
      { fill: 'rgba(130,190,255,0.82)', stroke: '#82beff' },
      { fill: 'rgba(255,150,170,0.82)', stroke: '#ff96aa' },
      { fill: 'rgba(200,165,255,0.82)', stroke: '#c8a5ff' },
      { fill: 'rgba(255,175,90,0.82)',  stroke: '#ffaf5a' },
      { fill: 'rgba(140,230,210,0.82)', stroke: '#8ce6d2' },
      { fill: 'rgba(255,215,150,0.82)', stroke: '#ffd796' },
    ],
  },
};

const SIZE_LABELS = {
  5: 'Easy', 10: 'Medium', 20: 'Hard', 30: 'Expert', 40: 'Master',
};

const ZOOM_LEVELS = ['fit', 1, 1.25, 1.5, 2];

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

let currentSize = 20;
let zoomLevelIdx = 0;

// ─── View mode: 'home' | 'freeplay' | 'race' ────────────────────────────────
let viewMode = 'home';

// ─── Stats / Personal Bests ──────────────────────────────────────────────────
function loadStats() {
  try {
    return JSON.parse(localStorage.getItem('shikaku_stats')) || {};
  } catch { return {}; }
}

function saveStats(stats) {
  localStorage.setItem('shikaku_stats', JSON.stringify(stats));
}

function recordWin(size, ms) {
  const stats = loadStats();
  if (!stats[size]) stats[size] = { played: 0, wins: 0, bestMs: null, totalMs: 0 };
  const s = stats[size];
  s.wins++;
  s.totalMs += ms;
  const isNewBest = s.bestMs === null || ms < s.bestMs;
  if (isNewBest) s.bestMs = ms;
  saveStats(stats);
  return isNewBest;
}

function recordPlay(size) {
  const stats = loadStats();
  if (!stats[size]) stats[size] = { played: 0, wins: 0, bestMs: null, totalMs: 0 };
  stats[size].played++;
  saveStats(stats);
}

function getBest(size) {
  const stats = loadStats();
  return stats[size]?.bestMs ?? null;
}

// ─── DOM refs ────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ─── Instant Race Seed ───────────────────────────────────────────────────────
let instantSeed = null;

function getInstantRaceSeed() {
  if (!instantSeed) {
    instantSeed = 'T' + Math.floor(Date.now() / 1000);
  }
  return instantSeed;
}

function refreshInstantSeed() {
  instantSeed = 'T' + Math.floor(Date.now() / 1000);
  return instantSeed;
}

// ─── Home Screen ─────────────────────────────────────────────────────────────
function showHomeScreen() {
  viewMode = 'home';
  $('homeScreen').classList.remove('hidden');
  $('gameView').classList.add('hidden');
  stopTimer();
  stopAnim();

  // Clean up any race/review tab state
  $('difficultyTabs').classList.remove('race-mode');
  resetTabLabels();
  const center = $('topBarCenter');
  const badge = center.querySelector('.top-review-badge');
  if (badge) badge.remove();
  const exitBtn = center.querySelector('#raceExitReview');
  if (exitBtn) exitBtn.remove();

  window.history.replaceState(null, '', window.location.pathname);
  refreshHomeScreen();
}

function refreshHomeScreen() {
  refreshInstantSeed();
  $('homeSeedInput').value = getInstantRaceSeed();
  renderRecentRaces();
}

function renderRecentRaces() {
  const hist = loadRaceHistory();
  const container = $('homeRecentRaces');
  if (hist.length === 0) {
    container.innerHTML = '';
    return;
  }

  const recent = hist.slice(0, 5);
  let html = '<div class="home-recent-title">Recent Races</div><div class="home-recent-list">';
  for (const race of recent) {
    const date = new Date(race.date);
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    html += `<div class="home-recent-row" data-seed="${race.raceSeed}">`;
    html += `<span class="home-recent-seed">${race.raceSeed}</span>`;
    html += `<span class="home-recent-time">${formatTime(race.totalMs)}</span>`;
    html += `<span class="home-recent-date">${dateStr}</span>`;
    html += `</div>`;
  }
  html += '</div>';
  container.innerHTML = html;

  container.querySelectorAll('.home-recent-row').forEach(row => {
    row.addEventListener('click', () => {
      const seed = row.dataset.seed;
      startRaceFromHome(seed);
    });
  });
}

function showGameView(mode) {
  viewMode = mode;
  $('homeScreen').classList.add('hidden');
  $('gameView').classList.remove('hidden');

  // Tabs are always visible; race-mode class changes their appearance
  const tabs = $('difficultyTabs');
  if (mode === 'race') {
    tabs.classList.add('race-mode');
  } else {
    tabs.classList.remove('race-mode');
    updateActiveDiffTab(currentSize);
  }

  // Clean up any stale review UI
  const reviewDone = $('topBarCenter').querySelector('.top-review-badge');
  if (reviewDone) reviewDone.remove();
  const reviewExit = $('topBarCenter').querySelector('#raceExitReview');
  if (reviewExit) reviewExit.remove();
}

function updateActiveDiffTab(size) {
  document.querySelectorAll('.diff-tab').forEach(t => {
    t.classList.toggle('active', parseInt(t.dataset.size) === size);
  });
}

// ─── Zoom control ────────────────────────────────────────────────────────────
function updateZoomLabel() {
  const level = ZOOM_LEVELS[zoomLevelIdx];
  $('topZoomLabel').textContent = level === 'fit' ? 'Fit' : Math.round(level * 100) + '%';
}

function zoomIn() {
  if (!puzzle) return;
  if (zoomLevelIdx < ZOOM_LEVELS.length - 1) {
    zoomLevelIdx++;
    applyZoom();
  }
}

function zoomOut() {
  if (!puzzle) return;
  if (zoomLevelIdx > 0) {
    zoomLevelIdx--;
    applyZoom();
  }
}

function applyZoom() {
  const level = ZOOM_LEVELS[zoomLevelIdx];
  if (level === 'fit') {
    fitToScreen();
  } else {
    zoom   = level;
    cellPx = Math.round(CELL * zoom);
    resizeCanvas();
    drawAll();
  }
  updateZoomLabel();
}

// ─── Init ────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  canvas = $('gameCanvas');
  ctx    = canvas.getContext('2d');

  // Load saved settings
  const savedPal = localStorage.getItem('shikaku_palette');
  if (savedPal && PALETTES[savedPal]) activePalette = savedPal;
  const savedGen = localStorage.getItem('shikaku_generator');
  if (savedGen && GENERATORS[savedGen]) activeGenerator = savedGen;

  // --- Top bar buttons ---

  // Home button
  $('topHomeBtn').addEventListener('click', () => {
    if (raceActive) {
      if (!confirm('Abandon current race and return home?')) return;
      abandonRace();
    }
    showHomeScreen();
  });

  // Difficulty tabs — serve as both difficulty selector (free play) and stage tabs (race)
  document.querySelectorAll('.diff-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const size = parseInt(tab.dataset.size);

      if (raceActive) {
        // In race mode, switch to the stage matching this size
        const stageIdx = RACE_STAGES.findIndex(s => s.size === size);
        if (stageIdx !== -1 && stageIdx !== raceStage) {
          loadBoard(stageIdx);
        }
        return;
      }

      // Review mode — switch reviewed board
      if (raceReviewIdx >= 0) {
        const stageIdx = RACE_STAGES.findIndex(s => s.size === size);
        if (stageIdx !== -1 && raceSnapshots[stageIdx]) {
          viewRaceBoard(stageIdx);
        }
        return;
      }

      // Free play: start new game at this size
      if (size === currentSize && puzzle && !solved) return;
      currentSize = size;
      updateActiveDiffTab(size);
      prepareNewGame();
    });
  });

  // Pause / resume
  $('topPauseBtn').addEventListener('click', togglePause);
  $('resumeBtn').addEventListener('click', togglePause);

  // Undo
  $('topUndoBtn').addEventListener('click', undo);

  // Clear
  $('topClearBtn').addEventListener('click', clearAll);

  // Zoom
  $('topZoomOut').addEventListener('click', zoomOut);
  $('topZoomIn').addEventListener('click', zoomIn);
  $('topZoomLabel').addEventListener('click', () => {
    if (!puzzle) return;
    zoomLevelIdx = 0;
    applyZoom();
  });

  // Settings
  $('topSettingsBtn').addEventListener('click', openSettings);

  // --- Copy buttons ---
  $('copySeedBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(currentSeed).then(() => {
      $('copySeedBtn').textContent = 'Copied!';
      setTimeout(() => $('copySeedBtn').textContent = 'Copy Seed', 1500);
    });
  });

  $('copyLinkBtn').addEventListener('click', () => {
    const url = window.location.origin + window.location.pathname + '#seed=' + currentSeed;
    navigator.clipboard.writeText(url).then(() => {
      $('copyLinkBtn').textContent = 'Copied!';
      setTimeout(() => $('copyLinkBtn').textContent = 'Copy Link', 1500);
    });
  });

  // --- Modals ---
  $('closeHow').addEventListener('click', () => $('howToModal').classList.add('hidden'));
  $('nextGameBtn').addEventListener('click', () => {
    $('winModal').classList.add('hidden');
    prepareNewGame();
  });
  $('shareImageBtn').addEventListener('click', shareAsImage);

  $('closeSettings').addEventListener('click', () => $('settingsModal').classList.add('hidden'));

  $('closeStats').addEventListener('click', () => $('statsModal').classList.add('hidden'));
  $('resetStats').addEventListener('click', () => {
    if (confirm('Reset all statistics? This cannot be undone.')) {
      localStorage.removeItem('shikaku_stats');
      openStats();
    }
  });

  for (const modal of document.querySelectorAll('.modal')) {
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  // Focus mode (keyboard shortcut only now - F key)
  $('focusExit').addEventListener('click', exitFocus);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('focus-mode')) exitFocus();
    if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey && viewMode !== 'home' && document.activeElement === document.body) {
      if (document.body.classList.contains('focus-mode')) exitFocus();
      else enterFocus();
    }
    // Ctrl+Z for undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && viewMode !== 'home') {
      e.preventDefault();
      undo();
    }
  });

  // Cover screen start button
  $('startGameBtn').addEventListener('click', startFromCover);

  // --- Race buttons ---
  $('shareRaceBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(buildShareText()).catch(() => {});
  });
  $('copyRaceSeedBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(raceSeed).catch(() => {});
  });
  $('closeRaceResultsBtn').addEventListener('click', () => $('raceResultsModal').classList.add('hidden'));
  $('raceHomeBtn').addEventListener('click', () => {
    $('raceResultsModal').classList.add('hidden');
    showHomeScreen();
  });
  $('closeRaceHistory').addEventListener('click', () => $('raceHistoryModal').classList.add('hidden'));

  // --- Home screen buttons ---
  $('startRaceBtn').addEventListener('click', () => {
    const seed = $('homeSeedInput').value.trim();
    startRaceFromHome(seed || undefined);
  });
  $('homeSeedInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const seed = $('homeSeedInput').value.trim();
      startRaceFromHome(seed || undefined);
    }
  });
  $('homeSeedRefresh').addEventListener('click', () => {
    refreshInstantSeed();
    $('homeSeedInput').value = getInstantRaceSeed();
  });
  $('freePlayBtn').addEventListener('click', () => {
    showGameView('freeplay');
    prepareNewGame();
  });
  $('homeHistoryBtn').addEventListener('click', openRaceHistory);
  $('homeStatsBtn').addEventListener('click', openStats);
  $('homeSettingsBtn').addEventListener('click', openSettings);
  $('homeHelpBtn').addEventListener('click', () => $('howToModal').classList.remove('hidden'));

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
    if (solved) return;
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
    if (zoomLevelIdx === 0 && puzzle) fitToScreen();
  });

  // --- URL seed sharing: check for seed in hash ---
  const hashSeed = window.location.hash.replace(/^#seed=/, '');
  if (hashSeed && hashSeed.includes('_')) {
    showGameView('freeplay');
    prepareNewGame(hashSeed);
    updateActiveDiffTab(currentSize);
  } else {
    showHomeScreen();
  }
});

// ─── Start race from home screen ─────────────────────────────────────────────
function startRaceFromHome(seed) {
  raceSeed      = seed || makeRaceSeed();
  raceStage     = -1;
  raceTimes     = [];
  raceSnapshots = [];
  raceReviewIdx = -1;
  raceActive    = true;

  initRaceBoards();

  showGameView('race');

  loadBoard(0);
}

// ─── Seed loading (for hash URLs) ────────────────────────────────────────────
function loadSeedFromString(seedStr) {
  if (!seedStr) return;
  const parts = seedStr.split('_');
  if (parts.length === 2) {
    const sizeVal = parseInt(parts[0], 10);
    if ([5, 10, 20, 30, 40].includes(sizeVal)) {
      currentSize = sizeVal;
      updateActiveDiffTab(sizeVal);
    }
  }
  prepareNewGame(seedStr);
}

// ─── Cover screen ────────────────────────────────────────────────────────────
function prepareNewGame(seedStr) {
  // If a seed is provided, parse the size from it
  if (seedStr) {
    const parts = seedStr.split('_');
    if (parts.length >= 2) {
      const sizeVal = parseInt(parts[0], 10);
      if (sizeVal > 0) currentSize = sizeVal;
    }
  }
  const size = currentSize;
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
  $('topTimerDisplay').textContent = '00:00.00';
  $('focusTimer').textContent = '00:00.00';
  $('topPauseBtn').innerHTML = '&#x23F8;';
  $('topPauseBtn').title = 'Pause';

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
  zoomLevelIdx = 0;
  fitToScreen();
  updateZoomLabel();

  recordPlay(size);

  if (viewMode === 'freeplay') {
    window.history.replaceState(null, '', '#seed=' + currentSeed);
  }

  // Show cover screen
  const label = SIZE_LABELS[size] || '';
  $('coverSize').textContent = `${size}×${size}${label ? ' — ' + label : ''}`;
  const best = getBest(size);
  $('coverSeed').textContent = `Seed: ${currentSeed}` + (best !== null ? `  ·  Best: ${formatTime(best)}` : '');
  const cover = $('coverScreen');
  cover.style.display = '';
  cover.classList.remove('hidden');
}

function startFromCover() {
  const cover = $('coverScreen');
  cover.classList.add('hidden');
  setTimeout(() => cover.style.display = 'none', 350);

  if (raceActive && raceBoards[raceStage]) {
    raceBoards[raceStage].started = true;
  }

  startTimer();
}

// ─── Pause / resume ──────────────────────────────────────────────────────────
function togglePause() {
  if (solved || !timerStart) return;
  if (paused) {
    paused = false;
    $('topPauseBtn').innerHTML = '&#x23F8;';
    $('topPauseBtn').title = 'Pause';
    const overlay = $('pauseOverlay');
    overlay.classList.add('hidden');
    setTimeout(() => overlay.style.display = 'none', 300);
    startTimer();
  } else {
    paused = true;
    stopTimer();
    $('topPauseBtn').innerHTML = '&#x25B6;';
    $('topPauseBtn').title = 'Resume';
    const overlay = $('pauseOverlay');
    overlay.style.display = '';
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

// ─── Statistics ──────────────────────────────────────────────────────────────
function openStats() {
  const stats = loadStats();
  const content = $('statsContent');
  const sizes = Object.keys(stats).map(Number).sort((a, b) => a - b);

  if (sizes.length === 0) {
    content.innerHTML = '<div class="stats-empty">No games played yet. Start solving!</div>';
    $('statsModal').classList.remove('hidden');
    return;
  }

  let totalPlayed = 0, totalWins = 0;
  for (const s of sizes) { totalPlayed += stats[s].played; totalWins += stats[s].wins; }

  let html = `<div class="stats-totals">
    <div class="stats-total-card"><div class="stats-total-value">${totalPlayed}</div><div class="stats-total-label">Played</div></div>
    <div class="stats-total-card"><div class="stats-total-value">${totalWins}</div><div class="stats-total-label">Solved</div></div>
    <div class="stats-total-card"><div class="stats-total-value">${totalPlayed > 0 ? Math.round(totalWins / totalPlayed * 100) : 0}%</div><div class="stats-total-label">Win Rate</div></div>
  </div>`;

  html += `<table class="stats-table"><thead><tr>
    <th>Size</th><th>Played</th><th>Solved</th><th>Best</th><th>Avg</th>
  </tr></thead><tbody>`;

  for (const size of sizes) {
    const s = stats[size];
    const label = SIZE_LABELS[size] || '';
    const bestStr = s.bestMs !== null ? formatTime(s.bestMs) : '—';
    const avgStr = s.wins > 0 ? formatTime(Math.round(s.totalMs / s.wins)) : '—';
    html += `<tr>
      <td class="stats-size">${size}×${size}${label ? ' ' + label : ''}</td>
      <td>${s.played}</td>
      <td>${s.wins}</td>
      <td class="stats-best">${bestStr}</td>
      <td>${avgStr}</td>
    </tr>`;
  }
  html += '</tbody></table>';
  content.innerHTML = html;
  $('statsModal').classList.remove('hidden');
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
      if (puzzle) { recolorRects(); drawAll(); }
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
      if (viewMode === 'freeplay') prepareNewGame();
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

// ─── Canvas sizing (HiDPI-aware) ─────────────────────────────────────────────
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const px = cellPx * puzzle.size;

  // Set the internal resolution to native device pixels
  canvas.width  = Math.round(px * dpr);
  canvas.height = Math.round(px * dpr);

  // Set the CSS display size
  canvas.style.width  = px + 'px';
  canvas.style.height = px + 'px';

  // Scale the drawing context so all draw calls use CSS-pixel coordinates
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const wrapper = $('gridWrapper');
  wrapper.style.width  = px + 'px';
  wrapper.style.height = px + 'px';
}

function fitToScreen() {
  const main = $('mainArea');
  const pad = 48;
  const availW = main.clientWidth - pad;
  const availH = main.clientHeight - pad;
  const gridNat = CELL * puzzle.size;
  zoom   = Math.min(availW / gridNat, availH / gridNat);
  zoom   = Math.min(3, Math.max(0.1, zoom));
  cellPx = Math.round(CELL * zoom);

  zoomLevelIdx = 0;
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

function drawGridBase(cx, s, px, ox, oy, dash, gridLw) {
  const W = px * s;
  for (let r = 0; r < s; r++)
    for (let c = 0; c < s; c++) {
      cx.fillStyle = (r + c) % 2 === 0 ? COLOR.cellA : COLOR.cellB;
      cx.fillRect(ox + c * px, oy + r * px, px, px);
    }
  cx.strokeStyle = COLOR.gridDot;
  cx.lineWidth = gridLw;
  cx.setLineDash(dash);
  cx.lineDashOffset = 0;
  for (let i = 1; i < s; i++) {
    cx.beginPath();
    cx.moveTo(ox + i * px, oy); cx.lineTo(ox + i * px, oy + W);
    cx.moveTo(ox, oy + i * px); cx.lineTo(ox + W, oy + i * px);
    cx.stroke();
  }
  cx.setLineDash([]);
  cx.lineDashOffset = 0;
}

function drawGrid(cx, s, px, ox, oy, rects, clues, opts) {
  const dash = opts.dash || [3, 5];
  const rectLw = opts.rectLw || 2;
  const shadow = opts.shadow !== false;

  drawGridBase(cx, s, px, ox, oy, dash, opts.gridLw || 1.5);

  for (const rect of rects) {
    const m = opts.rectMargin || 2;
    cx.beginPath();
    cx.rect(ox + rect.c * px + m, oy + rect.r * px + m, rect.w * px - m * 2, rect.h * px - m * 2);
    cx.fillStyle = rect.fill;
    cx.fill();
    cx.strokeStyle = rect.stroke;
    cx.lineWidth = rectLw;
    cx.stroke();
  }

  const fontSize = Math.max(7, Math.round(px * 0.38));
  cx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  for (const clue of clues) {
    const clueCx = ox + (clue.numC + 0.5) * px;
    const clueCy = oy + (clue.numR + 0.5) * px;
    const label = String(clue.area);
    if (shadow) {
      cx.fillStyle = 'rgba(0,0,0,0.55)';
      cx.fillText(label, clueCx + 1, clueCy + 1);
    }
    cx.fillStyle = COLOR.num;
    cx.fillText(label, clueCx, clueCy);
  }
}

// ─── Happy Rectangles face drawing ───────────────────────────────────────────
function drawFaces(cx, rects, px) {
  for (const rect of rects) {
    const w = rect.w * px;
    const h = rect.h * px;
    const minDim = Math.min(w, h);

    // Skip faces on tiny rects
    if (minDim < 22) continue;

    const centerX = rect.c * px + w / 2;
    const centerY = rect.r * px + h / 2;
    const faceR = minDim * 0.32;
    const isValid = getRectState(rect) === 'ok';

    // Eyes
    const eyeR = Math.max(1.5, faceR * 0.12);
    const eyeOffsetY = faceR * 0.18;
    const eyeSpacing = faceR * 0.32;

    cx.fillStyle = 'rgba(0,0,0,0.55)';
    cx.beginPath();
    cx.arc(centerX - eyeSpacing, centerY - eyeOffsetY, eyeR, 0, Math.PI * 2);
    cx.fill();
    cx.beginPath();
    cx.arc(centerX + eyeSpacing, centerY - eyeOffsetY, eyeR, 0, Math.PI * 2);
    cx.fill();

    // Mouth
    const mouthR = faceR * 0.25;
    cx.strokeStyle = 'rgba(0,0,0,0.55)';
    cx.lineWidth = Math.max(1.5, faceR * 0.07);
    cx.lineCap = 'round';
    cx.beginPath();
    if (isValid) {
      cx.arc(centerX, centerY + faceR * 0.08, mouthR, 0.15 * Math.PI, 0.85 * Math.PI);
    } else {
      cx.arc(centerX, centerY + faceR * 0.42, mouthR, 1.15 * Math.PI, 1.85 * Math.PI);
    }
    cx.stroke();
  }
}

function drawAll() {
  const s  = puzzle.size;
  const px = cellPx;
  const W  = px * s;

  ctx.clearRect(0, 0, W, W);
  drawGridBase(ctx, s, px, 0, 0, [3, 5], 1.5);

  const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(performance.now() / 260));
  for (const rect of userRects) {
    const invalid = getRectState(rect) !== 'ok';
    if (invalid) ctx.globalAlpha = 0.35 + 0.45 * pulse;
    const m = 2;
    ctx.beginPath();
    ctx.rect(rect.c * px + m, rect.r * px + m, rect.w * px - m * 2, rect.h * px - m * 2);
    ctx.fillStyle = rect.fill;
    ctx.fill();
    ctx.strokeStyle = rect.stroke;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    if (invalid) ctx.globalAlpha = 1;
  }

  // Happy Rectangles faces
  if (PALETTES[activePalette].faces) {
    drawFaces(ctx, userRects, px);
  }

  if (dragging && dragStart && dragEnd) {
    const dr = dragRect();
    const m = 2;
    ctx.beginPath();
    ctx.rect(dr.c * px + m, dr.r * px + m, dr.w * px - m * 2, dr.h * px - m * 2);
    ctx.fillStyle = COLOR.dragFill;
    ctx.fill();
    ctx.strokeStyle = COLOR.dragStroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

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
  if (e.button !== 0 || paused || solved) return;
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

function onMouseUp(e) {
  if (!dragging) return;
  if (e.button !== 0) return;
  dragging = false;
  commitDrag();
}

function onRightClick(e) {
  e.preventDefault();
  if (paused || solved) return;
  if (dragging) {
    dragging  = false;
    dragStart = null;
    dragEnd   = null;
    drawAll();
    return;
  }
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
  if (solved || userRects.length === 0) return;
  history.push({ type: 'clearAll', rects: [...userRects] });
  userRects = [];
  rebuildOwner();
  replayLog.push([]);
  stopAnim();
  drawAll();
}

function undo() {
  if (solved || history.length === 0) return;
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
  showWinFlash();

  if (raceActive) {
    onRaceWin();
    return;
  }

  const isNewBest = recordWin(puzzle.size, timerMs);
  const best = getBest(puzzle.size);
  let winText = `Solved in ${formatTime(timerMs)}`;
  if (isNewBest) winText += '  —  New personal best!';
  else if (best !== null) winText += `  (Best: ${formatTime(best)})`;
  $('winTime').textContent = winText;
  $('seedDisplay').textContent = currentSeed;
  setTimeout(() => {
    $('winModal').classList.remove('hidden');
    renderReplay();
  }, 600);
}

// ─── Win flash ───────────────────────────────────────────────────────────────
function showWinFlash() {
  const el = document.createElement('div');
  el.className = 'win-flash';
  $('gridWrapper').appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// ─── Timer ───────────────────────────────────────────────────────────────────
function startTimer() {
  timerStart = performance.now() - timerMs;
  const focusTimerEl = $('focusTimer');
  const timerEl = $('topTimerDisplay');
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
  const dpr   = window.devicePixelRatio || 1;

  replayCanvas.width  = Math.round(rpx * dpr);
  replayCanvas.height = Math.round(rpx * dpr);
  replayCanvas.style.display = 'block';
  statusEl.textContent = 'Generating replay...';

  const rctx = replayCanvas.getContext('2d');
  rctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const frames = [replayLog[0]];
  for (let i = 1; i < replayLog.length; i++) {
    if (JSON.stringify(replayLog[i]) !== JSON.stringify(replayLog[i - 1]))
      frames.push(replayLog[i]);
  }

  const totalMs = Math.min(10000, Math.max(5000, frames.length * 200));
  const delayMs = Math.max(50, Math.round(totalMs / frames.length));
  const lastDelay = 2000;

  function drawFrame(rectsSnap) {
    rctx.clearRect(0, 0, rpx, rpx);
    drawGrid(rctx, puzzle.size, rCell, 0, 0, rectsSnap, puzzle.clues,
      { dash: [2, 4], gridLw: 1, rectLw: 1.5, rectMargin: 1, shadow: false });
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

  const observer = new MutationObserver(() => {
    if ($('winModal').classList.contains('hidden')) {
      clearTimeout(replayTimer);
      observer.disconnect();
    }
  });
  observer.observe($('winModal'), { attributes: true, attributeFilter: ['class'] });
}

// ─── Share as Image ──────────────────────────────────────────────────────────
function shareAsImage() {
  const pad = 20;
  const header = 40;
  const footer = 30;
  const imgCell = Math.max(20, Math.min(40, Math.floor(600 / puzzle.size)));
  const gridPx = imgCell * puzzle.size;

  const totalW = gridPx + pad * 2;
  const totalH = gridPx + pad * 2 + header + footer;

  const dpr = window.devicePixelRatio || 1;
  const c = document.createElement('canvas');
  c.width = Math.round(totalW * dpr);
  c.height = Math.round(totalH * dpr);
  const cx = c.getContext('2d');
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);

  cx.fillStyle = '#0e1420';
  cx.fillRect(0, 0, totalW, totalH);

  cx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
  cx.fillStyle = '#e2e6f0';
  cx.textAlign = 'left';
  cx.textBaseline = 'middle';
  cx.fillText('Shikaku of the Instant', pad, pad + header / 2);
  cx.font = '13px "Segoe UI", Arial, sans-serif';
  cx.fillStyle = '#6b7f9a';
  cx.textAlign = 'right';
  cx.fillText(formatTime(timerMs), totalW - pad, pad + header / 2);

  const ox = pad, oy = pad + header;
  drawGrid(cx, puzzle.size, imgCell, ox, oy, userRects, puzzle.clues,
    { dash: [2, 4], gridLw: 1, rectLw: 2, rectMargin: 1.5, shadow: true });

  cx.font = '11px "Segoe UI", Arial, sans-serif';
  cx.fillStyle = '#4a5b72';
  cx.textAlign = 'left';
  const size = puzzle.size;
  const label = SIZE_LABELS[size] || '';
  cx.fillText(`${size}×${size}${label ? ' ' + label : ''}  ·  Seed: ${currentSeed}`, pad, oy + gridPx + footer / 2 + 4);

  c.toBlob(blob => {
    navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
      $('shareImageBtn').textContent = 'Copied!';
      setTimeout(() => $('shareImageBtn').textContent = 'Copy Image', 1500);
    }).catch(() => {
      const link = document.createElement('a');
      link.download = `shikaku_${currentSeed}.png`;
      link.href = c.toDataURL('image/png');
      link.click();
    });
  }, 'image/png');
}

// ─── Race Mode ────────────────────────────────────────────────────────────────
const RACE_STAGES = [
  { size: 5,  label: 'Easy' },
  { size: 10, label: 'Medium' },
  { size: 20, label: 'Hard' },
  { size: 30, label: 'Expert' },
  { size: 40, label: 'Master' },
];

let raceActive    = false;
let raceStage     = -1;
let raceSeed      = '';
let raceTimes     = [];
let raceSnapshots = [];
let raceBoards    = [];
let raceReviewIdx   = -1;
let raceReviewSource = 'results';

function makeRaceSeed() {
  return 'R' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
}

function stageSeed(raceSeed, stageIdx) {
  const stage = RACE_STAGES[stageIdx];
  const hash = Math.abs(hashString(raceSeed + '_stage' + stageIdx));
  return stage.size + '_' + String(hash % 1000000).padStart(6, '0');
}

function abandonRace() {
  raceActive = false;
  raceStage = -1;
  raceTimes = [];
  raceSnapshots = [];
  raceBoards = [];
  raceReviewIdx = -1;

  stopTimer();
  stopAnim();

  // Reset tab state
  $('difficultyTabs').classList.remove('race-mode');
  resetTabLabels();
  updateActiveDiffTab(currentSize);
}

function resetTabLabels() {
  document.querySelectorAll('.diff-tab').forEach(tab => {
    const size = parseInt(tab.dataset.size);
    const stageIdx = RACE_STAGES.findIndex(s => s.size === size);
    if (stageIdx === -1) return;
    const label = RACE_STAGES[stageIdx].label;
    tab.classList.remove('diff-tab-solved');
    tab.innerHTML = `${label}<span class="diff-sub">${size}\u00d7${size}</span>`;
  });
}

// ─── Non-linear race board management ────────────────────────────────────────
function initRaceBoards() {
  raceBoards = [];
  for (let i = 0; i < RACE_STAGES.length; i++) {
    const stage = RACE_STAGES[i];
    const seed = stageSeed(raceSeed, i);
    const p = generatePuzzle(stage.size, seed, activeGenerator);

    const rects = [];
    let ci = 0;
    const colors = getActiveColors();
    for (const clue of p.clues) {
      if (clue.area === 1) {
        const rect = { r: clue.r, c: clue.c, w: 1, h: 1 };
        Object.assign(rect, colors[ci++ % colors.length]);
        rects.push(rect);
      }
    }

    raceBoards.push({
      puzzle: p,
      userRects: rects,
      history: [],
      replayLog: [rects.map(r => ({ ...r }))],
      timerMs: 0,
      solved: false,
      _colorIdx: ci,
      started: false,
    });
  }
}

function saveCurrentBoard() {
  if (!raceActive || raceStage < 0 || !raceBoards[raceStage]) return;
  const board = raceBoards[raceStage];
  board.userRects = userRects.map(r => ({ ...r }));
  board.history = history;
  board.replayLog = replayLog;
  board.timerMs = timerMs;
  board.solved = solved;
  board._colorIdx = _colorIdx;
}

function loadBoard(idx) {
  stopTimer();
  stopAnim();

  if (raceStage >= 0 && raceBoards[raceStage]) {
    saveCurrentBoard();
  }

  raceStage = idx;
  const board = raceBoards[idx];
  const stage = RACE_STAGES[idx];

  currentSize = stage.size;

  puzzle    = board.puzzle;
  userRects = board.userRects.map(r => ({ ...r }));
  history   = board.history;
  replayLog = board.replayLog;
  _colorIdx = board._colorIdx;
  timerMs   = board.timerMs;
  solved    = board.solved;
  paused    = false;
  currentSeed = puzzle.seed;

  owner = makeOwner(puzzle.size);
  rebuildOwner();

  const t = formatTime(timerMs);
  $('topTimerDisplay').textContent = t;
  $('focusTimer').textContent = t;

  resizeCanvas();
  zoomLevelIdx = 0;
  fitToScreen();
  updateZoomLabel();

  // Always hide pause overlay
  $('pauseOverlay').classList.add('hidden');
  $('pauseOverlay').style.display = 'none';

  const cover = $('coverScreen');
  if (!board.started && !solved) {
    $('coverSize').textContent = `Stage ${idx + 1}/5: ${stage.label} (${stage.size}×${stage.size})`;
    $('coverSeed').textContent = `Race seed: ${raceSeed}`;
    cover.style.display = '';
    cover.classList.remove('hidden');
  } else {
    cover.classList.add('hidden');
    cover.style.display = 'none';
  }

  drawAll();

  if (!solved && board.started) {
    startTimer();
    if (userRects.some(r => getRectState(r) !== 'ok')) startAnim();
  }

  updateRaceTabs();
}

function updateRaceTabs() {
  // Update the difficulty tabs to reflect race stage progress
  document.querySelectorAll('.diff-tab').forEach(tab => {
    const size = parseInt(tab.dataset.size);
    const stageIdx = RACE_STAGES.findIndex(s => s.size === size);
    if (stageIdx === -1) return;

    const board = raceBoards[stageIdx];
    const isCurrent = stageIdx === raceStage;
    const isSolved = board && board.solved;
    const label = RACE_STAGES[stageIdx].label;

    tab.classList.toggle('active', isCurrent);
    tab.classList.toggle('diff-tab-solved', isSolved && !isCurrent);

    // Show checkmark on solved tabs
    tab.innerHTML = isSolved && !isCurrent
      ? `${label} \u2713<span class="diff-sub">${size}\u00d7${size}</span>`
      : `${label}<span class="diff-sub">${size}\u00d7${size}</span>`;
  });
}

function onRaceWin() {
  raceBoards[raceStage].timerMs = timerMs;
  raceBoards[raceStage].solved = true;
  raceBoards[raceStage].userRects = userRects.map(r => ({ ...r }));

  const allSolved = raceBoards.every(b => b.solved);

  if (allSolved) {
    raceTimes = raceBoards.map(b => b.timerMs);
    raceSnapshots = raceBoards.map(b => ({
      puzzle: b.puzzle,
      userRects: b.userRects.map(r => ({ ...r })),
    }));
    raceActive = false;
    endRace();
  } else {
    updateRaceTabs();
  }
}

function endRace() {
  // Reset tab state
  $('difficultyTabs').classList.remove('race-mode');
  resetTabLabels();
  updateActiveDiffTab(currentSize);

  // Build results
  const list = $('raceResultsList');
  list.innerHTML = '';
  let total = 0;
  for (let i = 0; i < RACE_STAGES.length; i++) {
    total += raceTimes[i];
    const seed = raceSnapshots[i] ? raceSnapshots[i].puzzle.seed : '';
    const row = document.createElement('div');
    row.className = 'race-result-row race-result-clickable';
    row.innerHTML =
      `<span class="race-result-name">${RACE_STAGES[i].label} (${RACE_STAGES[i].size}×${RACE_STAGES[i].size})</span>` +
      `<span class="race-result-time">${formatTime(raceTimes[i])}</span>` +
      `<button class="btn btn-secondary btn-sm race-link-btn" data-seed="${seed}" title="Copy link">&#x1F517;</button>`;
    row.addEventListener('click', (e) => {
      if (e.target.closest('.race-link-btn')) return;
      raceReviewSource = 'results';
      viewRaceBoard(i);
    });
    list.appendChild(row);
  }

  list.querySelectorAll('.race-link-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const seed = btn.dataset.seed;
      const url = window.location.origin + window.location.pathname + '#seed=' + seed;
      navigator.clipboard.writeText(url).then(() => {
        btn.textContent = '\u2713';
        setTimeout(() => btn.innerHTML = '&#x1F517;', 1500);
      });
    });
  });

  $('raceTotalTime').textContent = `Total: ${formatTime(total)}`;
  $('raceSeedDisplay').textContent = raceSeed;

  saveRaceToHistory();

  $('raceResultsModal').classList.remove('hidden');
}

function viewRaceBoard(idx) {
  if (!raceSnapshots[idx]) return;
  raceReviewIdx = idx;

  const snap = raceSnapshots[idx];
  const stage = RACE_STAGES[idx];

  currentSize = stage.size;

  puzzle    = snap.puzzle;
  userRects = snap.userRects.map(r => ({ ...r }));
  owner     = makeOwner(puzzle.size);
  rebuildOwner();
  solved    = true;
  currentSeed = puzzle.seed;

  resizeCanvas();
  zoomLevelIdx = 0;
  fitToScreen();
  updateZoomLabel();
  drawAll();

  const cover = $('coverScreen');
  cover.classList.add('hidden');
  cover.style.display = 'none';

  $('gameView').classList.remove('hidden');
  $('homeScreen').classList.add('hidden');
  updateReviewTabs();

  $('raceResultsModal').classList.add('hidden');
}

function updateReviewTabs() {
  const center = $('topBarCenter');

  // Highlight the reviewed stage tab, mark all as solved
  document.querySelectorAll('.diff-tab').forEach(tab => {
    const size = parseInt(tab.dataset.size);
    const stageIdx = RACE_STAGES.findIndex(s => s.size === size);
    if (stageIdx === -1) return;

    const isCurrent = stageIdx === raceReviewIdx;
    const label = RACE_STAGES[stageIdx].label;

    tab.classList.toggle('active', isCurrent);
    tab.classList.remove('diff-tab-solved');
    tab.innerHTML = `${label}<span class="diff-sub">${size}\u00d7${size}</span>`;
  });

  // Add review badge and Done button if not already present
  let badge = center.querySelector('.top-review-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'top-review-badge';
    badge.textContent = 'REVIEW';
    center.appendChild(badge);
  }

  let exitBtn = center.querySelector('#raceExitReview');
  if (!exitBtn) {
    exitBtn = document.createElement('button');
    exitBtn.id = 'raceExitReview';
    exitBtn.className = 'btn btn-secondary btn-sm';
    exitBtn.textContent = 'Done';
    exitBtn.style.marginLeft = '6px';
    exitBtn.addEventListener('click', exitRaceReview);
    center.appendChild(exitBtn);
  }
}

function exitRaceReview() {
  raceReviewIdx = -1;

  // Clean up review UI
  const center = $('topBarCenter');
  const badge = center.querySelector('.top-review-badge');
  if (badge) badge.remove();
  const exitBtn = center.querySelector('#raceExitReview');
  if (exitBtn) exitBtn.remove();

  resetTabLabels();
  updateActiveDiffTab(currentSize);

  if (raceReviewSource === 'history') {
    openRaceHistory();
  } else {
    $('raceResultsModal').classList.remove('hidden');
  }
}

// ─── Race History ─────────────────────────────────────────────────────────────
function loadRaceHistory() {
  try {
    return JSON.parse(localStorage.getItem('shikaku_race_history')) || [];
  } catch { return []; }
}

function saveRaceToHistory() {
  const hist = loadRaceHistory();
  let total = 0;
  for (const t of raceTimes) total += t;

  const stages = raceSnapshots.map((snap, i) => ({
    seed: snap.puzzle.seed,
    size: RACE_STAGES[i].size,
    label: RACE_STAGES[i].label,
    timeMs: raceTimes[i],
    userRects: snap.userRects,
  }));

  hist.unshift({
    raceSeed,
    date: new Date().toISOString(),
    totalMs: total,
    generator: activeGenerator,
    stages,
  });

  if (hist.length > 20) hist.length = 20;
  localStorage.setItem('shikaku_race_history', JSON.stringify(hist));
}

function openRaceHistory() {
  const hist = loadRaceHistory();
  const content = $('raceHistoryContent');

  if (hist.length === 0) {
    content.innerHTML = '<div class="stats-empty">No races completed yet.</div>';
    $('raceHistoryModal').classList.remove('hidden');
    return;
  }

  let html = '';
  for (let h = 0; h < hist.length; h++) {
    const race = hist[h];
    const date = new Date(race.date);
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    html += `<div class="race-history-entry">`;
    html += `<div class="race-history-header" data-race="${h}">`;
    html += `<div class="race-history-left">`;
    html += `<span class="race-history-date">${dateStr} ${timeStr}</span>`;
    html += `<span class="race-history-seed">Seed: ${race.raceSeed}</span>`;
    html += `</div>`;
    html += `<span class="race-result-time">${formatTime(race.totalMs)}</span>`;
    html += `</div>`;
    html += `<div class="race-history-stages hidden" id="raceHistoryStages_${h}">`;
    for (let s = 0; s < race.stages.length; s++) {
      const st = race.stages[s];
      html += `<div class="race-result-row race-result-clickable race-history-stage" data-race="${h}" data-stage="${s}">`;
      html += `<span class="race-result-name">${st.label} (${st.size}×${st.size})</span>`;
      html += `<span class="race-result-time">${formatTime(st.timeMs)}</span>`;
      html += `</div>`;
    }
    html += `</div></div>`;
  }

  content.innerHTML = html;

  content.querySelectorAll('.race-history-header').forEach(header => {
    header.addEventListener('click', () => {
      const idx = header.dataset.race;
      const stages = $('raceHistoryStages_' + idx);
      stages.classList.toggle('hidden');
      header.classList.toggle('expanded');
    });
  });

  content.querySelectorAll('.race-history-stage').forEach(row => {
    row.addEventListener('click', () => {
      const raceIdx = parseInt(row.dataset.race);
      const stageIdx = parseInt(row.dataset.stage);
      viewHistoryBoard(raceIdx, stageIdx);
    });
  });

  $('raceHistoryModal').classList.remove('hidden');
}

function viewHistoryBoard(raceIdx, stageIdx) {
  const hist = loadRaceHistory();
  const race = hist[raceIdx];
  if (!race || !race.stages[stageIdx]) return;

  const gen = race.generator || 'natural';

  raceSnapshots = race.stages.map(s => {
    const p = generatePuzzle(s.size, s.seed, gen);
    return { puzzle: p, userRects: s.userRects };
  });
  raceTimes = race.stages.map(s => s.timeMs);

  raceReviewSource = 'history';
  $('raceHistoryModal').classList.add('hidden');
  viewRaceBoard(stageIdx);
}

function buildShareText() {
  let total = 0;
  for (const t of raceTimes) total += t;

  let text = `Shikaku of the Instant — Race\n`;
  text += `---\n`;
  for (let i = 0; i < RACE_STAGES.length; i++) {
    const s = RACE_STAGES[i];
    text += `${s.size}x${s.size} ${s.label.padEnd(8)} ${formatTime(raceTimes[i])}\n`;
  }
  text += `---\n`;
  text += `Total: ${formatTime(total)}\n`;
  text += `Seed: ${raceSeed}`;
  return text;
}
