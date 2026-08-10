/* Node smoke test for the Swarm Chemistry port — physics only, no browser.
   Gates: recipe parse counts, boundedness, no-NaN, Blobs cohesion, Pulsating
   Eye vitality, and bit-exact determinism under one seed.
   usage: node test/sc-smoke.js                                               */

'use strict';
const SC = require('../sims/sim0-swarm.js').SwarmChem || require('../sims/sim0-swarm.js');

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let fail = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
  if (!ok) fail++;
};

// 1. parse counts
const EXPECT = {
  'Pulsating Eye': [3, 300], 'Swinger': [4, 245], 'Cell with Two Nuclei': [6, 247],
  'Rotary': [3, 90], 'Blobs': [1, 300], 'Linear Oscillator': [2, 157]
};
for (const [n, [k, t]] of Object.entries(EXPECT)) {
  const types = SC.parseRecipe(SC.RECIPES[n]);
  const total = types.reduce((s, p) => s + p.n, 0);
  check(`parse ${n}`, types.length === k && total === t, `${types.length} ingredients, ${total} agents`);
}

function run(recipe, steps, seed) {
  const rng = mulberry32(seed);
  const w = SC.makeWorld(SC.parseRecipe(SC.RECIPES[recipe]), rng);
  for (let s = 0; s < steps; s++) SC.stepWorld(w, rng);
  return w;
}
const stats = w => {
  let mx = 0, my = 0, ms = 0, bad = 0;
  const N = w.ags.length;
  for (const a of w.ags) {
    if (!isFinite(a.x) || !isFinite(a.y)) bad++;
    mx += a.x; my += a.y; ms += Math.hypot(a.dx, a.dy);
  }
  mx /= N; my /= N; ms /= N;
  let rms = 0, nn = 0;
  for (const a of w.ags) { rms += (a.x - mx) ** 2 + (a.y - my) ** 2; }
  rms = Math.sqrt(rms / N);
  // mean nearest-neighbour distance on a 60-agent sample
  const step = Math.max(1, Math.floor(N / 60));
  let cnt = 0;
  for (let i = 0; i < N; i += step) {
    let best = 1e18;
    for (let j = 0; j < N; j++) {
      if (j === i) continue;
      const d = (w.ags[i].x - w.ags[j].x) ** 2 + (w.ags[i].y - w.ags[j].y) ** 2;
      if (d < best) best = d;
    }
    nn += Math.sqrt(best); cnt++;
  }
  return { bad, meanSpeed: ms, rms, nnd: nn / cnt };
};

// 2. Blobs: coheres, sane, alive
{
  const w = run('Blobs', 800, 11);
  const s = stats(w);
  const vmax = SC.parseRecipe(SC.RECIPES['Blobs'])[0].Vm;
  const overV = w.ags.filter(a => Math.hypot(a.dx, a.dy) > vmax + 1e-9).length;
  check('Blobs no NaN', s.bad === 0);
  check('Blobs speeds ≤ Vm', overV === 0, `over=${overV}`);
  check('Blobs packed (mean NND < 15)', s.nnd < 15, `nnd=${s.nnd.toFixed(1)}`);
  check('Blobs bounded (rms < 2000)', s.rms < 2000, `rms=${s.rms.toFixed(0)}`);
  check('Blobs alive (meanSpeed > 0.3)', s.meanSpeed > 0.3, `v=${s.meanSpeed.toFixed(2)}`);
}

// 3. Pulsating Eye: alive, structured, not exploded
{
  const w = run('Pulsating Eye', 1200, 7);
  const s = stats(w);
  check('PulsatingEye no NaN', s.bad === 0);
  check('PulsatingEye alive (meanSpeed 1..40)', s.meanSpeed > 1 && s.meanSpeed < 40, `v=${s.meanSpeed.toFixed(2)}`);
  check('PulsatingEye structured (rms 40..1500)', s.rms > 40 && s.rms < 1500, `rms=${s.rms.toFixed(0)}`);
}

// 4. determinism
{
  const a = run('Swinger', 400, 99), b = run('Swinger', 400, 99);
  let diff = 0;
  for (let i = 0; i < a.ags.length; i++) {
    if (a.ags[i].x !== b.ags[i].x || a.ags[i].y !== b.ags[i].y) diff++;
  }
  check('deterministic under seed', diff === 0, `diverged=${diff}`);
}

// 5. every shipped recipe survives 900 steps
for (const n of Object.keys(EXPECT)) {
  const s = stats(run(n, 900, 3));
  check(`900-step ${n}`, s.bad === 0 && s.rms < 3000, `rms=${s.rms.toFixed(0)} v=${s.meanSpeed.toFixed(1)}`);
}

console.log(fail ? `\n${fail} FAILURES` : '\nall gates passed');
process.exit(fail ? 1 : 0);
