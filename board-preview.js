/**
 * Renders solved Shikaku boards to canvas elements for documentation pages.
 * Requires generator.js to be loaded first.
 */

const PREVIEW_COLORS = [
  { fill: 'rgba(91,143,212,0.72)',  stroke: '#7aaee8' },
  { fill: 'rgba(210,130,55,0.75)',  stroke: '#e8a060' },
  { fill: 'rgba(175,65,65,0.75)',   stroke: '#e07070' },
  { fill: 'rgba(130,75,185,0.75)',  stroke: '#b088e0' },
  { fill: 'rgba(80,155,65,0.75)',   stroke: '#80cc60' },
  { fill: 'rgba(175,160,45,0.75)',  stroke: '#d4c445' },
  { fill: 'rgba(55,160,160,0.75)',  stroke: '#55d0d0' },
  { fill: 'rgba(185,75,130,0.75)',  stroke: '#e080b8' },
];

function renderSolvedBoard(canvas, size, algorithm, seed) {
  const puzzle = generatePuzzle(size, seed, algorithm);
  const ctx = canvas.getContext('2d');
  const cellPx = Math.floor(canvas.width / size);
  const W = cellPx * size;
  canvas.width = W;
  canvas.height = W;

  // Background
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#1a2840' : '#192538';
      ctx.fillRect(c * cellPx, r * cellPx, cellPx, cellPx);
    }

  // Dotted grid
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  for (let i = 1; i < size; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellPx, 0); ctx.lineTo(i * cellPx, W);
    ctx.moveTo(0, i * cellPx); ctx.lineTo(W, i * cellPx);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Colored rectangles
  puzzle.clues.forEach((clue, i) => {
    const col = PREVIEW_COLORS[i % PREVIEW_COLORS.length];
    const m = 2;
    const x = clue.c * cellPx + m;
    const y = clue.r * cellPx + m;
    const rw = clue.w * cellPx - m * 2;
    const rh = clue.h * cellPx - m * 2;
    ctx.fillStyle = col.fill;
    ctx.fillRect(x, y, rw, rh);
    ctx.strokeStyle = col.stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, rw, rh);
  });

  // Clue numbers
  const fontSize = Math.max(9, Math.round(cellPx * 0.38));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
  for (const clue of puzzle.clues) {
    const cx = (clue.numC + 0.5) * cellPx;
    const cy = (clue.numR + 0.5) * cellPx;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(String(clue.area), cx + 1, cy + 1);
    ctx.fillStyle = '#fff';
    ctx.fillText(String(clue.area), cx, cy);
  }

  return puzzle;
}

function renderBoardSet(containerId, size, algorithm, seeds) {
  const container = document.getElementById(containerId);
  if (!container) return;
  seeds.forEach(seed => {
    const wrap = document.createElement('div');
    wrap.className = 'board-example';

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    canvas.style.width = '100%';
    canvas.style.maxWidth = '400px';
    canvas.style.borderRadius = '6px';
    wrap.appendChild(canvas);

    const puzzle = renderSolvedBoard(canvas, size, algorithm, seed);

    const info = document.createElement('div');
    info.className = 'board-info';
    info.innerHTML = `<span class="board-seed">Seed: ${puzzle.seed}</span>` +
      `<span class="board-stats">${puzzle.clues.length} rectangles &middot; ` +
      `areas ${Math.min(...puzzle.clues.map(c=>c.area))}&ndash;${Math.max(...puzzle.clues.map(c=>c.area))}</span>`;
    wrap.appendChild(info);

    container.appendChild(wrap);
  });
}
