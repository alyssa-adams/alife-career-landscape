/* =============================================================================
   SIM 3 — "IDENTICAL RECIPE. THREE MIXTURES."   Section 3: same agent, three worlds
   -----------------------------------------------------------------------------
   Real Swarm Chemistry (the sim0-swarm.js port of Sayama's kinetics — GPLv3,
   see that file's header for provenance). The SAME 40 gold agents — one
   published ingredient, parameters untouched — dropped into three different
   ambient mixtures, also published ingredients:

     hero          Cell with Two Nuclei, ingredient 4/6   (110.8, 16.12, 38.6, .18, .34, 14.3, .01, .01)
     mixture A     + Cell with Two Nuclei, ingredient 5/6 -> hero becomes the SHELL
     mixture B     + Pulsating Eye, ingredient 3/3        -> hero becomes the CORE
     mixture C     + Pulsating Eye, ingredient 1/3        -> hero never coheres (SCATTERED)

   THE PAIRINGS WERE SEARCHED, NOT STAGED: test/sc3-search.js classifies every
   (hero, ambient) pairing over independent seeds; these three are unanimous
   16/16 on fresh seeds (mean ratios ~2.9 / ~0.50 / ~9.8), with the shell
   chosen for maximum margin from both classification boundaries — deliberately
   not the most extreme specimen. RESHUFFLE reseeds live on stage; that is the
   standing answer to "isn't this staged?"

   Classification (same thresholds as the search — keep them in sync):
     ratio = hero RMS radius / ambient RMS radius, about the joint centroid
     SCATTERED  hero NND > max(45, 3.5 x ambient NND)  or  ratio > 4.5
     SHELL      ratio > 1.30       CORE  ratio < 0.72       else FORMING…

   (This file replaced the hand-built Orchard/Desert/Hive payoff sim on 10 Aug —
   that version is recoverable from deck/slides.js.bak-38substrate vintage.)
   ============================================================================= */

(function (global) {
  'use strict';

  var K = global.SimKit;
  var SC = global.SwarmChem;

  var HERO_N = 40, AMB_N = 120;
  var PANES = [
    { key: 'A', recipe: 'Cell with Two Nuclei', ing: 4, expect: 'SHELL' },
    { key: 'B', recipe: 'Pulsating Eye', ing: 2, expect: 'CORE' },
    { key: 'C', recipe: 'Pulsating Eye', ing: 0, expect: 'SCATTERED' }
  ];
  var SEEDS = [20260821, 20260822, 20260823, 20260824, 20260825];
  var seedIdx = 0;   // closure — survives resets, so RESHUFFLE cycles

  // local, self-contained: SimKit does not export its PRNG
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function heroType() {
    return Object.assign({}, SC.parseRecipe(SC.RECIPES['Cell with Two Nuclei'])[3], { n: HERO_N });
  }

  function classify(world) {
    var H = [], A = [], i, a;
    for (i = 0; i < world.ags.length; i++) {
      a = world.ags[i];
      (a.t === 1 ? H : A).push(a);
    }
    var cx = 0, cy = 0, n = world.ags.length;
    for (i = 0; i < n; i++) { cx += world.ags[i].x; cy += world.ags[i].y; }
    cx /= n; cy /= n;
    function rms(g) {
      var s = 0;
      for (var j = 0; j < g.length; j++) s += (g[j].x - cx) * (g[j].x - cx) + (g[j].y - cy) * (g[j].y - cy);
      return Math.sqrt(s / g.length);
    }
    function nnd(g) {
      var s = 0;
      for (var j = 0; j < g.length; j++) {
        var best = 1e18;
        for (var k = 0; k < g.length; k++) {
          if (k === j) continue;
          var d = (g[j].x - g[k].x) * (g[j].x - g[k].x) + (g[j].y - g[k].y) * (g[j].y - g[k].y);
          if (d < best) best = d;
        }
        s += Math.sqrt(best);
      }
      return s / g.length;
    }
    var ratio = rms(H) / Math.max(rms(A), 1);
    var cls;
    if (nnd(H) > Math.max(45, 3.5 * nnd(A)) || ratio > 4.5) cls = 'SCATTERED';
    else if (ratio > 1.30) cls = 'SHELL';
    else if (ratio < 0.72) cls = 'CORE';
    else cls = 'FORMING…';
    return { cls: cls, ratio: ratio };
  }

  function makeSim3(canvas, mount) {
    var W = 1148, H = 520;
    var PW = 374, GUT = 13;

    var ctrl = K.createSim({
      canvas: canvas, controlsMount: mount,
      width: W, height: H, mode: 'perframe', seed: 1,
      controls: [
        { type: 'button', label: 'RESHUFFLE ⟳', onClick: function (api) {
            seedIdx = (seedIdx + 1) % SEEDS.length;
            api.restart = true;
          } },
        { type: 'button', label: 'RESET ⟲', onClick: function (api) { api.restart = true; } }
      ],
      setup: function (api) {
        var st = api.state;
        st.panes = PANES.map(function (p, i) {
          var rng = mulberry32(SEEDS[seedIdx] + i * 7919);
          var amb = Object.assign({}, SC.parseRecipe(SC.RECIPES[p.recipe])[p.ing], { n: AMB_N });
          var world = SC.makeWorld([amb, heroType()], rng);
          return {
            cfg: p, rng: rng,
            world: world,
            // camera must never trim the heroes: in the scatter pane the
            // whole point is seeing how far from the community they end up
            heroes: world.ags.filter(function (a) { return a.t === 1; }),
            cam: { ok: false },
            cls: { cls: 'FORMING…', ratio: 1 }
          };
        });
        st.readout = function () {
          return st.panes.map(function (p, i) {
            return {
              x: i * (PW + GUT), w: PW,
              title: p.cfg.key + ' · r ' + p.cls.ratio.toFixed(2),
              value: p.cls.cls,
              color: api.P.amber
            };
          });
        };
        st.probe = function () {
          var o = { t: +api.t.toFixed(1), seed: SEEDS[seedIdx] };
          st.panes.forEach(function (p) { o[p.cfg.key] = { cls: p.cls.cls, r: +p.cls.ratio.toFixed(2) }; });
          return o;
        };
      },
      step: function (dt, api) {
        var st = api.state;
        for (var i = 0; i < st.panes.length; i++) {
          var p = st.panes[i];
          SC.stepWorld(p.world, p.rng);
          if ((api.steps + i * 5) % 15 === 0) p.cls = classify(p.world);
        }
      },
      render: function (g, api) {
        var st = api.state, P = api.P;
        g.fillStyle = P.bg; g.fillRect(0, 0, W, H);
        for (var i = 0; i < st.panes.length; i++) {
          var p = st.panes[i], x0 = i * (PW + GUT);
          g.save();
          g.beginPath(); g.rect(x0, 0, PW, H); g.clip();
          SC.trackCamera(p.cam, p.world.ags, PW, H, p.heroes);
          if (p.cam.s > 1.5) p.cam.s = 1.5;
          // 0.10, not 0.14: at 0.14 the SCATTERED pane's gold ring outgrows
          // the pane and clips against its frame within seconds (red-team
          // catch) — 0.10 keeps the whole ring in frame through a full beat
          if (p.cam.s < 0.10) p.cam.s = 0.10;
          var cam = p.cam, ags = p.world.ags, j, a;
          var sz = Math.max(2.6, Math.min(9, 6 * cam.s));
          // ags order is ambient (t=0) then hero (t=1), so the gold heroes
          // always paint on top of the violet mass — matters now the discs
          // are flat with no halo to lift them out of the crowd
          for (j = 0; j < ags.length; j++) {
            a = ags[j];
            var ox = x0 + (a.x - cam.mx) * cam.s + PW / 2, oy = (a.y - cam.my) * cam.s + H / 2;
            if (ox < x0 - 16 || ox > x0 + PW + 16 || oy < -16 || oy > H + 16) continue;
            SC.drawOid(g, ox, oy, a.ang, a.t === 1 ? sz * 1.6 : sz,
                       a.t === 1 ? P.amber : P.cyan, null);
          }
          g.restore();
          g.strokeStyle = P.rule; g.lineWidth = 1.5;
          g.strokeRect(x0 + 0.5, 0.5, PW - 1, H - 1);
        }
      }
    });
    return ctrl;
  }

  global.makeSim3 = makeSim3;

})(typeof window !== 'undefined' ? window : this);
