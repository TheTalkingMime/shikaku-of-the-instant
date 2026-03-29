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

const RECT_COLORS = [
  { fill: 'rgba(255,210,70,0.82)',  stroke: '#ffd246' },
  { fill: 'rgba(110,215,130,0.82)', stroke: '#6ed782' },
  { fill: 'rgba(130,190,255,0.82)', stroke: '#82beff' },
  { fill: 'rgba(255,150,170,0.82)', stroke: '#ff96aa' },
  { fill: 'rgba(200,165,255,0.82)', stroke: '#c8a5ff' },
  { fill: 'rgba(255,175,90,0.82)',  stroke: '#ffaf5a' },
  { fill: 'rgba(140,230,210,0.82)', stroke: '#8ce6d2' },
  { fill: 'rgba(255,215,150,0.82)', stroke: '#ffd796' },
];

const SIZE_LABELS = {
  5: 'Easy', 10: 'Medium', 20: 'Hard', 30: 'Expert', 40: 'Master',
};

const ZOOM_LEVELS = ['fit', 1, 1.25, 1.5, 2];

// ─── State ───────────────────────────────────────────────────────────────────

// Game state
let puzzle    = null;
let userRects = [];
let owner     = null;
let history   = [];
let replayLog = [];
let currentSeed = '';
let currentSize = 20;
let solved     = false;
let paused     = false;
let _colorIdx  = 0;

// View state
let zoom      = 1;
let cellPx    = CELL;
let zoomLevelIdx = 0;
let viewMode = 'home';  // 'home' | 'freeplay' | 'race'
let canvas, ctx;

// Timer state
let timerStart = null;
let timerMs    = 0;
let timerRAF   = null;

// Drag state
let dragging  = false;
let dragStart = null;
let dragEnd   = null;

// Animation state
let animRAF   = null;

// Replay state (full-board playback)
let replayActive = false;
let replayTimer  = null;
let replayFrames = null;
let replayFrame  = 0;
let replayPuzzle = null;
let replayCallback = null;  // called when replay is stopped
let winReplayLog = null;    // stored after win for "Watch Replay" button
let winReplayPuzzle = null;

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
  if (replayActive) { replayCallback = null; stopFullReplay(); }
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
  startHomeAnimation();
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

  let html = '<div class="home-recent-title">Recent Races</div>';
  for (let h = 0; h < hist.length; h++) {
    const race = hist[h];
    const date = new Date(race.date);
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    html += `<div class="race-history-entry">`;
    html += `<div class="race-history-header" data-race="${h}">`;
    html += `<div class="race-history-left">`;
    html += `<span class="race-history-date">${dateStr} ${timeStr}</span>`;
    html += `<span class="race-history-seed">Seed: ${race.raceSeed}</span>`;
    html += `</div>`;
    html += `<span class="race-result-time">${formatTime(race.totalMs)}</span>`;
    html += `</div>`;
    html += `<div class="race-history-stages hidden" id="homeRaceStages_${h}">`;
    for (let s = 0; s < race.stages.length; s++) {
      const st = race.stages[s];
      const hasReplay = st.replayLog && st.replayLog.length >= 2;
      html += `<div class="race-result-row race-result-clickable race-history-stage" data-race="${h}" data-stage="${s}">`;
      html += `<span class="race-result-name">${st.label}</span>`;
      html += `<span class="race-result-time">${formatTime(st.timeMs)}</span>`;
      if (hasReplay) html += `<button class="btn btn-secondary btn-sm race-replay-btn" data-race="${h}" data-stage="${s}" title="Replay">\u25B6</button>`;
      html += `</div>`;
    }
    html += `</div></div>`;
  }
  container.innerHTML = html;

  container.querySelectorAll('.race-history-header').forEach(header => {
    header.addEventListener('click', () => {
      const idx = header.dataset.race;
      const stages = $('homeRaceStages_' + idx);
      const wasExpanded = header.classList.contains('expanded');

      // Collapse all others first (accordion)
      container.querySelectorAll('.race-history-header.expanded').forEach(h => {
        h.classList.remove('expanded');
        const s = $('homeRaceStages_' + h.dataset.race);
        if (s) s.classList.add('hidden');
      });

      // Toggle the clicked one
      if (!wasExpanded) {
        stages.classList.remove('hidden');
        header.classList.add('expanded');
      }
    });
  });

  container.querySelectorAll('.race-history-stage').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.race-replay-btn')) return;
      const raceIdx = parseInt(row.dataset.race);
      const stageIdx = parseInt(row.dataset.stage);
      viewHistoryBoard(raceIdx, stageIdx);
    });
  });

  container.querySelectorAll('.race-replay-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const raceIdx = parseInt(btn.dataset.race);
      const stageIdx = parseInt(btn.dataset.stage);
      showHistoryReplay(raceIdx, stageIdx);
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

      if (replayActive) return;

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
  $('watchReplayBtn').addEventListener('click', () => {
    if (!winReplayLog || winReplayLog.length < 2) return;
    $('winModal').classList.add('hidden');
    const savedPuzzle = winReplayPuzzle;
    const savedRects = userRects.map(r => ({ ...r }));
    startFullReplay(savedPuzzle, winReplayLog, () => {
      // Restore solved board state when replay stops
      puzzle = savedPuzzle;
      userRects = savedRects;
      rebuildOwner();
      solved = true;
      drawAll();
    });
  });

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
    if (e.key === 'Escape' && replayActive) { stopFullReplay(); return; }
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
  $('homeStatsBtn').addEventListener('click', openStats);
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
    if (solved || replayActive) return;
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

  // --- URL hash routing ---
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('preview=')) {
    showHomeScreen();
    openPreview(hash.replace('preview=', ''));
  } else if (hash.startsWith('seed=')) {
    const hashSeed = hash.replace('seed=', '');
    if (hashSeed.includes('_')) {
      showGameView('freeplay');
      prepareNewGame(hashSeed);
      updateActiveDiffTab(currentSize);
    } else {
      showHomeScreen();
    }
  } else {
    showHomeScreen();
  }
});

// ─── Dev preview mode ─────────────────────────────────────────────────────────
function openPreview(name) {
  const modals = {
    'how':      'howToModal',
    'win':      'winModal',
    'race':     'raceResultsModal',
    'stats':    'statsModal',
  };
  const id = modals[name];
  if (!id) { console.warn('Unknown preview:', name); return; }

  // Populate mock data for modals that need it
  if (name === 'race') populateRacePreview();
  if (name === 'win') populateWinPreview();
  if (name === 'stats') populateStatsPreview();

  $(id).classList.remove('hidden');
}

function populateRacePreview() {
  const mockTimes = [5910, 11340, 82590, 65880, 192440];
  const list = $('raceResultsList');
  list.innerHTML = '';
  let total = 0;
  for (let i = 0; i < RACE_STAGES.length; i++) {
    total += mockTimes[i];
    const row = document.createElement('div');
    row.className = 'race-result-row race-result-clickable';
    row.innerHTML =
      `<span class="race-result-name">${RACE_STAGES[i].label}</span>` +
      `<span class="race-result-time">${formatTime(mockTimes[i])}</span>` +
      `<button class="btn btn-secondary btn-sm race-action-btn race-replay-btn" title="Replay">\u25B6</button>` +
      `<button class="btn btn-secondary btn-sm race-action-btn race-link-btn" title="Copy link">&#x1F517;</button>`;
    list.appendChild(row);
  }
  $('raceTotalTime').textContent = `Total: ${formatTime(total)}`;
  $('raceSeedDisplay').textContent = 'T1774739853';
}

function populateWinPreview() {
  const win = $('winModal');
  const h2 = win.querySelector('h2');
  if (h2) h2.textContent = 'Solved!';
  const time = win.querySelector('.win-time');
  if (time) time.textContent = '00:42.15';
}

function populateStatsPreview() {
  openStats();
}

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
  puzzle      = generatePuzzle(size, seedStr || undefined);
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
  if (solved || replayActive || !timerStart) return;
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
function nextRectColor() {
  return RECT_COLORS[_colorIdx++ % RECT_COLORS.length];
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

    cx.strokeStyle = 'rgba(0,0,0,0.55)';
    cx.lineCap = 'round';

    if (isValid) {
      // Happy smile :)
      const mouthR = faceR * 0.25;
      cx.lineWidth = Math.max(1.5, faceR * 0.07);
      cx.beginPath();
      cx.arc(centerX, centerY + faceR * 0.08, mouthR, 0.15 * Math.PI, 0.85 * Math.PI);
      cx.stroke();
    } else {
      // Angry face >:(
      // Eyebrows angled down toward center
      const browLen = eyeR * 2.2;
      const browY = centerY - eyeOffsetY - eyeR * 2.2;
      cx.lineWidth = Math.max(2, faceR * 0.1);
      cx.beginPath();
      cx.moveTo(centerX - eyeSpacing - browLen * 0.6, browY - browLen * 0.35);
      cx.lineTo(centerX - eyeSpacing + browLen * 0.4, browY + browLen * 0.35);
      cx.stroke();
      cx.beginPath();
      cx.moveTo(centerX + eyeSpacing + browLen * 0.6, browY - browLen * 0.35);
      cx.lineTo(centerX + eyeSpacing - browLen * 0.4, browY + browLen * 0.35);
      cx.stroke();

      // Angry frown
      const mouthR = faceR * 0.22;
      cx.lineWidth = Math.max(1.5, faceR * 0.08);
      cx.beginPath();
      cx.arc(centerX, centerY + faceR * 0.45, mouthR, 1.2 * Math.PI, 1.8 * Math.PI);
      cx.stroke();
    }
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

  drawFaces(ctx, userRects, px);

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
  if (e.button !== 0 || paused || solved || replayActive) return;
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
  if (paused || solved || replayActive) return;
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
  if (solved || replayActive || userRects.length === 0) return;
  history.push({ type: 'clearAll', rects: [...userRects] });
  userRects = [];
  rebuildOwner();
  replayLog.push([]);
  stopAnim();
  drawAll();
}

function undo() {
  if (solved || replayActive || history.length === 0) return;
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
  // Store replay data for the watch button
  winReplayLog = replayLog.slice();
  winReplayPuzzle = puzzle;
  setTimeout(() => {
    $('winModal').classList.remove('hidden');
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

// Strip colors and sample frames for compact localStorage storage
function compactReplayLog(log) {
  if (!log || log.length < 2) return [];
  // Deduplicate identical consecutive frames
  const unique = [log[0]];
  for (let i = 1; i < log.length; i++) {
    if (JSON.stringify(log[i]) !== JSON.stringify(log[i - 1]))
      unique.push(log[i]);
  }
  // Sample down to max 30 frames
  const maxFrames = 30;
  let sampled;
  if (unique.length <= maxFrames) {
    sampled = unique;
  } else {
    sampled = [unique[0]];
    for (let i = 1; i < maxFrames - 1; i++) {
      const idx = Math.round(i * (unique.length - 1) / (maxFrames - 1));
      sampled.push(unique[idx]);
    }
    sampled.push(unique[unique.length - 1]);
  }
  // Strip color info, keep only geometry
  return sampled.map(frame =>
    frame.map(r => ({ r: r.r, c: r.c, w: r.w, h: r.h }))
  );
}

// Re-apply colors to a compact replay log
function recolorReplayLog(log) {
  return log.map(frame =>
    frame.map((r, i) => ({ ...r, ...RECT_COLORS[i % RECT_COLORS.length] }))
  );
}

// ─── Full-board replay system ─────────────────────────────────────────────────
function dedupeFrames(log) {
  const frames = [log[0]];
  for (let i = 1; i < log.length; i++) {
    if (JSON.stringify(log[i]) !== JSON.stringify(log[i - 1]))
      frames.push(log[i]);
  }
  return frames;
}

function startFullReplay(p, log, onStop) {
  if (replayActive) stopFullReplay();

  // Re-colorize if needed (stored replays strip colors)
  const firstNonEmpty = log.find(f => f.length > 0);
  if (firstNonEmpty && !firstNonEmpty[0].fill) {
    log = recolorReplayLog(log);
  }

  const frames = dedupeFrames(log);
  if (frames.length < 2) return;

  // Set up the main canvas for this puzzle
  replayPuzzle = p;
  replayFrames = frames;
  replayFrame = 0;
  replayActive = true;
  replayCallback = onStop || null;

  puzzle = p;
  currentSize = p.size;

  // Make sure game view is showing
  $('homeScreen').classList.add('hidden');
  $('gameView').classList.remove('hidden');

  // Hide cover/pause overlays
  const cover = $('coverScreen');
  cover.classList.add('hidden');
  cover.style.display = 'none';
  $('pauseOverlay').classList.add('hidden');
  $('pauseOverlay').style.display = 'none';

  // Size canvas
  resizeCanvas();
  zoomLevelIdx = 0;
  fitToScreen();
  updateZoomLabel();

  // Show replay overlay bar
  showReplayBar();

  // Calculate timing
  const totalMs = Math.min(10000, Math.max(5000, frames.length * 200));
  const delayMs = Math.max(50, Math.round(totalMs / frames.length));
  const lastDelay = 2000;

  function drawReplayFrame(rectsSnap) {
    const s = p.size;
    const px = cellPx;
    const W = px * s;

    ctx.clearRect(0, 0, W, W);
    drawGridBase(ctx, s, px, 0, 0, [3, 5], 1.5);

    for (const rect of rectsSnap) {
      const m = 2;
      ctx.beginPath();
      ctx.rect(rect.c * px + m, rect.r * px + m, rect.w * px - m * 2, rect.h * px - m * 2);
      ctx.fillStyle = rect.fill;
      ctx.fill();
      ctx.strokeStyle = rect.stroke;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    drawFaces(ctx, rectsSnap.filter(r => getRectStateForPuzzle(r, p) === 'ok'), px);

    const fontSize = Math.max(9, Math.round(px * 0.38));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
    for (const clue of p.clues) {
      const cx_ = (clue.numC + 0.5) * px;
      const cy_ = (clue.numR + 0.5) * px;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillText(String(clue.area), cx_ + 1, cy_ + 1);
      ctx.fillStyle = COLOR.num;
      ctx.fillText(String(clue.area), cx_, cy_);
    }

    // Update progress bar
    const bar = $('replayProgress');
    if (bar) bar.style.width = Math.round((replayFrame / (frames.length - 1)) * 100) + '%';
  }

  function animate() {
    if (!replayActive) return;
    drawReplayFrame(frames[replayFrame]);
    replayFrame++;
    if (replayFrame >= frames.length) {
      replayTimer = setTimeout(() => { replayFrame = 0; animate(); }, lastDelay);
    } else {
      replayTimer = setTimeout(animate, delayMs);
    }
  }
  animate();
}

function getRectStateForPuzzle(rect, p) {
  const cluesInside = p.clues.filter(cl =>
    cl.numR >= rect.r && cl.numR < rect.r + rect.h &&
    cl.numC >= rect.c && cl.numC < rect.c + rect.w
  );
  if (cluesInside.length !== 1) return 'err';
  return rect.w * rect.h === cluesInside[0].area ? 'ok' : 'err';
}

function stopFullReplay() {
  if (!replayActive) return;
  replayActive = false;
  if (replayTimer) { clearTimeout(replayTimer); replayTimer = null; }
  hideReplayBar();
  const cb = replayCallback;
  replayCallback = null;
  replayFrames = null;
  replayPuzzle = null;
  if (cb) cb();
}

function showReplayBar() {
  let bar = $('replayBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'replayBar';
    bar.innerHTML = `
      <div class="replay-bar-inner">
        <span class="replay-bar-label">Replay</span>
        <div class="replay-progress-track"><div class="replay-progress-fill" id="replayProgress"></div></div>
        <button class="btn btn-secondary btn-sm" id="replayStopBtn">Stop</button>
      </div>`;
    $('mainArea').appendChild(bar);
    $('replayStopBtn').addEventListener('click', stopFullReplay);
  }
  bar.classList.remove('hidden');
}

function hideReplayBar() {
  const bar = $('replayBar');
  if (bar) bar.classList.add('hidden');
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
    tab.textContent = label;
  });
}

// ─── Non-linear race board management ────────────────────────────────────────
function initRaceBoards() {
  raceBoards = [];
  for (let i = 0; i < RACE_STAGES.length; i++) {
    const stage = RACE_STAGES[i];
    const seed = stageSeed(raceSeed, i);
    const p = generatePuzzle(stage.size, seed);

    const rects = [];
    let ci = 0;
    for (const clue of p.clues) {
      if (clue.area === 1) {
        const rect = { r: clue.r, c: clue.c, w: 1, h: 1 };
        Object.assign(rect, RECT_COLORS[ci++ % RECT_COLORS.length]);
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
    $('coverSize').textContent = `Stage ${idx + 1}/5: ${stage.label}`;
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
    tab.textContent = isSolved && !isCurrent ? `${label} \u2713` : label;
  });
}

function onRaceWin() {
  raceBoards[raceStage].timerMs = timerMs;
  raceBoards[raceStage].solved = true;
  raceBoards[raceStage].userRects = userRects.map(r => ({ ...r }));
  raceBoards[raceStage].replayLog = replayLog;

  const allSolved = raceBoards.every(b => b.solved);

  if (allSolved) {
    raceTimes = raceBoards.map(b => b.timerMs);
    raceSnapshots = raceBoards.map(b => ({
      puzzle: b.puzzle,
      userRects: b.userRects.map(r => ({ ...r })),
      replayLog: b.replayLog,
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
    const hasReplay = raceSnapshots[i] && raceSnapshots[i].replayLog && raceSnapshots[i].replayLog.length >= 2;
    row.innerHTML =
      `<span class="race-result-name">${RACE_STAGES[i].label}</span>` +
      `<span class="race-result-time">${formatTime(raceTimes[i])}</span>` +
      (hasReplay ? `<button class="btn btn-secondary btn-sm race-action-btn race-replay-btn" data-stage="${i}" title="Replay">\u25B6</button>` : '') +
      `<button class="btn btn-secondary btn-sm race-action-btn race-link-btn" data-seed="${seed}" title="Copy link">&#x1F517;</button>`;
    row.addEventListener('click', (e) => {
      if (e.target.closest('.race-link-btn') || e.target.closest('.race-replay-btn')) return;
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

  list.querySelectorAll('.race-replay-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const stageIdx = parseInt(btn.dataset.stage);
      showRaceReplay(stageIdx);
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

  // Remove old replay button so updateReviewTabs creates a fresh one for this stage
  const oldReplayBtn = $('topBarCenter').querySelector('#raceReplayBtn');
  if (oldReplayBtn) oldReplayBtn.remove();

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
    tab.textContent = label;
  });

  // Add review badge and Done button if not already present
  let badge = center.querySelector('.top-review-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'top-review-badge';
    badge.textContent = 'REVIEW';
    center.appendChild(badge);
  }

  // Add Replay button if replay data exists
  let replayBtn = center.querySelector('#raceReplayBtn');
  if (!replayBtn) {
    const snap = raceSnapshots[raceReviewIdx];
    const hasReplay = snap && snap.replayLog && snap.replayLog.length >= 2;
    if (hasReplay) {
      replayBtn = document.createElement('button');
      replayBtn.id = 'raceReplayBtn';
      replayBtn.className = 'btn btn-secondary btn-sm';
      replayBtn.textContent = '\u25B6 Replay';
      replayBtn.style.marginLeft = '6px';
      replayBtn.addEventListener('click', () => showRaceReplay(raceReviewIdx));
      center.appendChild(replayBtn);
    }
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
  const replayBtn = center.querySelector('#raceReplayBtn');
  if (replayBtn) replayBtn.remove();
  const exitBtn = center.querySelector('#raceExitReview');
  if (exitBtn) exitBtn.remove();

  resetTabLabels();
  updateActiveDiffTab(currentSize);

  if (raceReviewSource === 'history') {
    showHomeScreen();
  } else {
    $('raceResultsModal').classList.remove('hidden');
  }
}

function showRaceReplay(stageIdx) {
  const snap = raceSnapshots[stageIdx];
  if (!snap || !snap.replayLog || snap.replayLog.length < 2) return;

  const p = snap.puzzle;

  // Hide modals before starting replay
  $('raceResultsModal').classList.add('hidden');

  startFullReplay(p, snap.replayLog, () => {
    // When replay stops, show the race results modal again
    $('raceResultsModal').classList.remove('hidden');
  });
}

function showHistoryReplay(raceIdx, stageIdx) {
  const hist = loadRaceHistory();
  const race = hist[raceIdx];
  if (!race || !race.stages[stageIdx]) return;
  const st = race.stages[stageIdx];
  if (!st.replayLog || st.replayLog.length < 2) return;

  const p = generatePuzzle(st.size, st.seed);
  startFullReplay(p, st.replayLog, () => {
    showHomeScreen();
  });
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
    replayLog: compactReplayLog(snap.replayLog || []),
  }));

  hist.unshift({
    raceSeed,
    date: new Date().toISOString(),
    totalMs: total,
    stages,
  });

  if (hist.length > 10) hist.length = 10;
  localStorage.setItem('shikaku_race_history', JSON.stringify(hist));
}

function viewHistoryBoard(raceIdx, stageIdx) {
  const hist = loadRaceHistory();
  const race = hist[raceIdx];
  if (!race || !race.stages[stageIdx]) return;

  raceSnapshots = race.stages.map(s => {
    const p = generatePuzzle(s.size, s.seed);
    return {
      puzzle: p,
      userRects: s.userRects,
      replayLog: s.replayLog || [],
    };
  });
  raceTimes = race.stages.map(s => s.timeMs);

  raceReviewSource = 'history';
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

// ─── Home Screen Illustration ─────────────────────────────────────────────────
let homeAnimRAF = null;

function startHomeAnimation() {
  if (homeAnimRAF) return; // already running

  const c = $('homeIllustration');
  if (!c) return;

  const dpr = window.devicePixelRatio || 1;
  const size = 160;
  const gridSize = 5;
  const cellPx = size / gridSize;

  c.width = Math.round(size * dpr);
  c.height = Math.round(size * dpr);

  const cx = c.getContext('2d');
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // A pre-solved 5×5 puzzle
  const rects = [
    { r: 0, c: 0, w: 3, h: 2 },
    { r: 0, c: 3, w: 2, h: 1 },
    { r: 1, c: 3, w: 1, h: 2 },
    { r: 1, c: 4, w: 1, h: 1 },
    { r: 2, c: 0, w: 2, h: 2 },
    { r: 2, c: 2, w: 1, h: 3 },
    { r: 2, c: 4, w: 1, h: 1 },
    { r: 3, c: 3, w: 2, h: 2 },
    { r: 4, c: 0, w: 2, h: 1 },
  ];

  // Clue numbers (area of each rect, placed roughly in center)
  const clues = rects.map(rect => ({
    numR: rect.r + Math.floor(rect.h / 2),
    numC: rect.c + Math.floor(rect.w / 2),
    area: rect.w * rect.h,
  }));

  const colors = RECT_COLORS;

  const rectDelay = 320;
  const holdTime = 2200;
  const fadeTime = 500;
  const pauseTime = 900;
  const totalRectTime = rects.length * rectDelay;
  const cycleTime = totalRectTime + holdTime + fadeTime + pauseTime;

  let startTime = performance.now();

  function draw() {
    // Stop if home screen is hidden
    if ($('homeScreen').classList.contains('hidden')) {
      homeAnimRAF = null;
      return;
    }

    const elapsed = (performance.now() - startTime) % cycleTime;

    cx.clearRect(0, 0, size, size);

    // Grid background
    for (let r = 0; r < gridSize; r++)
      for (let col = 0; col < gridSize; col++) {
        cx.fillStyle = (r + col) % 2 === 0 ? COLOR.cellA : COLOR.cellB;
        cx.fillRect(col * cellPx, r * cellPx, cellPx, cellPx);
      }

    // Grid lines
    cx.strokeStyle = 'rgba(255,255,255,0.18)';
    cx.lineWidth = 0.5;
    cx.setLineDash([2, 3]);
    for (let i = 1; i < gridSize; i++) {
      cx.beginPath();
      cx.moveTo(i * cellPx, 0); cx.lineTo(i * cellPx, size);
      cx.moveTo(0, i * cellPx); cx.lineTo(size, i * cellPx);
      cx.stroke();
    }
    cx.setLineDash([]);

    // Fade phase
    let globalAlpha = 1;
    if (elapsed > totalRectTime + holdTime) {
      const fadeElapsed = elapsed - totalRectTime - holdTime;
      globalAlpha = fadeElapsed < fadeTime ? 1 - fadeElapsed / fadeTime : 0;
    }

    // Draw rects one by one
    const visibleCount = Math.min(rects.length, Math.floor(elapsed / rectDelay) + 1);
    for (let i = 0; i < visibleCount; i++) {
      const rect = rects[i];
      const color = colors[i % colors.length];
      const rectAge = elapsed - i * rectDelay;
      const alpha = Math.min(1, rectAge / 180) * globalAlpha;

      cx.globalAlpha = alpha;
      const m = 1.5;
      cx.fillStyle = color.fill;
      cx.fillRect(rect.c * cellPx + m, rect.r * cellPx + m, rect.w * cellPx - m * 2, rect.h * cellPx - m * 2);
      cx.strokeStyle = color.stroke;
      cx.lineWidth = 1.5;
      cx.strokeRect(rect.c * cellPx + m, rect.r * cellPx + m, rect.w * cellPx - m * 2, rect.h * cellPx - m * 2);

      // Happy faces on rects large enough
      {
        const rw = rect.w * cellPx;
        const rh = rect.h * cellPx;
        const minDim = Math.min(rw, rh);
        if (minDim >= 22) {
          const fcx = rect.c * cellPx + rw / 2;
          const fcy = rect.r * cellPx + rh / 2;
          const fr = minDim * 0.28;
          const er = Math.max(1.2, fr * 0.12);
          const esp = fr * 0.3;
          const eoy = fr * 0.15;

          cx.fillStyle = 'rgba(0,0,0,0.5)';
          cx.beginPath(); cx.arc(fcx - esp, fcy - eoy, er, 0, Math.PI * 2); cx.fill();
          cx.beginPath(); cx.arc(fcx + esp, fcy - eoy, er, 0, Math.PI * 2); cx.fill();

          cx.strokeStyle = 'rgba(0,0,0,0.5)';
          cx.lineWidth = Math.max(1, fr * 0.06);
          cx.lineCap = 'round';
          cx.beginPath();
          cx.arc(fcx, fcy + fr * 0.06, fr * 0.2, 0.15 * Math.PI, 0.85 * Math.PI);
          cx.stroke();
        }
      }
    }

    // Clue numbers
    if (globalAlpha > 0) {
      const fontSize = Math.max(8, Math.round(cellPx * 0.38));
      cx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
      cx.textAlign = 'center';
      cx.textBaseline = 'middle';
      for (let i = 0; i < visibleCount; i++) {
        const clue = clues[i];
        const rectAge = elapsed - i * rectDelay;
        const alpha = Math.min(1, rectAge / 180) * globalAlpha;
        cx.globalAlpha = alpha;

        const lx = (clue.numC + 0.5) * cellPx;
        const ly = (clue.numR + 0.5) * cellPx;
        cx.fillStyle = 'rgba(0,0,0,0.45)';
        cx.fillText(String(clue.area), lx + 0.5, ly + 0.5);
        cx.fillStyle = '#fff';
        cx.fillText(String(clue.area), lx, ly);
      }
    }

    cx.globalAlpha = 1;
    homeAnimRAF = requestAnimationFrame(draw);
  }

  homeAnimRAF = requestAnimationFrame(draw);
}
