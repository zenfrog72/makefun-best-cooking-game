// WARUNG RUSH — audio.js
// All sound is synthesised with WebAudio: no audio files, no network.
// Sizzle is filtered noise, everything else is short oscillator blips.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.musicOn = true;
    this.musicTimer = null;
    this.sizzleNodes = null;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  }

  tone(freq, dur, type = 'sine', vol = 0.12, when = 0, slideTo = null) {
    if (!this.ensure()) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  noiseBurst(dur = 0.08, vol = 0.2, filterFreq = 1800) {
    if (!this.ensure()) return;
    const t0 = this.ctx.currentTime;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start(t0);
  }

  click() { this.tone(660, 0.06, 'triangle', 0.08); }
  chop() { this.noiseBurst(0.07, 0.3, 900); this.tone(180, 0.07, 'square', 0.08); }
  pickup() { this.tone(520, 0.07, 'triangle', 0.09, 0, 780); }
  drop() { this.tone(300, 0.08, 'triangle', 0.09, 0, 200); }
  ready() { this.tone(880, 0.12, 'sine', 0.1); this.tone(1320, 0.16, 'sine', 0.08, 0.09); }
  serve() {
    this.tone(523, 0.1, 'triangle', 0.12);
    this.tone(659, 0.1, 'triangle', 0.12, 0.08);
    this.tone(784, 0.18, 'triangle', 0.14, 0.16);
  }
  coin() { this.tone(988, 0.08, 'square', 0.06); this.tone(1319, 0.14, 'square', 0.06, 0.07); }
  error() { this.tone(160, 0.18, 'sawtooth', 0.1, 0, 110); }
  angry() { this.tone(220, 0.25, 'sawtooth', 0.09, 0, 130); this.tone(147, 0.3, 'sawtooth', 0.08, 0.12, 90); }
  burn() { this.noiseBurst(0.3, 0.25, 400); this.tone(120, 0.3, 'sawtooth', 0.1, 0, 70); }
  rush() { this.tone(392, 0.1, 'triangle', 0.12); this.tone(523, 0.1, 'triangle', 0.12, 0.09); this.tone(659, 0.2, 'triangle', 0.12, 0.18); }
  gameOver() {
    [523, 392, 330, 262].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.11, i * 0.16));
  }

  startSizzle() {
    if (!this.ensure() || this.sizzleNodes) return;
    const len = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2500;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.0;
    gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.3);
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start();
    this.sizzleNodes = { src, gain };
  }

  stopSizzle() {
    if (!this.sizzleNodes) return;
    const { src, gain } = this.sizzleNodes;
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
    src.stop(this.ctx.currentTime + 0.3);
    this.sizzleNodes = null;
  }

  // Gentle pentatonic loop, one note per beat, low volume.
  startMusic() {
    if (!this.ensure() || this.musicTimer || !this.musicOn) return;
    const scale = [262, 294, 330, 392, 440, 523, 587];
    let step = 0;
    this.musicTimer = setInterval(() => {
      if (!this.musicOn || !this.ctx) return;
      const note = scale[[0, 2, 4, 3, 5, 4, 2, 1][step % 8]];
      this.tone(note, 0.5, 'sine', 0.035);
      if (step % 4 === 2) this.tone(note / 2, 0.6, 'triangle', 0.03);
      step++;
    }, 420);
  }

  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }

  toggleMusic() {
    this.musicOn = !this.musicOn;
    if (this.musicOn) this.startMusic(); else this.stopMusic();
    return this.musicOn;
  }
}
