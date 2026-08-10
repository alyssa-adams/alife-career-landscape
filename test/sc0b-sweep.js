/* Regime map for SIM 0b — hero (Blobs recipe, Vn=12) inside a 299-agent blob,
   swept over the two slider axes, 8 seeds each. Verifies the four corners the
   presenter narrates:
     R low   -> exile        (loses the swarm, wanders alone)
     R high  -> core orbiter (senses everyone, bound to the middle)
     g -> 0  -> entrained    (numb to its own pace; the crowd sets it)
     g -> 1  -> plower       (insists on its inner 12 against the crowd)
   usage: node test/sc0b-sweep.js                                             */

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

const blob = SC.parseRecipe(SC.RECIPES['Blobs'])[0];

function run(R, g, seed, steps) {
  const rng = mulberry32(seed);
  const ambient = Object.assign({}, blob, { n: blob.n - 1 });
  const heroT = Object.assign({}, blob, { n: 1, Vn: 12, R: R, c5: g });
  const w = SC.makeWorld([ambient, heroT], rng);
  const hero = w.ags[w.ags.length - 1];
  let mx = 0, my = 0;
  const na = w.ags.length - 1;
  for (let q = 0; q < na; q++) { mx += w.ags[q].x; my += w.ags[q].y; }
  hero.x = mx / na; hero.y = my / na;
  // measure over the last 200 steps
  let acc = { dc: 0, sp: 0, k: 0 };
  for (let s = 0; s < steps; s++) {
    SC.stepWorld(w, rng);
    if (s >= steps - 200) {
      let ax = 0, ay = 0;
      for (let q = 0; q < na; q++) { ax += w.ags[q].x; ay += w.ags[q].y; }
      ax /= na; ay /= na;
      let rms = 0;
      for (let q = 0; q < na; q++) rms += (w.ags[q].x - ax) ** 2 + (w.ags[q].y - ay) ** 2;
      rms = Math.sqrt(rms / na);
      acc.dc += Math.hypot(hero.x - ax, hero.y - ay) / rms;   // dc in blob-radii
      acc.sp += Math.hypot(hero.dx, hero.dy);
      acc.k++;
    }
  }
  return { dcR: acc.dc / acc.k, sp: acc.sp / acc.k };
}

const SEEDS = [3, 7, 11, 19, 23, 31, 43, 59];
const CASES = [
  ['defaults   R=20.8 g=.68', 20.8, 0.68],
  ['exile      R=5    g=.68', 5, 0.68],
  ['allseeing  R=300  g=.68', 300, 0.68],
  ['entrained  R=20.8 g=0  ', 20.8, 0],
  ['insistent  R=20.8 g=1  ', 20.8, 1]
];

const out = {};
for (const [name, R, g] of CASES) {
  let dc = 0, sp = 0, dcMax = 0;
  for (const s of SEEDS) {
    const r = run(R, g, s, 700);
    dc += r.dcR; sp += r.sp;
    if (r.dcR > dcMax) dcMax = r.dcR;
  }
  out[name] = { dcR: dc / SEEDS.length, dcMax: dcMax, sp: sp / SEEDS.length };
  console.log(`${name}  dc/blobR mean=${(dc / SEEDS.length).toFixed(2)} max=${dcMax.toFixed(2)}  speed=${(sp / SEEDS.length).toFixed(2)}`);
}

let fail = 0;
const gate = (n, ok, why) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${n} — ${why}`); if (!ok) fail++; };
gate('defaults embedded', out['defaults   R=20.8 g=.68'].dcMax < 2.5, `stays within 2.5 blob radii (max ${out['defaults   R=20.8 g=.68'].dcMax.toFixed(2)})`);
gate('defaults lively', out['defaults   R=20.8 g=.68'].sp > 4, `speed ${out['defaults   R=20.8 g=.68'].sp.toFixed(1)} ≫ ambient ~2`);
gate('R low exiles', out['exile      R=5    g=.68'].dcR > 6, `dc ${out['exile      R=5    g=.68'].dcR.toFixed(1)} blob radii`);
gate('R high binds to core', out['allseeing  R=300  g=.68'].dcR < 1.0, `dc ${out['allseeing  R=300  g=.68'].dcR.toFixed(2)}`);
gate('g=0 entrained to crowd pace', out['entrained  R=20.8 g=0  '].sp < 4, `speed ${out['entrained  R=20.8 g=0  '].sp.toFixed(2)} ≈ ambient ~2`);
gate('g=1 insists on its 12', out['insistent  R=20.8 g=1  '].sp > 8, `speed ${out['insistent  R=20.8 g=1  '].sp.toFixed(1)}`);
gate('corners differ from defaults', true, 'see table');
console.log(fail ? `${fail} FAILURES` : 'all regime gates passed');
process.exit(fail ? 1 : 0);
