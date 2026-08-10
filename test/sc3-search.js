/* Combo search for SIM 3 ("Identical recipe. Three mixtures."):
   find (hero ingredient, three ambient ingredients) — all verbatim Sayama —
   such that the SAME hero ends up in three robustly different configurations:
   SHELL (wraps the ambient), CORE (gets wrapped), SCATTER (never coheres).
   Classification per (pair, seed); a pairing counts only if 8/8 seeds agree.
   usage: node test/sc3-search.js                                             */

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

// ingredient library: recipe name + type index (parse, never retype)
const ING = {};
const lib = [
  ['B',  'Blobs', 0],
  ['PE0', 'Pulsating Eye', 0], ['PE1', 'Pulsating Eye', 1], ['PE2', 'Pulsating Eye', 2],
  ['SW0', 'Swinger', 0], ['SW1', 'Swinger', 1], ['SW3', 'Swinger', 3],
  ['CE0', 'Cell with Two Nuclei', 0], ['CE3', 'Cell with Two Nuclei', 3],
  ['CE4', 'Cell with Two Nuclei', 4], ['CE5', 'Cell with Two Nuclei', 5],
  ['RO0', 'Rotary', 0], ['RO1', 'Rotary', 1], ['RO2', 'Rotary', 2],
  ['LO0', 'Linear Oscillator', 0], ['LO1', 'Linear Oscillator', 1]
];
for (const [k, r, i] of lib) ING[k] = SC.parseRecipe(SC.RECIPES[r])[i];

const HERO_N = 40, AMB_N = 120, STEPS = 700;
const SEEDS = process.env.SEEDS ? process.env.SEEDS.split(',').map(Number)
  : [3, 7, 11, 19, 23, 31, 43, 59];

function classify(heroKey, ambKey, seed) {
  const rng = mulberry32(seed);
  const hero = Object.assign({}, ING[heroKey], { n: HERO_N });
  const amb = Object.assign({}, ING[ambKey], { n: AMB_N });
  const w = SC.makeWorld([amb, hero], rng);
  for (let s = 0; s < STEPS; s++) SC.stepWorld(w, rng);
  const H = w.ags.filter(a => a.t === 1), A = w.ags.filter(a => a.t === 0);
  const cx = w.ags.reduce((s, a) => s + a.x, 0) / w.ags.length;
  const cy = w.ags.reduce((s, a) => s + a.y, 0) / w.ags.length;
  const r = g => Math.sqrt(g.reduce((s, a) => s + (a.x - cx) ** 2 + (a.y - cy) ** 2, 0) / g.length);
  const rH = r(H), rA = r(A);
  // hero nearest-neighbour distance (hero-to-hero)
  let nnd = 0;
  for (const a of H) {
    let best = 1e18;
    for (const b of H) {
      if (a === b) continue;
      const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
      if (d < best) best = d;
    }
    nnd += Math.sqrt(best);
  }
  nnd /= H.length;
  let nndA = 0;
  for (const a of A) {
    let best = 1e18;
    for (const b of A) {
      if (a === b) continue;
      const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
      if (d < best) best = d;
    }
    nndA += Math.sqrt(best);
  }
  nndA /= A.length;
  const ratio = rH / Math.max(rA, 1);
  if (nnd > Math.max(45, 3.5 * nndA) || ratio > 4.5) return { c: 'SCATTER', ratio, nnd };
  if (ratio > 1.30) return { c: 'SHELL', ratio, nnd };
  if (ratio < 0.72) return { c: 'CORE', ratio, nnd };
  return { c: 'MIXED', ratio, nnd };
}

const heroes = process.argv[2] ? [process.argv[2]] : ['CE3', 'SW1', 'PE1', 'B', 'LO0'];
const ambients = Object.keys(ING);

for (const h of heroes) {
  const rows = [];
  for (const a of ambients) {
    if (a === h) continue;
    const cs = SEEDS.map(s => classify(h, a, s));
    const kinds = new Set(cs.map(x => x.c));
    const verdict = kinds.size === 1 ? cs[0].c : `mixed(${[...kinds].join('/')})`;
    const mr = (cs.reduce((s, x) => s + x.ratio, 0) / cs.length).toFixed(2);
    rows.push(`${a.padEnd(4)} -> ${verdict.padEnd(28)} ratio=${mr}`);
  }
  console.log(`\nHERO ${h}  (R=${ING[h].R} Vn=${ING[h].Vn} c1=${ING[h].c1} c3=${ING[h].c3})`);
  console.log(rows.join('\n'));
}
