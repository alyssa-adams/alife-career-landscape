/* =============================================================================
   SIM 4 — "THE COPYING TRAP"                    Act 4: other agents, groups, niches
   *** ARGUMENT-CRITICAL ***
   -----------------------------------------------------------------------------
   Lazer & Friedman (2007), Administrative Science Quarterly 52(4):667-694.
   Model rule, verbatim from the authors' own conference poster:

     "If an agent can see another agent at a higher point, copy the best agent
      visible."                                                    -> EXPLOITATION
     "Otherwise, look at impact of randomly changing one dimension. Move only if
      it is an improvement."                                       -> EXPLORATION

   Two populations on identical rugged landscapes. LEFT is a locked sparse ring;
   RIGHT is an Erdos-Renyi graph whose mean degree is the slider. The densely
   connected population converges fast onto a WORSE peak while its diversity
   collapses; the sparse one keeps exploring and wins.

   SYNCHRONOUS UPDATE IS REQUIRED. It matches the paper's baseline, and the
   poster shows that ASYNCHRONOUS updating makes the dense network behave like a
   sparse one. Update in place and you silently destroy your own effect.

   COMMON RANDOM NUMBERS. Within a replicate the two conditions share the same
   landscape, the same initial positions, and the same stream of exploration
   draws. Only the adjacency differs. This is paired sampling — the variance of
   the DIFFERENCE collapses — and it earns the line:
     "Same mountain range. Same starting points. Same luck.
      The only difference is who can see whom."
   The draw is indexed by (rep, agent, tick) rather than taken sequentially,
   because the two conditions follow different code paths and a sequential stream
   would desynchronise them.

   HONESTY MECHANISM — the most important design decision in this file.
   A single sparse-vs-dense run is a genuine coin flip at the tail. So: ONE hero
   world is rendered as the IMAGE, and SIXTEEN replicates are the EVIDENCE. The
   chart plots the 16-run mean with a min-max envelope, and she says out loud:
     "That's one run. Here's the average of sixteen."
   In front of a student and postdoc chapter, modelling how to present a
   stochastic result honestly is on-mission. It also defuses the only real heckle.

   THE AHA: the connected population became one dot. The sparse population stayed
   sixty dots. And the sixty dots found the taller mountain.

   THEN THE CORRECTION, which is the better talk: the paper's real finding is an
   INVERTED U. Fully connected is bad; totally disconnected is also bad;
   moderately connected wins. That is an argument for many small overlapping
   rooms — i.e. for the brainstorm that follows.
   ============================================================================= */

(function (global) {
  'use strict';

  var K = global.SimKit;

  var W = 1280, HGT = 700;
  var PW = 540, PH = 400, PX0 = 60, PX1 = 680, PY = 30;
  var DIV_Y = PY + PH + 14, DIV_H = 18;
  var CH_X = 60, CH_Y = 496, CH_W = 1160, CH_H = 176;

  var P = {
    POP: 60,
    REPS: 16,
    GRID: 128,
    BUMPS: 12,
    // Slow. Copying resolves in ~50 ticks either way; the watchable part is the
    // sparse population's long climb up the prize, and at 0.004 that finished by
    // tick 312 and left seventeen seconds of still image.
    STEP: 0.0012,
    // Per-tick copy probability. This single number sets the whole dramatic arc,
    // and it has to thread a needle.
    //
    // The arc requires DENSE TO LEAD EARLY: because everyone piles onto the best
    // position, the dense population's MEAN is its MAX, while the sparse
    // population's mean is dragged down by agents still scattered on low ground.
    // Sparse only overtakes later, once one of its segments has climbed the
    // prize and that value has walked the ring.
    //
    // At 0.5 the ring homogenised in ~60 ticks, so sparse's mean jumped to its
    // max almost immediately, it led from t=0, and there was no reversal to
    // watch. At 0.06 the dense network still converges in ~50 ticks (it only
    // needs ONE hop) while the ring needs thirty hops at ~17 ticks each. That
    // asymmetry is the entire result.
    COPY_P: 0.06,
    // Imitation is imperfect. This is what actually cures the freeze: with exact
    // copying the population collapses to a single point at a local maximum, no
    // random direction improves, and the run is a still image for 26 seconds. A
    // little slop keeps micro-exploration alive around the copied solution
    // without ever letting anyone cross a valley.
    // Raised from 0.010, which was enough to prevent the freeze but far too tight
    // to SEE: sixty agents landed inside a 5px disc and each population rendered
    // as one featureless white dot. At 0.045 a copied population is a visible
    // cloud of distinguishable agents, so the picture reads as it should —
    // the dense network converges on ONE cloud, the sparse network holds SEVERAL.
    // That is also the correct statement of the finding; it never required sixty
    // individually resolvable points.
    COPY_JITTER: 0.045,
    T_END: 1200,           // 20s, then FREEZE. Never auto-restart into a dead screen.
    SAMPLE_EVERY: 4,
    RING_DEG: 2,
    SEED: 0x5EED4,
    DIV_CELLS: 24,
    STREAK_LIFE: 8
  };

  /* ---- landscape ---------------------------------------------------------
     MAX over bumps, never SUM. Summing merges neighbouring bumps into one
     smooth blob and destroys the ruggedness the whole model depends on; max
     keeps crisp separated basins with real valleys between them.            */
  function buildLandscape(rng) {
    var bumps = [];
    // the prize: TALL, NARROW, FAR OUT
    var ga = 0.35 + rng() * 0.30, gth = rng() * 6.2832;
    var gx = 0.5 + Math.cos(gth) * ga, gy = 0.5 + Math.sin(gth) * ga;
    // MANY COMPETING BASINS OF SIMILAR SIZE. This is the whole visual.
    //
    // An earlier version gave the trap an enormous basin (s=0.26) so that it
    // would reliably capture the population. It captured too well: its basin
    // covered essentially the entire square, so every agent in BOTH conditions
    // hill-climbed to the same summit and each panel rendered as a single white
    // dot in the same place. The aha — "the connected population became one dot,
    // the sparse population stayed sixty dots" — was invisible, because both
    // were one dot.
    //
    // Twelve comparable basins tile the space instead. Agents land in different
    // ones and climb different peaks, so the SPARSE panel stays visibly spread
    // while the DENSE panel collapses onto whichever peak its leader found.
    bumps.push({ x: K.clamp(gx, 0.08, 0.92), y: K.clamp(gy, 0.08, 0.92), h: 1.00, s: 0.100 });
    // The trap: second tallest, slightly wider, so it is the likeliest early
    // leader — and therefore the thing the dense network commits to.
    var dx, dy, tries = 0;
    do {
      dx = 0.12 + rng() * 0.76; dy = 0.12 + rng() * 0.76; tries++;
    } while (Math.hypot(dx - bumps[0].x, dy - bumps[0].y) < 0.40 && tries < 200);
    bumps.push({ x: dx, y: dy, h: 0.85, s: 0.155 });
    for (var i = 2; i < P.BUMPS; i++) {
      bumps.push({ x: 0.06 + rng() * 0.88, y: 0.06 + rng() * 0.88,
                   h: 0.42 + rng() * 0.28, s: 0.080 + rng() * 0.045 });
    }

    var G = P.GRID, F = new Float32Array(G * G), mx = 0;
    for (var j = 0; j < G; j++) {
      var yy = j / (G - 1);
      for (var k = 0; k < G; k++) {
        var xx = k / (G - 1), best = 0;
        for (var b = 0; b < bumps.length; b++) {
          var ddx = xx - bumps[b].x, ddy = yy - bumps[b].y;
          var v = bumps[b].h * Math.exp(-(ddx * ddx + ddy * ddy) / (2 * bumps[b].s * bumps[b].s));
          if (v > best) best = v;
        }
        F[j * G + k] = best;
        if (best > mx) mx = best;
      }
    }
    for (var n = 0; n < F.length; n++) F[n] /= mx;
    return F;
  }

  function sample(F, x, y) { return K.bilinear(F, P.GRID, P.GRID, x, y); }

  /* ---- stateless, indexed exploration draw -> common random numbers ------ */
  function drawExplore(seed, rep, agent, tick, salt) {
    var h = (seed ^ Math.imul(rep + 1, 0x9E3779B1) ^ Math.imul(agent + 1, 0x85EBCA77) ^
             Math.imul(tick + 1, 0xC2B2AE3D) ^ Math.imul(salt + 1, 0x27D4EB2F)) >>> 0;
    h = Math.imul(h ^ (h >>> 15), 0x2545F491) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 0x9E3779B1) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  function ringAdj(n, deg) {
    var a = [];
    for (var i = 0; i < n; i++) {
      var nb = [];
      for (var d = 1; d <= deg / 2; d++) { nb.push((i - d + n) % n); nb.push((i + d) % n); }
      a.push(nb);
    }
    return a;
  }

  function erAdj(n, meanDeg, rng) {
    var p = K.clamp(meanDeg / (n - 1), 0, 1);
    var a = []; for (var i = 0; i < n; i++) a.push([]);
    for (var u = 0; u < n; u++) {
      for (var v = u + 1; v < n; v++) {
        if (rng() < p) { a[u].push(v); a[v].push(u); }
      }
    }
    return a;
  }

  function makeSim4(canvas, controlsMount) {
    return K.createSim({
      canvas: canvas,
      controlsMount: controlsMount,
      width: W, height: HGT,
      mode: 'perframe',       // one tick per frame => bit-identical under drops
      dt: 1 / 60,     // still ONE step per frame; this only makes api.t read in seconds
      seed: P.SEED,

      controls: [
        // Drives the RIGHT panel only; the left stays a locked sparse reference
        // so the comparison can never invert live. Clamped at 3 so the "dense"
        // side can never accidentally become sparser than the "sparse" side.
        { type: 'slider', key: 'k', label: 'CONNECTIVITY', lo: 'SPARSE', hi: 'EVERYONE',
          min: 3, max: 59, step: 1, value: 59,
          onChange: function (v, api) { api.state.rebuildAdj = true; } },
        { type: 'button', label: 'RESET ⟲', onClick: function (api, ctrl) { ctrl.hardReset(); } }
      ],

      setup: function (api) {
        var st = api.state;
        st.reps = [];
        for (var r = 0; r < P.REPS; r++) {
          var lrng = K.mulberry32(P.SEED + 7717 * (r + 1));
          var F = buildLandscape(lrng);
          var irng = K.mulberry32(P.SEED + 3313 * (r + 1));
          var x0 = new Float32Array(P.POP), y0 = new Float32Array(P.POP);
          for (var i = 0; i < P.POP; i++) { x0[i] = irng(); y0[i] = irng(); }

          var conds = [];
          for (var c = 0; c < 2; c++) {
            var x = new Float32Array(x0), y = new Float32Array(y0), f = new Float32Array(P.POP);
            for (var q = 0; q < P.POP; q++) f[q] = sample(F, x[q], y[q]);
            conds.push({
              x: x, y: y, f: f,
              nx: new Float32Array(P.POP), ny: new Float32Array(P.POP), nf: new Float32Array(P.POP)
            });
          }
          st.reps.push({ F: F, conds: conds });
        }

        st.sparseAdj = ringAdj(P.POP, P.RING_DEG);
        st.rebuildAdj = true;
        st.streaks = [];
        st.hist = { t: [], sparse: [], dense: [], sLo: [], sHi: [], dLo: [], dHi: [] };
        st.frozen = false;
        st.terrainLayer = null;

        st.probe = function () {
          var h = st.hist, n = h.t.length;
          if (!n) return null;
          return {
            tick: h.t[n - 1],
            sparseMean: +h.sparse[n - 1].toFixed(4),
            denseMean: +h.dense[n - 1].toFixed(4),
            gap: +(h.sparse[n - 1] - h.dense[n - 1]).toFixed(4),
            sparseWins: st.winCount,
            diversity: { sparse: st.divS, dense: st.divD }
          };
        };

        st.readout = function () {
          return [
            { x: PX0, w: PW, title: 'SPARSE', color: '#8A8AFF', value: '' },
            { x: PX1, w: PW, title: 'CONNECTED', color: '#FF5C68', value: '' }
          ];
        };
      },

      step: function (dt, api) {
        var st = api.state;

        if (st.rebuildAdj) {
          st.denseAdj = erAdj(P.POP, api.params.k, K.mulberry32(P.SEED + 99));
          st.rebuildAdj = false;
        }
        if (api.steps > P.T_END) { st.frozen = true; return; }

        var tick = api.steps;
        var adjs = [st.sparseAdj, st.denseAdj];
        var fullyConnected = api.params.k >= P.POP - 1;

        for (var r = 0; r < P.REPS; r++) {
          var rep = st.reps[r];
          for (var c = 0; c < 2; c++) {
            var cd = rep.conds[c], adj = adjs[c];

            // Fully connected: cache ONE global argmax instead of scanning 59
            // neighbours per agent. This is the optimisation that matters.
            var gBest = -1, gBestF = -1;
            if (c === 1 && fullyConnected) {
              for (var g = 0; g < P.POP; g++) if (cd.f[g] > gBestF) { gBestF = cd.f[g]; gBest = g; }
            }

            for (var i = 0; i < P.POP; i++) {
              var bi = -1, bf = cd.f[i];
              if (c === 1 && fullyConnected) {
                if (gBestF > bf) { bi = gBest; bf = gBestF; }
              } else {
                var nb = adj[i];
                for (var m = 0; m < nb.length; m++) {
                  if (cd.f[nb[m]] > bf) { bf = cd.f[nb[m]]; bi = nb[m]; }
                }
              }

              if (bi >= 0 && drawExplore(api.seed, r, i, tick, 1) >= P.COPY_P) bi = -1;

              if (bi >= 0) {
                // EXPLOIT — copy the best agent visible, imperfectly
                var jt = drawExplore(api.seed, r, i, tick, 2) * 6.283185307179586;
                var jr = drawExplore(api.seed, r, i, tick, 3) * P.COPY_JITTER;
                cd.nx[i] = K.clamp(cd.x[bi] + Math.cos(jt) * jr, 0, 1);
                cd.ny[i] = K.clamp(cd.y[bi] + Math.sin(jt) * jr, 0, 1);
                cd.nf[i] = sample(rep.F, cd.nx[i], cd.ny[i]);
                if (r === 0) {
                  st.streaks.push({ x0: cd.x[i], y0: cd.y[i], x1: cd.x[bi], y1: cd.y[bi],
                                    age: 0, c: c });
                }
              } else {
                // EXPLORE — perturb, accept only if it improves
                var th = drawExplore(api.seed, r, i, tick, 0) * 6.283185307179586;
                var cx = K.clamp(cd.x[i] + P.STEP * Math.cos(th), 0, 1);
                var cy = K.clamp(cd.y[i] + P.STEP * Math.sin(th), 0, 1);
                var cf = sample(rep.F, cx, cy);
                if (cf > cd.f[i]) { cd.nx[i] = cx; cd.ny[i] = cy; cd.nf[i] = cf; }
                else { cd.nx[i] = cd.x[i]; cd.ny[i] = cd.y[i]; cd.nf[i] = cd.f[i]; }
              }
            }
            // SYNCHRONOUS commit — double buffered
            cd.x.set(cd.nx); cd.y.set(cd.ny); cd.f.set(cd.nf);
          }
        }

        for (var s = st.streaks.length - 1; s >= 0; s--) {
          if (++st.streaks[s].age > P.STREAK_LIFE) st.streaks.splice(s, 1);
        }

        if (tick % P.SAMPLE_EVERY === 0) {
          var sSum = 0, dSum = 0, sLo = 2, sHi = -1, dLo = 2, dHi = -1, wins = 0;
          for (var rr = 0; rr < P.REPS; rr++) {
            var a0 = 0, a1 = 0;
            for (var z = 0; z < P.POP; z++) { a0 += st.reps[rr].conds[0].f[z]; a1 += st.reps[rr].conds[1].f[z]; }
            a0 /= P.POP; a1 /= P.POP;
            sSum += a0; dSum += a1;
            if (a0 < sLo) sLo = a0; if (a0 > sHi) sHi = a0;
            if (a1 < dLo) dLo = a1; if (a1 > dHi) dHi = a1;
            if (a0 > a1) wins++;
          }
          st.winCount = wins;
          var h = st.hist;
          h.t.push(tick);
          h.sparse.push(sSum / P.REPS); h.dense.push(dSum / P.REPS);
          h.sLo.push(sLo); h.sHi.push(sHi); h.dLo.push(dLo); h.dHi.push(dHi);
        }

        // diversity of the hero replicate: distinct occupied coarse cells
        if (tick % 6 === 0) {
          st.divS = spread(st.reps[0].conds[0]);
          st.divD = spread(st.reps[0].conds[1]);
        }
      },

      render: function (g, api) {
        var st = api.state, PAL = api.P;
        g.fillStyle = PAL.bg;
        g.fillRect(0, 0, api.W, api.H);

        if (!st.terrainLayer) st.terrainLayer = renderTerrain(st.reps[0].F);

        var cols = ['#8A8AFF', '#FF5C68'];
        var xs = [PX0, PX1];

        for (var c = 0; c < 2; c++) {
          var ox = xs[c];
          g.drawImage(st.terrainLayer, ox, PY, PW, PH);
          g.strokeStyle = cols[c]; g.lineWidth = 3;
          g.strokeRect(ox + 1.5, PY + 1.5, PW - 3, PH - 3);

          var cd = st.reps[0].conds[c];

          // copy streaks — the moment the mechanism becomes visible
          g.lineWidth = 4; g.lineCap = 'round';
          for (var s = 0; s < st.streaks.length; s++) {
            var sk = st.streaks[s];
            if (sk.c !== c) continue;
            g.globalAlpha = 0.40 * (1 - sk.age / P.STREAK_LIFE);
            g.strokeStyle = cols[c];
            g.beginPath();
            g.moveTo(ox + sk.x0 * PW, PY + sk.y0 * PH);
            g.lineTo(ox + sk.x1 * PW, PY + sk.y1 * PH);
            g.stroke();
          }
          g.globalAlpha = 1;

          // flat round particles, one colour per panel (10 Aug — glows and
          // triangle headings removed)
          for (var q = 0; q < P.POP; q++) {
            global.SwarmChem.drawOid(g, ox + cd.x[q] * PW, PY + cd.y[q] * PH,
              0, 5.6, cols[c], null);
          }

          // DIVERSITY bar — this collapsing IS the mechanism, and arguably the
          // real aha. Lazer & Friedman's own poster plots exactly this.
          var div = (c === 0 ? st.divS : st.divD) || 0;
          g.fillStyle = '#121218';
          g.fillRect(ox, DIV_Y, PW, DIV_H);
          g.fillStyle = cols[c];
          g.fillRect(ox, DIV_Y, PW * K.clamp(div, 0, 1), DIV_H);
        }

        // -- chart: 16-run mean with min-max envelope ------------------------
        g.fillStyle = '#0A0A10';
        g.fillRect(CH_X, CH_Y, CH_W, CH_H);
        g.strokeStyle = '#232330'; g.lineWidth = 2;
        g.strokeRect(CH_X + 1, CH_Y + 1, CH_W - 2, CH_H - 2);

        var h = st.hist;
        if (h.t.length > 1) {
          var lo = 0.20, hi = 1.02;
          var px = function (t) { return CH_X + (t / P.T_END) * CH_W; };
          var py = function (v) { return CH_Y + CH_H - ((v - lo) / (hi - lo)) * CH_H; };

          for (var e = 0; e < 2; e++) {
            var loA = e === 0 ? h.sLo : h.dLo, hiA = e === 0 ? h.sHi : h.dHi;
            g.beginPath();
            for (var a = 0; a < h.t.length; a++) g[a ? 'lineTo' : 'moveTo'](px(h.t[a]), py(hiA[a]));
            for (var b = h.t.length - 1; b >= 0; b--) g.lineTo(px(h.t[b]), py(loA[b]));
            g.closePath();
            // band tint = its own series hue at low alpha (was SUBSTRATE mint/
            // iris as rgba() triplets — invisible to the hex sweep)
            g.fillStyle = e === 0 ? 'rgba(138,138,255,0.16)' : 'rgba(255,92,104,0.16)';
            g.fill();
          }
          for (var m = 0; m < 2; m++) {
            var arr = m === 0 ? h.sparse : h.dense;
            g.beginPath();
            for (var n = 0; n < h.t.length; n++) g[n ? 'lineTo' : 'moveTo'](px(h.t[n]), py(arr[n]));
            g.strokeStyle = cols[m]; g.lineWidth = 6; g.lineJoin = 'round';
            g.stroke();
          }
        }
      }
    });

    // RMS spread, not a count of occupied cells. Cell-counting gave "2 vs 2" for
    // both conditions — the clusters are tighter than one cell either way — so
    // the collapse, which is the actual mechanism, was invisible on the bar.
    // Spread is continuous and falls smoothly as the population homogenises.
    // Normalised by 0.41, the RMS radius of a uniform unit square.
    function spread(cd) {
      var mx = 0, my = 0, i;
      for (i = 0; i < P.POP; i++) { mx += cd.x[i]; my += cd.y[i]; }
      mx /= P.POP; my /= P.POP;
      var s = 0;
      for (i = 0; i < P.POP; i++) {
        var dx = cd.x[i] - mx, dy = cd.y[i] - my;
        s += dx * dx + dy * dy;
      }
      return Math.sqrt(s / P.POP) / 0.41;
    }

    function renderTerrain(F) {
      var G = P.GRID, cv = K.offscreen(G, G), ctx = cv.getContext('2d');
      var img = ctx.createImageData(G, G);
      for (var i = 0; i < F.length; i++) {
        var v = K.clamp(F[i], 0, 1);
        // single-hue LUMINANCE ramp: height reads as brightness, which survives
        // chroma subsampling at 720p; colour-difference does not
        var t = Math.pow(v, 0.9);
        var rr, gg, bb;
        if (t < 0.5) { var u = t / 0.5; rr = 14 + (59 - 14) * u; gg = 16 + (46 - 16) * u; bb = 48 + (140 - 48) * u; }
        else { var u2 = (t - 0.5) / 0.5; rr = 59 + (255 - 59) * u2; gg = 46 + (243 - 46) * u2; bb = 140 + (208 - 140) * u2; }
        // 6 contour bands baked in — free, and they let the eye read altitude
        // through heavy compression
        var band = Math.abs((v * 6) % 1 - 0.5) < 0.045 ? 42 : 0;
        img.data[i * 4] = rr + band; img.data[i * 4 + 1] = gg + band;
        img.data[i * 4 + 2] = bb + band; img.data[i * 4 + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      return cv;
    }
  }

  global.makeSim4 = makeSim4;

})(typeof window !== 'undefined' ? window : this);
