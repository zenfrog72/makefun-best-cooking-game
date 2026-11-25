// WARUNG RUSH — render.js
// Every pixel is drawn in code: warm warung walls, tiled backsplash,
// flaming wok, grill smoke, chopping board, customers with moods,
// and the order board. No image files.

import { INGREDIENTS, STATIONS } from './recipes.js';
import { LAYOUT, ticketRect, crateRect, shelfSlotRect, stationCenter } from './state.js';

export const W = 1280;
export const H = 720;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align = 'left', weight = 'bold', font = 'Arial') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function patienceColor(f) { return f > 0.5 ? '#2ecc71' : f > 0.25 ? '#f39c12' : '#e74c3c'; }

function moodOf(ticket) {
  const f = ticket.patience / ticket.maxPatience;
  return f > 0.5 ? 'happy' : f > 0.25 ? 'worried' : 'angry';
}

// ---- ingredient icons (vector, drawn fresh each frame) ----
export function drawIngredient(ctx, id, x, y, s, cooked = false) {
  ctx.save();
  ctx.translate(x, y);
  const u = s / 40;
  if (id === 'rice') {
    ctx.fillStyle = cooked ? '#f8ecd0' : '#fdf6e3';
    ctx.beginPath(); ctx.ellipse(0, 6 * u, 17 * u, 10 * u, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8d5a8';
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(i * 6 * u, -2 * u + (i % 2) * 3 * u, 3 * u, 2 * u, 0, 0, Math.PI * 2); ctx.fill(); }
    if (cooked) { ctx.fillStyle = '#e07840'; ctx.fillRect(-10 * u, 2 * u, 5 * u, 3 * u); ctx.fillStyle = '#4da34d'; ctx.fillRect(4 * u, 0, 5 * u, 3 * u); }
  } else if (id === 'noodle') {
    ctx.strokeStyle = '#f7c948'; ctx.lineWidth = 4 * u; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-15 * u, (-6 + i * 7) * u);
      ctx.bezierCurveTo(-5 * u, (-12 + i * 7) * u, 5 * u, (0 + i * 7) * u, 15 * u, (-6 + i * 7) * u);
      ctx.stroke();
    }
    if (cooked) { ctx.fillStyle = '#4da34d'; ctx.beginPath(); ctx.arc(8 * u, -8 * u, 3 * u, 0, Math.PI * 2); ctx.fill(); }
  } else if (id === 'chicken') {
    ctx.fillStyle = cooked ? '#a34d1e' : '#e07840';
    ctx.beginPath(); ctx.ellipse(-3 * u, 0, 13 * u, 10 * u, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f5e6c4'; ctx.lineWidth = 4 * u; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(8 * u, 6 * u); ctx.lineTo(16 * u, 13 * u); ctx.stroke();
    ctx.fillStyle = '#f5e6c4'; ctx.beginPath(); ctx.arc(17 * u, 14 * u, 3.5 * u, 0, Math.PI * 2); ctx.fill();
    if (cooked) { ctx.strokeStyle = '#5e2c0e'; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.moveTo(-12 * u, -4 * u); ctx.lineTo(-2 * u, 4 * u); ctx.moveTo(-8 * u, -8 * u); ctx.lineTo(2 * u, 0); ctx.stroke(); }
  } else if (id === 'egg') {
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath(); ctx.ellipse(0, 0, 16 * u, 12 * u, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = cooked ? '#f0a832' : '#f7c948';
    ctx.beginPath(); ctx.arc(2 * u, 0, 7 * u, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(0, -2 * u, 3 * u, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'chili') {
    ctx.strokeStyle = '#e23b2e'; ctx.lineWidth = 7 * u; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-12 * u, -8 * u); ctx.quadraticCurveTo(2 * u, 12 * u, 14 * u, -6 * u); ctx.stroke();
    ctx.strokeStyle = '#2c6b2c'; ctx.lineWidth = 4 * u;
    ctx.beginPath(); ctx.moveTo(-12 * u, -8 * u); ctx.lineTo(-16 * u, -14 * u); ctx.stroke();
  } else if (id === 'greens') {
    ctx.fillStyle = '#4da34d';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.ellipse((-10 + i * 10) * u, (i % 2 ? 3 : -3) * u, 8 * u, 5 * u, (i - 1) * 0.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#2c6b2c'; ctx.lineWidth = 2 * u;
    ctx.beginPath(); ctx.moveTo(-14 * u, 8 * u); ctx.lineTo(14 * u, 8 * u); ctx.stroke();
  } else if (id === 'tea') {
    ctx.fillStyle = '#a8642a';
    ctx.beginPath(); ctx.moveTo(-11 * u, -6 * u); ctx.lineTo(11 * u, -6 * u); ctx.lineTo(8 * u, 12 * u); ctx.lineTo(-8 * u, 12 * u); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#a8642a'; ctx.lineWidth = 3 * u;
    ctx.beginPath(); ctx.arc(13 * u, 2 * u, 6 * u, -1.2, 1.2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2 * u;
    ctx.beginPath(); ctx.moveTo(-4 * u, -10 * u); ctx.quadraticCurveTo(-7 * u, -15 * u, -4 * u, -19 * u); ctx.stroke();
  } else if (id === 'ice') {
    ctx.fillStyle = 'rgba(191,232,245,0.95)';
    ctx.fillRect(-12 * u, -8 * u, 11 * u, 11 * u);
    ctx.fillRect(1 * u, 0, 11 * u, 11 * u);
    ctx.strokeStyle = '#5fa8c4'; ctx.lineWidth = 1.5 * u;
    ctx.strokeRect(-12 * u, -8 * u, 11 * u, 11 * u);
    ctx.strokeRect(1 * u, 0, 11 * u, 11 * u);
    ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-10 * u, -6 * u); ctx.lineTo(-4 * u, 0); ctx.stroke();
  }
  if (cooked) {
    ctx.strokeStyle = '#f7c948'; ctx.lineWidth = 2 * u;
    ctx.beginPath(); ctx.arc(0, 0, 19 * u, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function drawCustomerFace(ctx, look, mood, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  // body
  ctx.fillStyle = look.shirt;
  rr(ctx, -r, r * 0.55, r * 2, r * 1.1, r * 0.4); ctx.fill();
  // head
  ctx.fillStyle = look.skin;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  // hair
  ctx.fillStyle = look.hair;
  ctx.beginPath(); ctx.arc(0, -r * 0.25, r * 0.95, Math.PI, 0); ctx.fill();
  ctx.fillRect(-r, -r * 0.3, r * 0.5, r * 0.35);
  ctx.fillRect(r * 0.5, -r * 0.3, r * 0.5, r * 0.35);
  // eyes
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.05, r * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.05, r * 0.09, 0, Math.PI * 2); ctx.fill();
  if (mood === 'angry') {
    ctx.strokeStyle = '#222'; ctx.lineWidth = r * 0.09;
    ctx.beginPath(); ctx.moveTo(-r * 0.55, -r * 0.35); ctx.lineTo(-r * 0.15, -r * 0.18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 0.55, -r * 0.35); ctx.lineTo(r * 0.15, -r * 0.18); ctx.stroke();
  }
  // mouth
  ctx.strokeStyle = '#7a3b1e'; ctx.lineWidth = r * 0.1; ctx.lineCap = 'round';
  ctx.beginPath();
  if (mood === 'happy') { ctx.arc(0, r * 0.3, r * 0.35, 0.15 * Math.PI, 0.85 * Math.PI); }
  else if (mood === 'worried') { ctx.arc(0, r * 0.75, r * 0.3, 1.15 * Math.PI, 1.85 * Math.PI); }
  else if (mood === 'angry') { ctx.arc(0, r * 0.85, r * 0.35, 1.15 * Math.PI, 1.85 * Math.PI); }
  else { ctx.moveTo(-r * 0.25, r * 0.45); ctx.lineTo(r * 0.25, r * 0.45); }
  ctx.stroke();
  ctx.restore();
}

function drawFlame(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y);
  const flick = 1 + Math.sin(t * 9 + x) * 0.12;
  ctx.fillStyle = '#ff9d00';
  ctx.beginPath();
  ctx.moveTo(0, -22 * s * flick);
  ctx.quadraticCurveTo(12 * s, -6 * s, 8 * s, 6 * s);
  ctx.quadraticCurveTo(0, 12 * s, -8 * s, 6 * s);
  ctx.quadraticCurveTo(-12 * s, -6 * s, 0, -22 * s * flick);
  ctx.fill();
  ctx.fillStyle = '#ffe66d';
  ctx.beginPath();
  ctx.moveTo(0, -12 * s * flick);
  ctx.quadraticCurveTo(6 * s, -2 * s, 4 * s, 6 * s);
  ctx.quadraticCurveTo(0, 9 * s, -4 * s, 6 * s);
  ctx.quadraticCurveTo(-6 * s, -2 * s, 0, -12 * s * flick);
  ctx.fill();
  ctx.restore();
}

function drawProgressBar(ctx, x, y, w, h, frac, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  rr(ctx, x, y, w, h, h / 2); ctx.fill();
  ctx.fillStyle = color;
  if (frac > 0.02) { rr(ctx, x + 1, y + 1, Math.max(4, (w - 2) * frac), h - 2, (h - 2) / 2); ctx.fill(); }
}

// ---- main draw ----
export function drawGame(ctx, game) {
  const t = game.time;
  ctx.save();
  if (game.shake > 0) ctx.translate((Math.random() - 0.5) * game.shake * 24, (Math.random() - 0.5) * game.shake * 24);

  drawBackground(ctx, t);
  drawTopbar(ctx, game);
  drawOrderBoard(ctx, game, t);
  drawCustomers(ctx, game, t);
  drawStations(ctx, game, t);
  drawShelf(ctx, game);
  drawCrates(ctx, game);
  drawHand(ctx, game);
  drawParticles(ctx, game);
  drawFloaters(ctx, game);
  drawBanner(ctx, game);
  drawOverlays(ctx, game);
  ctx.restore();
}

function drawBackground(ctx, t) {
  // Warm terracotta wall
  const g = ctx.createLinearGradient(0, 0, 0, 720);
  g.addColorStop(0, '#c96f3f');
  g.addColorStop(0.45, '#d98a52');
  g.addColorStop(1, '#8a4b2a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1280, 720);
  // Tile backsplash band
  ctx.fillStyle = '#2e6f6a';
  ctx.fillRect(0, 168, 1280, 22);
  ctx.fillStyle = '#3d8a84';
  for (let x = 0; x < 1280; x += 46) ctx.fillRect(x + 2, 170, 42, 18);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let x = 0; x < 1280; x += 46) ctx.fillRect(x + 2, 170, 42, 3);
  // Floor
  ctx.fillStyle = '#6b3a22'; ctx.fillRect(0, 688, 1280, 32);
  ctx.fillStyle = '#7d4527';
  for (let x = 0; x < 1280; x += 80) ctx.fillRect(x, 688, 2, 32);
  // Hanging lamps
  for (const lx of [180, 640, 1100]) {
    ctx.strokeStyle = '#3a2415'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, 34); ctx.stroke();
    const glow = ctx.createRadialGradient(lx, 52, 4, lx, 52, 60);
    glow.addColorStop(0, 'rgba(255,220,130,0.5)');
    glow.addColorStop(1, 'rgba(255,220,130,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(lx, 52, 60, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f7c948';
    ctx.beginPath(); ctx.moveTo(lx - 16, 40); ctx.lineTo(lx + 16, 40); ctx.lineTo(lx + 10, 58); ctx.lineTo(lx - 10, 58); ctx.closePath(); ctx.fill();
  }
}

function drawTopbar(ctx, game) {
  ctx.fillStyle = '#1e1008';
  ctx.fillRect(0, 0, 1280, 56);
  text(ctx, '🍜 WARUNG RUSH', 18, 30, 26, '#f7c948');
  // Cash
  ctx.fillStyle = '#1d2b1d';
  rr(ctx, 300, 10, 190, 36, 18); ctx.fill();
  ctx.strokeStyle = '#f7c948'; ctx.lineWidth = 2;
  rr(ctx, 300, 10, 190, 36, 18); ctx.stroke();
  text(ctx, `$ ${game.cash}`, 395, 29, 22, '#f7c948', 'center');
  // Combo
  if (game.combo > 1) {
    ctx.fillStyle = '#e74c3c';
    rr(ctx, 500, 10, 130, 36, 18); ctx.fill();
    text(ctx, `COMBO x${game.combo}`, 565, 29, 20, '#fff', 'center');
  }
  // Shift + timer
  const mm = Math.floor(Math.max(0, game.shiftTime) / 60);
  const ss = Math.floor(Math.max(0, game.shiftTime) % 60).toString().padStart(2, '0');
  text(ctx, `SHIFT ${game.shift}/3`, 700, 29, 20, '#fff');
  drawProgressBar(ctx, 800, 18, 220, 20, Math.max(0, game.shiftTime) / 90, game.shiftTime < 20 ? '#e74c3c' : '#2ecc71');
  text(ctx, `⏱ ${mm}:${ss}`, 1040, 29, 20, '#fff');
  text(ctx, `🍽 ${game.served} served`, 1160, 29, 18, '#bfe8f5');
}

function drawOrderBoard(ctx, game, t) {
  ctx.fillStyle = '#5a3a1e';
  rr(ctx, LAYOUT.board.x - 6, LAYOUT.board.y - 6, LAYOUT.board.w + 12, LAYOUT.board.h + 12, 10); ctx.fill();
  ctx.fillStyle = '#7a4f27';
  rr(ctx, LAYOUT.board.x - 6, LAYOUT.board.y - 6, LAYOUT.board.w + 12, LAYOUT.board.h + 12, 10); ctx.stroke();
  ctx.fillStyle = '#f5e6c4';
  ctx.font = 'bold 13px Arial'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('— ORDERS —', LAYOUT.board.x + 4, LAYOUT.board.y + 2);
  game.tickets.forEach((ticket, i) => {
    const r = ticketRect(i);
    const f = ticket.patience / ticket.maxPatience;
    ctx.fillStyle = ticket.done ? '#d5f5e3' : '#fdf6e3';
    rr(ctx, r.x, r.y + 8, r.w, r.h - 8, 8); ctx.fill();
    ctx.strokeStyle = f < 0.25 ? '#e74c3c' : '#c9a86a'; ctx.lineWidth = 2;
    rr(ctx, r.x, r.y + 8, r.w, r.h - 8, 8); ctx.stroke();
    drawCustomerFace(ctx, ticket.look, moodOf(ticket), r.x + 24, r.y + 34, 15);
    text(ctx, ticket.recipe.short, r.x + 44, r.y + 26, 15, '#2c1a0e');
    text(ctx, `$${ticket.recipe.price}`, r.x + r.w - 8, r.y + 26, 13, '#8a6d3b', 'right');
    // checklist
    ticket.recipe.needs.forEach((need, j) => {
      const done = !ticket.remaining.has(need);
      const cx = r.x + 16 + j * 52;
      const cy = r.y + 56;
      ctx.fillStyle = done ? '#2ecc71' : '#d8cbb0';
      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
      if (done) text(ctx, '✓', cx, cy + 1, 12, '#fff', 'center');
      drawIngredient(ctx, need, cx + 24, cy, 22, done);
    });
    // patience bar
    drawProgressBar(ctx, r.x + 10, r.y + r.h - 16, r.w - 20, 8, f, patienceColor(f));
  });
  if (game.tickets.length === 0 && game.passPlates.length === 0) {
    text(ctx, 'No orders yet — get ready!', LAYOUT.board.x + 200, LAYOUT.board.y + 55, 15, '#ffe9b0', 'center', 'normal', 'italic');
  }
}

function drawCustomers(ctx, game, t) {
  const box = LAYOUT.customers;
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  rr(ctx, box.x, box.y, box.w, box.h, 10); ctx.fill();
  text(ctx, 'CUSTOMERS WAITING', box.x + 12, box.y + 14, 12, '#ffe9b0');
  const people = [...game.tickets, ...game.passPlates];
  people.forEach((ticket, i) => {
    const x = box.x + 60 + i * 120;
    const y = box.y + 62;
    const bob = Math.sin(t * 2 + i * 1.7) * 2;
    drawCustomerFace(ctx, ticket.look, ticket.done ? 'happy' : moodOf(ticket), x, y + bob, 26);
    text(ctx, ticket.look.name, x, box.y + 96, 11, '#fff', 'center', 'normal');
  });
  if (people.length === 0) text(ctx, '— empty —', box.x + box.w / 2, box.y + 55, 14, '#ffe9b0', 'center', 'normal', 'italic');
}

function drawStations(ctx, game, t) {
  const S = LAYOUT.stations;
  drawWok(ctx, game, S.wok, t);
  drawGrill(ctx, game, S.grill, t);
  drawChop(ctx, game, S.chop, t);
  drawPot(ctx, game, S.pot, t);
  drawPass(ctx, game, S.pass, t);
}

function stationBase(ctx, r, title, color) {
  ctx.fillStyle = '#3d2b1a';
  rr(ctx, r.x, r.y, r.w, r.h, 12); ctx.fill();
  ctx.fillStyle = color;
  rr(ctx, r.x, r.y, r.w, 30, 12); ctx.fill();
  ctx.fillStyle = color; ctx.fillRect(r.x, r.y + 18, r.w, 12);
  text(ctx, title, r.x + r.w / 2, r.y + 15, 15, '#fff', 'center');
}

function stationJobBar(ctx, st, x, y, w) {
  if (!st.job) return;
  const frac = Math.min(1, st.job.t / st.job.total);
  if (st.job.done) {
    const pulse = 0.6 + Math.sin(Date.now() / 120) * 0.4;
    ctx.fillStyle = `rgba(46,204,113,${pulse})`;
    rr(ctx, x, y, w, 22, 11); ctx.fill();
    text(ctx, 'DONE! CLICK TO TAKE', x + w / 2, y + 11, 13, '#fff', 'center');
  } else {
    drawProgressBar(ctx, x, y, w, 16, frac, '#f7c948');
    text(ctx, `${Math.ceil(st.job.total - st.job.t)}s`, x + w / 2, y + 8, 12, '#fff', 'center');
  }
}

function drawWok(ctx, game, r, t) {
  stationBase(ctx, r, '🔥 WOK', STATIONS.wok.color);
  const cx = r.x + r.w / 2, cy = r.y + 150;
  const st = game.stations.wok;
  const cooking = st.job && !st.job.done;
  if (cooking) { drawFlame(ctx, cx - 40, cy + 28, 1.1, t); drawFlame(ctx, cx + 40, cy + 28, 0.9, t + 2); }
  // stove
  ctx.fillStyle = '#222'; rr(ctx, cx - 70, cy + 22, 140, 16, 6); ctx.fill();
  // wok pan
  ctx.fillStyle = '#4a4a4a';
  ctx.beginPath(); ctx.ellipse(cx, cy + 14, 78, 26, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#666';
  ctx.beginPath(); ctx.ellipse(cx, cy + 10, 78, 24, 0, Math.PI, 0); ctx.fill();
  if (st.job) drawIngredient(ctx, st.job.ing, cx, cy - 2, 52, st.job.done);
  if (st.burnt) {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(cx, cy + 6, 60, 18, 0, 0, Math.PI * 2); ctx.fill();
    text(ctx, 'BURNT! CLICK TO CLEAN', cx, r.y + 62, 13, '#e74c3c', 'center');
    drawSmoke(ctx, cx, cy - 20, t);
  }
  stationJobBar(ctx, st, r.x + 14, r.y + 196, r.w - 28);
  text(ctx, 'Rice · Noodles · Egg', cx, r.y + 226, 12, '#d8cbb0', 'center', 'normal');
}

function drawGrill(ctx, game, r, t) {
  stationBase(ctx, r, '🍢 GRILL', STATIONS.grill.color);
  const cx = r.x + r.w / 2, cy = r.y + 150;
  const st = game.stations.grill;
  // coals
  ctx.fillStyle = '#3a1a10'; rr(ctx, cx - 80, cy + 6, 160, 34, 8); ctx.fill();
  const glow = 0.5 + Math.sin(t * 5) * 0.2;
  ctx.fillStyle = `rgba(255,110,30,${glow})`;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(cx - 60 + i * 30, cy + 24, 7, 0, Math.PI * 2); ctx.fill(); }
  // grate
  ctx.strokeStyle = '#888'; ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(cx - 80, cy - 8 + i * 8); ctx.lineTo(cx + 80, cy - 8 + i * 8); ctx.stroke(); }
  if (st.job) {
    // skewers
    for (let i = -1; i <= 1; i++) {
      ctx.strokeStyle = '#d8cbb0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx + i * 34 - 40, cy - 26); ctx.lineTo(cx + i * 34 + 40, cy - 26); ctx.stroke();
      drawIngredient(ctx, st.job.ing, cx + i * 34, cy - 26, 34, st.job.done);
    }
    drawSmoke(ctx, cx, cy - 40, t);
  }
  if (st.burnt) { text(ctx, 'BURNT! CLICK TO CLEAN', cx, r.y + 62, 13, '#e74c3c', 'center'); drawSmoke(ctx, cx, cy - 30, t); }
  stationJobBar(ctx, st, r.x + 14, r.y + 196, r.w - 28);
  text(ctx, 'Grilled chicken', cx, r.y + 226, 12, '#d8cbb0', 'center', 'normal');
}

function drawChop(ctx, game, r, t) {
  stationBase(ctx, r, '🔪 CHOPPING BOARD', STATIONS.chop.color);
  const cx = r.x + r.w / 2, cy = r.y + 150;
  const st = game.stations.chop;
  // wooden board
  ctx.fillStyle = '#c9a86a'; rr(ctx, cx - 85, cy - 10, 170, 70, 10); ctx.fill();
  ctx.strokeStyle = '#8a6d3b'; ctx.lineWidth = 3; rr(ctx, cx - 85, cy - 10, 170, 70, 10); ctx.stroke();
  if (st.job) {
    const frac = Math.min(1, st.job.t / st.job.total);
    drawIngredient(ctx, st.job.ing, cx - 10, cy + 18, 44, st.job.done);
    if (!st.job.done) {
      // knife mid-chop
      const chopY = cy - 30 + Math.sin(t * 14) * 8;
      ctx.save(); ctx.translate(cx + 55, chopY); ctx.rotate(0.5);
      ctx.fillStyle = '#ddd'; ctx.fillRect(-6, -26, 12, 44);
      ctx.fillStyle = '#5a3a1e'; ctx.fillRect(-6, 18, 12, 16);
      ctx.restore();
    }
  } else {
    ctx.fillStyle = '#8a6d3b';
    ctx.beginPath(); ctx.ellipse(cx, cy + 20, 30, 8, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (st.burnt) text(ctx, 'CLICK TO CLEAN', cx, r.y + 62, 13, '#e74c3c', 'center');
  stationJobBar(ctx, st, r.x + 14, r.y + 196, r.w - 28);
  text(ctx, 'Chili · Greens', cx, r.y + 226, 12, '#d8cbb0', 'center', 'normal');
}

function drawPot(ctx, game, r, t) {
  stationBase(ctx, r, '🍵 TEAPOT', STATIONS.pot.color);
  const cx = r.x + r.w / 2, cy = r.y + 150;
  const st = game.stations.pot;
  // kettle
  ctx.fillStyle = '#7a5c9e';
  ctx.beginPath(); ctx.moveTo(cx - 45, cy + 30); ctx.lineTo(cx + 45, cy + 30); ctx.lineTo(cx + 38, cy - 20); ctx.lineTo(cx - 38, cy - 20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9370b8';
  ctx.beginPath(); ctx.ellipse(cx, cy - 20, 38, 12, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#5a3a7a'; ctx.beginPath(); ctx.arc(cx, cy - 26, 8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#7a5c9e'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(cx + 42, cy - 6); ctx.quadraticCurveTo(cx + 70, cy - 20, cx + 62, cy - 40); ctx.stroke();
  if (st.job) drawSteam(ctx, cx, cy - 44, t);
  if (st.job) drawIngredient(ctx, st.job.ing, cx, cy + 8, 36, st.job.done);
  if (st.burnt) text(ctx, 'CLICK TO CLEAN', cx, r.y + 62, 13, '#e74c3c', 'center');
  stationJobBar(ctx, st, r.x + 14, r.y + 196, r.w - 28);
  text(ctx, 'Hot tea', cx, r.y + 226, 12, '#d8cbb0', 'center', 'normal');
}

function drawPass(ctx, game, r, t) {
  stationBase(ctx, r, '🍽️ SERVING WINDOW', '#2e8b57');
  const cx = r.x + r.w / 2;
  // serving window
  ctx.fillStyle = '#f5e6c4';
  rr(ctx, r.x + 12, r.y + 44, r.w - 24, 130, 8); ctx.fill();
  ctx.strokeStyle = '#8a6d3b'; ctx.lineWidth = 3;
  rr(ctx, r.x + 12, r.y + 44, r.w - 24, 130, 8); ctx.stroke();
  if (game.passPlates.length === 0) {
    text(ctx, 'Ready plates', cx, r.y + 100, 14, '#8a6d3b', 'center', 'normal', 'italic');
    text(ctx, 'will appear here', cx, r.y + 122, 14, '#8a6d3b', 'center', 'normal', 'italic');
  } else {
    game.passPlates.forEach((ticket, i) => {
      const px = r.x + 40 + i * 84;
      const py = r.y + 108;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(px, py, 34, 24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(px, py, 34, 24, 0, 0, Math.PI * 2); ctx.stroke();
      // dish art on the plate
      ticket.recipe.needs.forEach((need, j) => {
        drawIngredient(ctx, need, px - 16 + j * 16, py - 2, 26, true);
      });
      const pulse = 0.6 + Math.sin(t * 6 + i) * 0.4;
      ctx.fillStyle = `rgba(46,204,113,${pulse})`;
      rr(ctx, px - 34, py + 26, 68, 20, 10); ctx.fill();
      text(ctx, 'SERVE!', px, py + 36, 11, '#fff', 'center');
    });
  }
  text(ctx, 'Click a plate / ticket to serve', cx, r.y + 210, 12, '#d8cbb0', 'center', 'normal');
  text(ctx, 'Finished orders → plates appear here', cx, r.y + 228, 11, '#a89a7a', 'center', 'normal');
}

function drawSmoke(ctx, x, y, t) {
  ctx.save();
  ctx.fillStyle = 'rgba(200,200,200,0.45)';
  for (let i = 0; i < 3; i++) {
    const yy = y - ((t * 22 + i * 18) % 54);
    const xx = x + Math.sin(t * 2 + i * 2.1) * 8 + (i - 1) * 10;
    ctx.beginPath(); ctx.arc(xx, yy, 7 + i * 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawSteam(ctx, x, y, t) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    const bx = x - 8 + i * 16;
    ctx.moveTo(bx, y);
    ctx.quadraticCurveTo(bx + Math.sin(t * 3 + i) * 6, y - 12, bx + Math.sin(t * 3 + i + 1) * 8, y - 24);
    ctx.stroke();
  }
  ctx.restore();
}

function drawShelf(ctx, game) {
  const s = LAYOUT.shelf;
  text(ctx, 'READY SHELF — click an item to add it to an order', s.x, s.y - 8, 13, '#ffe9b0');
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  rr(ctx, s.x - 6, s.y - 4, s.w + 12, s.h + 8, 8); ctx.fill();
  game.shelf.forEach((ing, i) => {
    const r = shelfSlotRect(i);
    ctx.fillStyle = '#fdf6e3';
    rr(ctx, r.x, r.y, r.w, r.h, 8); ctx.fill();
    ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 2;
    rr(ctx, r.x, r.y, r.w, r.h, 8); ctx.stroke();
    drawIngredient(ctx, ing, r.x + r.w / 2, r.y + r.h / 2, 40, true);
  });
  for (let i = game.shelf.length; i < 8; i++) {
    const r = shelfSlotRect(i);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    rr(ctx, r.x, r.y, r.w, r.h, 8); ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawCrates(ctx, game) {
  const c = LAYOUT.crates;
  text(ctx, 'INGREDIENTS — click / press 1–8 to grab', c.x, c.y - 8, 13, '#ffe9b0');
  const order = ['rice', 'noodle', 'chicken', 'egg', 'chili', 'greens', 'tea', 'ice'];
  order.forEach((id, i) => {
    const r = crateRect(i);
    const ing = INGREDIENTS[id];
    const held = game.hand === id;
    ctx.fillStyle = held ? '#ffe9b0' : '#8a5a2e';
    rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
    ctx.strokeStyle = held ? '#f7c948' : '#5a3a1e'; ctx.lineWidth = held ? 4 : 2;
    rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.stroke();
    drawIngredient(ctx, id, r.x + r.w / 2, r.y + 46, 54);
    const labelColor = held ? '#2c1a0e' : '#fff';
    const subColor = held ? '#7a5c1e' : '#ffd98a';
    text(ctx, ing.name, r.x + r.w / 2, r.y + 96, 16, labelColor, 'center');
    const stName = ing.station ? STATIONS[ing.station].name : 'DIRECT';
    text(ctx, stName, r.x + r.w / 2, r.y + 116, 11, subColor, 'center', 'normal');
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.arc(r.x + 18, r.y + 18, 12, 0, Math.PI * 2); ctx.fill();
    text(ctx, ing.key, r.x + 18, r.y + 19, 14, '#fff', 'center');
  });
}

function drawHand(ctx, game) {
  if (!game.hand) return;
  text(ctx, `Holding: ${INGREDIENTS[game.hand].name} → ${INGREDIENTS[game.hand].station ? 'take to the ' + STATIONS[INGREDIENTS[game.hand].station].name : 'straight to the shelf'}`, 640, 712, 14, '#ffe9b0', 'center', 'normal');
}

function drawParticles(ctx, game) {
  for (const p of game.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFloaters(ctx, game) {
  for (const f of game.floaters) {
    ctx.globalAlpha = Math.min(1, f.life);
    text(ctx, f.text, f.x, f.y, 20, f.color, 'center');
  }
  ctx.globalAlpha = 1;
}

function drawBanner(ctx, game) {
  if (!game.banner) return;
  const a = Math.min(1, game.banner.t);
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 280, 1280, 110);
  text(ctx, game.banner.text, 640, 322, 40, '#f7c948', 'center');
  text(ctx, game.banner.sub, 640, 362, 18, '#fff', 'center', 'normal');
  ctx.globalAlpha = 1;
}

function drawOverlays(ctx, game) {
  if (game.phase === 'title') {
    ctx.fillStyle = 'rgba(20,10,4,0.82)';
    ctx.fillRect(0, 0, 1280, 720);
    text(ctx, '🍜', 640, 130, 90, '#fff', 'center');
    text(ctx, 'WARUNG RUSH', 640, 215, 72, '#f7c948', 'center');
    text(ctx, 'The busiest street-food stall in town!', 640, 268, 22, '#fff', 'center', 'normal');
    const steps = [
      '1. Grab ingredients from the crates (click / keys 1–8)',
      '2. Cook at the right station — Wok, Grill, Chopping Board, Teapot',
      '3. Cooked items go to the shelf — click to fill orders, serve before customers leave!',
      'Careful: food left on the stove will BURN.',
    ];
    steps.forEach((s, i) => text(ctx, s, 640, 320 + i * 34, 19, '#ffe9b0', 'center', 'normal'));
    const pulse = 0.6 + Math.sin(game.time * 4) * 0.4;
    ctx.globalAlpha = pulse;
    text(ctx, '▶ CLICK OR PRESS ENTER TO OPEN THE STALL', 640, 500, 24, '#2ecc71', 'center');
    ctx.globalAlpha = 1;
    text(ctx, '3 shifts · busier every night · combos raise prices', 640, 545, 16, '#bfe8f5', 'center', 'normal');
    text(ctx, 'Mouse + keyboard · P pause · M music', 640, 575, 14, '#aaa', 'center', 'normal');
  } else if (game.phase === 'shiftend') {
    // banner already shows; dim the kitchen slightly
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, 1280, 720);
  } else if (game.phase === 'over') {
    ctx.fillStyle = 'rgba(20,10,4,0.88)';
    ctx.fillRect(0, 0, 1280, 720);
    text(ctx, '🌙 CLOSING TIME!', 640, 180, 56, '#f7c948', 'center');
    text(ctx, 'The stall is closed — customers went home full.', 640, 235, 20, '#fff', 'center', 'normal');
    const rows = [
      ['Cash today', `$ ${game.cash}`],
      ['Plates served', `${game.served}`],
      ['Customers left', `${game.missed}`],
      ['Best combo', `x${game.bestCombo}`],
    ];
    rows.forEach(([label, val], i) => {
      const y = 300 + i * 48;
      text(ctx, label, 480, y, 22, '#ffe9b0', 'left', 'normal');
      text(ctx, val, 800, y, 24, '#fff', 'right');
    });
    const pulse = 0.6 + Math.sin(game.time * 4) * 0.4;
    ctx.globalAlpha = pulse;
    text(ctx, '▶ PRESS R TO OPEN AGAIN TOMORROW', 640, 540, 24, '#2ecc71', 'center');
    ctx.globalAlpha = 1;
  }
  if (game.paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, 1280, 720);
    text(ctx, '⏸ PAUSED', 640, 340, 48, '#fff', 'center');
    text(ctx, 'Press P to continue', 640, 400, 20, '#ffe9b0', 'center', 'normal');
  }
}
