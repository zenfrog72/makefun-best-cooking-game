// WARUNG RUSH — main.js
// Bootstrap, game loop, mouse + keyboard input, screenshot staging.
// The canvas is fixed at 1280x720 internally and scales to the window.

import { WarungGame, PHASE, LAYOUT, ticketRect, crateRect, shelfSlotRect } from './state.js';
import { INGREDIENTS, INGREDIENT_ORDER, STATIONS } from './recipes.js';
import { SoundBank } from './audio.js';
import { drawGame, W, H } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const sound = new SoundBank();
const game = new WarungGame(sound);

// Screenshot staging: ?shot=cover|assembly|rush|score builds a fixed
// scene from the real game state, so the maker's screenshots are true
// renders of the game's own code.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  game.stageShot(shot);
} else {
  game.phase = PHASE.TITLE;
}

// Exposed for the maker's playtest / screenshot scripts only.
window.WARUNG = { game, sound };

function toCanvas(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * W,
    y: ((e.clientY - rect.top) / rect.height) * H,
  };
}

function inside(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

function handleClick(p) {
  sound.ensure();
  if (game.phase === PHASE.TITLE) { game.startGame(); return; }
  if (game.phase === PHASE.OVER) { game.startGame(); return; }
  if (game.phase !== PHASE.PLAYING) return;

  // 1. Ready plates at the pass window — serve them.
  const pass = LAYOUT.stations.pass;
  if (inside(p, pass) && game.passPlates.length > 0) {
    game.serveTicket(game.passPlates[0]);
    return;
  }
  // 2. Tickets on the board — click a completed one to serve it.
  for (let i = 0; i < game.tickets.length; i++) {
    if (inside(p, ticketRect(i))) {
      const t = game.tickets[i];
      if (t.done) game.serveTicket(t);
      return;
    }
  }
  // 3. Stations.
  for (const key of ['wok', 'grill', 'chop', 'pot']) {
    if (inside(p, LAYOUT.stations[key])) {
      game.useStation(key);
      return;
    }
  }
  // 4. Ready shelf — attach a cooked component to a waiting ticket.
  for (let i = 0; i < game.shelf.length; i++) {
    if (inside(p, shelfSlotRect(i))) { game.clickShelf(i); return; }
  }
  // 5. Ingredient crates — pick up (ice goes straight to the shelf).
  for (let i = 0; i < INGREDIENT_ORDER.length; i++) {
    if (inside(p, crateRect(i))) {
      const id = INGREDIENT_ORDER[i];
      if (INGREDIENTS[id].station === null) {
        game.hand = id;
        game.useDirect(id);
      } else {
        game.selectIngredient(id);
      }
      return;
    }
  }
}

canvas.addEventListener('click', (e) => handleClick(toCanvas(e)));

window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (game.phase === PHASE.TITLE || game.phase === PHASE.OVER)) {
    game.startGame();
    return;
  }
  if (e.key === 'r' || e.key === 'R') {
    if (game.phase === PHASE.OVER) game.startGame();
    return;
  }
  if (e.key === 'p' || e.key === 'P') {
    if (game.phase === PHASE.PLAYING) { game.paused = !game.paused; }
    return;
  }
  if (e.key === 'm' || e.key === 'M') { sound.toggleMusic(); return; }
  if (e.key === 'Escape') { game.hand = null; return; }
  if (game.phase !== PHASE.PLAYING || game.paused) return;
  const ing = INGREDIENT_ORDER.find((id) => INGREDIENTS[id].key === e.key);
  if (ing) {
    if (INGREDIENTS[ing].station === null) { game.hand = ing; game.useDirect(ing); }
    else game.selectIngredient(ing);
    return;
  }
  const stationKeys = { q: 'wok', w: 'grill', e: 'chop', r: 'pot' };
  const st = stationKeys[e.key.toLowerCase()];
  if (st) game.useStation(st);
});

// ---- game loop ----
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!game.paused) game.update(dt);
  drawGame(ctx, game);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Resize the canvas element to fit the window while keeping 16:9.
function fit() {
  const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.style.width = `${Math.floor(W * scale)}px`;
  canvas.style.height = `${Math.floor(H * scale)}px`;
}
window.addEventListener('resize', fit);
fit();
