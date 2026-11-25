// WARUNG RUSH — state.js
// The whole game model: shifts, tickets, stations, hand, shelf,
// combos and cash. Rendering lives in render.js; input in main.js.

import { INGREDIENTS, RECIPES, recipeById, pickRecipe, stationForIngredient } from './recipes.js';

export const PHASE = { TITLE: 'title', PLAYING: 'playing', SHIFT_END: 'shiftend', OVER: 'over' };
export const SHIFT_LEN = 90;
export const MAX_TICKETS = 4;
export const BURN_WINDOW = 5;

// Fixed layout, shared by render and input (canvas is 1280x720).
export const LAYOUT = {
  topbar: { x: 0, y: 0, w: 1280, h: 56 },
  board: { x: 16, y: 64, w: 688, h: 104 },
  ticket: { w: 166, h: 100, gap: 8 },
  customers: { x: 720, y: 64, w: 544, h: 104 },
  stations: {
    wok:   { x: 24,  y: 190, w: 228, h: 240 },
    grill: { x: 268, y: 190, w: 228, h: 240 },
    chop:  { x: 512, y: 190, w: 228, h: 240 },
    pot:   { x: 756, y: 190, w: 228, h: 240 },
    pass:  { x: 1000, y: 190, w: 256, h: 240 },
  },
  shelf: { x: 24, y: 446, w: 1232, h: 58, slot: 56, gap: 6 },
  crates: { x: 16, y: 548, w: 148, h: 132, gap: 8 },
};

const CUSTOMER_LOOKS = [
  { skin: '#f2c89b', shirt: '#e74c3c', hair: '#2c1a0e', name: 'Mrs. Tini' },
  { skin: '#e8b88a', shirt: '#3498db', hair: '#111111', name: 'Mr. Budi' },
  { skin: '#d9a06b', shirt: '#27ae60', hair: '#4a2c14', name: 'Miss Sari' },
  { skin: '#f5d0a9', shirt: '#f39c12', hair: '#6e3f16', name: 'Mr. Joko' },
  { skin: '#c98d5f', shirt: '#8e44ad', hair: '#1a1a1a', name: 'Miss Rina' },
  { skin: '#eec39a', shirt: '#16a085', hair: '#3a2a18', name: 'Mr. Dedi' },
];

export class WarungGame {
  constructor(sound) {
    this.sound = sound;
    this.reset();
  }

  reset() {
    this.phase = PHASE.TITLE;
    this.shift = 1;
    this.shiftTime = SHIFT_LEN;
    this.cash = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.served = 0;
    this.missed = 0;
    this.hand = null; // ingredient id in hand
    this.shelf = []; // cooked ingredient ids, max 8
    this.tickets = []; // {recipe, remaining:Set, patience, maxPatience, look, done}
    this.passPlates = []; // tickets completed, waiting to be served
    this.stations = {
      wok:   { id: 'wok',   job: null, burnt: false, burnLeft: 0 },
      grill: { id: 'grill', job: null, burnt: false, burnLeft: 0 },
      chop:  { id: 'chop',  job: null, burnt: false, burnLeft: 0 },
      pot:   { id: 'pot',   job: null, burnt: false, burnLeft: 0 },
    };
    this.spawnTimer = 3;
    this.particles = [];
    this.floaters = []; // {x,y,text,life,color}
    this.banner = null; // {text, sub, t}
    this.shake = 0;
    this.time = 0;
    this.sizzleOn = false;
  }

  startGame() {
    this.reset();
    this.phase = PHASE.PLAYING;
    this.startShift(1);
    this.sound.startMusic();
  }

  startShift(n) {
    this.shift = n;
    this.shiftTime = SHIFT_LEN;
    this.spawnTimer = 2.5;
    const names = ['', 'SHIFT 1 — LUNCH', 'SHIFT 2 — AFTERNOON', 'SHIFT 3 — DINNER RUSH!'];
    this.banner = { text: names[n] || `SHIFT ${n}`, sub: n === 3 ? 'Rush hour! Orders come in faster' : 'New orders coming in...', t: 2.4 };
    if (n === 3) this.sound.rush();
  }

  spawnInterval() { return this.shift === 1 ? 13 : this.shift === 2 ? 10.5 : 8; }
  patienceFor() { return this.shift === 1 ? 52 : this.shift === 2 ? 46 : 40; }

  spawnTicket() {
    if (this.tickets.length + this.passPlates.length >= MAX_TICKETS) return;
    const recipe = pickRecipe(this.shift, Math.random);
    const look = CUSTOMER_LOOKS[Math.floor(Math.random() * CUSTOMER_LOOKS.length)];
    const patience = this.patienceFor();
    this.tickets.push({
      recipe, remaining: new Set(recipe.needs), patience, maxPatience: patience,
      look, done: false, born: this.time,
    });
  }

  // ---- player actions ----

  selectIngredient(id) {
    if (this.phase !== PHASE.PLAYING) return;
    this.hand = this.hand === id ? null : id;
    this.sound.pickup();
  }

  useStation(stationId) {
    if (this.phase !== PHASE.PLAYING) return;
    const st = this.stations[stationId];
    if (!st) return;
    if (st.burnt) { // click a burnt station to scrape it clean
      st.burnt = false; st.burnLeft = 0;
      this.sound.drop();
      this.burst(stationCenter(stationId).x, stationCenter(stationId).y, '#555', 6);
      return;
    }
    if (st.job) {
      if (st.job.done) {
        // Collect the finished component onto the ready shelf.
        if (this.shelf.length >= 8) { this.sound.error(); this.shake = 0.2; this.floater(stationCenter(stationId).x, stationCenter(stationId).y - 60, 'SHELF FULL!', '#e74c3c'); return; }
        this.shelf.push(st.job.ing);
        st.job = null;
        this.sound.drop();
      } else {
        this.sound.error(); this.shake = 0.25; // still cooking
      }
      return;
    }
    if (!this.hand) { this.sound.error(); this.shake = 0.25; return; }
    const need = stationForIngredient(this.hand);
    if (need !== stationId) { this.sound.error(); this.shake = 0.3; return; }
    const ing = INGREDIENTS[this.hand];
    st.job = { ing: this.hand, t: 0, total: ing.cookTime };
    this.hand = null;
    if (stationId === 'chop') this.sound.chop(); else this.sound.click();
  }

  // Ice needs no station: it goes straight to the shelf.
  useDirect(ingId) {
    if (this.phase !== PHASE.PLAYING) return;
    if (this.shelf.length >= 8) { this.sound.error(); return; }
    this.shelf.push(ingId);
    this.hand = null;
    this.sound.drop();
  }

  clickShelf(i) {
    if (this.phase !== PHASE.PLAYING) return;
    const ing = this.shelf[i];
    if (!ing) return;
    // Attach to the earliest open ticket that still needs it.
    const ticket = this.tickets.find((t) => !t.done && t.remaining.has(ing));
    if (!ticket) { this.sound.error(); this.shake = 0.2; return; }
    this.shelf.splice(i, 1);
    ticket.remaining.delete(ing);
    this.sound.drop();
    if (ticket.remaining.size === 0) this.completeTicket(ticket);
  }

  completeTicket(ticket) {
    ticket.done = true;
    this.tickets = this.tickets.filter((t) => t !== ticket);
    this.passPlates.push(ticket);
    this.sound.ready();
    const c = stationCenter('pass');
    this.floater(c.x, c.y - 40, 'READY TO SERVE!', '#2ecc71');
  }

  serveTicket(ticket) {
    if (this.phase !== PHASE.PLAYING) return;
    this.passPlates = this.passPlates.filter((t) => t !== ticket);
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const mult = 1 + Math.min(this.combo - 1, 10) * 0.1;
    const earned = Math.round(ticket.recipe.price * mult);
    this.cash += earned;
    this.served += 1;
    const c = stationCenter('pass');
    this.floater(c.x, c.y - 60, `+$${earned}${this.combo > 1 ? '  x' + this.combo : ''}`, '#f7c948');
    this.burst(c.x, c.y, '#f7c948', 14);
    this.sound.serve();
    setTimeout(() => this.sound.coin(), 120);
  }

  // ---- per-frame update ----

  update(dt) {
    this.time += dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);
    if (this.banner) { this.banner.t -= dt; if (this.banner.t <= 0) this.banner = null; }
    for (const p of this.particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 12 * dt; }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const f of this.floaters) { f.life -= dt; f.y -= 28 * dt; }
    this.floaters = this.floaters.filter((f) => f.life > 0);
    if (this.phase !== PHASE.PLAYING) return;

    this.shiftTime -= dt;
    if (this.shiftTime <= 0) {
      if (this.shift < 3) {
        this.phase = PHASE.SHIFT_END;
        this.banner = { text: `SHIFT ${this.shift} DONE`, sub: `Cash: $${this.cash} · ${this.served} plates served`, t: 2.6 };
        setTimeout(() => { if (this.phase === PHASE.SHIFT_END) { this.phase = PHASE.PLAYING; this.startShift(this.shift + 1); } }, 2600);
      } else {
        this.phase = PHASE.OVER;
        this.sound.stopSizzle();
        this.sound.stopMusic();
        this.sound.gameOver();
      }
      return;
    }

    // Spawn tickets.
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTicket();
      this.spawnTimer = this.spawnInterval() * (0.85 + Math.random() * 0.3);
    }

    // Patience drains; a customer who waits too long walks out angry.
    for (const t of [...this.tickets]) {
      t.patience -= dt;
      if (t.patience <= 0) {
        this.tickets = this.tickets.filter((x) => x !== t);
        this.missed += 1;
        this.combo = 0;
        this.sound.angry();
        this.floater(360, 120, `${t.look.name} left!`, '#e74c3c');
      }
    }

    // Stations cook; a finished job burns if left sitting on the station.
    let anyCooking = false;
    for (const key of Object.keys(this.stations)) {
      const st = this.stations[key];
      if (st.job) {
        anyCooking = true;
        if (!st.job.done) {
          st.job.t += dt;
          if (st.job.t >= st.job.total) {
            st.job.done = true;
            st.job.burnLeft = BURN_WINDOW;
            this.sound.ready();
          }
        } else {
          st.job.burnLeft -= dt;
          if (st.job.burnLeft <= 0) {
            st.job = null;
            st.burnt = true;
            st.burnLeft = 4;
            this.sound.burn();
            this.floater(stationCenter(key).x, stationCenter(key).y - 60, 'BURNT!', '#e74c3c');
          }
        }
      } else if (st.burnt) {
        st.burnLeft -= dt;
        if (st.burnLeft <= 0) { st.burnt = false; }
      }
    }
    if (anyCooking) this.sound.startSizzle(); else this.sound.stopSizzle();
  }

  burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 90;
      this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: -Math.abs(Math.sin(a)) * sp - 20, life: 0.5 + Math.random() * 0.5, color, size: 3 + Math.random() * 4 });
    }
  }

  floater(x, y, text, color) {
    this.floaters.push({ x, y, text, life: 1.4, color });
  }

  // ---- screenshot staging: deterministic scenes from the real game ----
  stageShot(name) {
    this.reset();
    this.phase = PHASE.PLAYING;
    const mk = (recipeId, remaining, patience, lookIdx) => {
      const recipe = recipeById(recipeId);
      return { recipe, remaining: new Set(remaining), patience, maxPatience: 50, look: CUSTOMER_LOOKS[lookIdx], done: false, born: 0 };
    };
    if (name === 'cover') {
      this.shift = 1; this.shiftTime = 72; this.cash = 86; this.combo = 3; this.bestCombo = 3; this.served = 5;
      this.tickets = [
        mk('mie-ayam', ['greens'], 38, 2),
        mk('sate-ayam', ['chicken', 'chili', 'greens'], 30, 1),
        mk('es-teh', ['tea', 'ice'], 44, 4),
      ];
      const done = mk('nasi-goreng', [], 50, 0); done.done = true;
      this.passPlates = [done];
      this.shelf = ['chicken', 'greens'];
      this.hand = 'chili';
      this.stations.wok.job = { ing: 'rice', t: 1.9, total: 3 };
      this.stations.grill.job = { ing: 'chicken', t: 1.8, total: 4 };
    } else if (name === 'assembly') {
      this.shift = 2; this.shiftTime = 61; this.cash = 154; this.combo = 5; this.bestCombo = 6; this.served = 9;
      this.tickets = [
        mk('mie-ayam', ['greens'], 26, 3),
        mk('nasi-goreng', ['rice', 'egg', 'chili'], 41, 0),
      ];
      this.shelf = ['greens', 'chili', 'rice', 'tea'];
      this.stations.chop.job = { ing: 'greens', t: 0.8, total: 1.5 };
      this.stations.wok.job = { ing: 'noodle', t: 2.4, total: 3 };
    } else if (name === 'rush') {
      this.shift = 3; this.shiftTime = 34; this.cash = 412; this.combo = 7; this.bestCombo = 9; this.served = 21;
      this.tickets = [
        mk('nasi-goreng', ['egg'], 9, 5),
        mk('mie-ayam', ['noodle', 'greens'], 22, 2),
        mk('sate-ayam', ['chicken', 'chili', 'greens'], 31, 4),
        mk('es-teh', ['ice'], 18, 1),
      ];
      this.shelf = ['rice', 'chicken', 'greens', 'tea'];
      this.stations.wok.job = { ing: 'rice', t: 2.2, total: 3 };
      this.stations.grill.job = { ing: 'chicken', t: 3.1, total: 4 };
      this.stations.chop.job = { ing: 'chili', t: 0.9, total: 1.5 };
      this.stations.pot.job = { ing: 'tea', t: 1.2, total: 2 };
      this.hand = 'egg';
    } else if (name === 'score') {
      this.phase = PHASE.OVER;
      this.shift = 3; this.cash = 486; this.served = 24; this.missed = 3; this.bestCombo = 9;
    }
    this.sound.ensure();
  }
}

export function stationCenter(id) {
  const r = LAYOUT.stations[id];
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

export function ticketRect(i) {
  const t = LAYOUT.ticket;
  return { x: LAYOUT.board.x + i * (t.w + t.gap), y: LAYOUT.board.y, w: t.w, h: t.h };
}

export function crateRect(i) {
  const c = LAYOUT.crates;
  return { x: c.x + i * (c.w + c.gap), y: c.y, w: c.w, h: c.h };
}

export function shelfSlotRect(i) {
  const s = LAYOUT.shelf;
  return { x: s.x + i * (s.slot + s.gap), y: s.y, w: s.slot, h: s.h };
}
