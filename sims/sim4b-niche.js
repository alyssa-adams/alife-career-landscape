/* =============================================================================
   SIM 4b — "NICHE CONSTRUCTION"                        Act 4 coda (~20 seconds)
   -----------------------------------------------------------------------------
   Shares Sim 4's renderer and PRNG. One full-width panel, one idea.

   Agents cluster, and where they cluster the GROUND RISES. Higher ground means
   higher fitness, which means fewer leave and more arrive, which raises the
   ground further. A peak grows where the base landscape had none.

   THE DECAY IS NOT A DETAIL. Without it the map floods and everything becomes a
   plateau. With it, an abandoned niche erodes — which is the truest line in the
   act: constructed niches require ongoing labour. Press SCATTER and watch the
   mountain the group built sink back into the plain.

   Modelling ancestry, so this reads as a model rather than a cartoon:
     Silver, M. & Di Paolo, E. (2006). "Spatial effects favour the evolution of
       niche construction." Theoretical Population Biology 70:387-400.
     Laland, K., Odling-Smee, J. & Feldman, M. (1999). PNAS 96:10242-10247.

   THE CLOSING LINE:
     "Nobody found this peak. There was no peak. They made it by standing here
      together. That is what ERA is. Nobody discovered this community — five
      hundred and fifty of you raised the ground under it. And if you stop, it
      erodes."
   ============================================================================= */

(function (global) {
  'use strict';

  var K = global.SimKit;

  var W = 1280, HGT = 600;
  var PX = 40, PY = 24, PW = 1200, PH = 552;

  var P = {
    POP: 70,
    HG: 160,                // deposition grid; 96 upscaled 12x was visibly blocky
    BASE_BUMPS: 5,
    // Equilibrium height is (deposition / decay). At 0.0030 with ~30 agents
    // contributing at the cluster centre that equilibrium was ~95, so the niche
    // slammed into H_MAX within four seconds and there was nothing to watch.
    // 0.00005 puts equilibrium right at H_MAX with a ~7.6s time constant, so the
    // mountain grows over about fifteen seconds — and erodes over the same.
    RATE: 0.00005,          // deposit per agent per tick
    DECAY: 0.0022,          // niches require maintenance
    H_MAX: 0.62,            // a maintained niche can exceed any natural peak
    KERNEL: 0.055,
    STEP: 0.0016,
    // The crowd must stay ONE loose group standing on ground it is raising —
    // not a point. Weighting the gradient at 2.2 created a runaway: the group
    // built a spike, the spike's own gradient hauled everyone tighter, which
    // built it faster, and the population fragmented into four stacked dots.
    // The constructed gradient is now weak relative to cohesion and wander.
    GRAD_W: 0.7,
    COH: 0.80, SEP_R: 0.045, SEP_K: 1.6, WANDER: 0.35,
    SEED: 0x51CE,
    T_END: 2400
  };

  function makeSim4b(canvas, controlsMount) {
    var scattered = 0;

    return K.createSim({
      canvas: canvas,
      controlsMount: controlsMount,
      width: W, height: HGT,
      mode: 'perframe',
      dt: 1 / 60,
      seed: P.SEED,

      controls: [
        { type: 'button', label: 'SCATTER THEM', onClick: function (api) {
            scattered = 1;
            var st = api.state;
            for (var i = 0; i < P.POP; i++) {
              var u = K.hashUnitVec(i, api.steps + 31, api.seed);
              st.ag[i].x = K.clamp(0.5 + u.x * 0.46, 0.02, 0.98);
              st.ag[i].y = K.clamp(0.5 + u.y * 0.46, 0.02, 0.98);
            }
          } },
        { type: 'button', label: 'RESET ⟲', onClick: function (api, ctrl) {
            scattered = 0; ctrl.hardReset();
          } }
      ],

      setup: function (api) {
        var st = api.state, rng = api.rng;
        scattered = 0;

        st.bumps = [];
        for (var b = 0; b < P.BASE_BUMPS; b++) {
          st.bumps.push({ x: 0.12 + rng() * 0.76, y: 0.12 + rng() * 0.76,
                          h: 0.26 + rng() * 0.16, s: 0.10 + rng() * 0.05 });
        }
        st.h = new Float32Array(P.HG * P.HG);
        st.layer = null;
        st.layerAge = 0;

        // Two things here never change, and recomputing them was costing ~141k
        // exp() calls PER FRAME — enough to push p95 frame time to 24ms.
        //
        //  1. the base terrain, which is static
        //  2. the deposition kernel, which is the same Gaussian stamp every time
        //     and only differs by where it lands
        st.reach = Math.ceil(2.5 * P.KERNEL * (P.HG - 1));
        var kw = 2 * st.reach + 1;
        st.kern = new Float32Array(kw * kw);
        for (var kj = 0; kj < kw; kj++) {
          for (var ki = 0; ki < kw; ki++) {
            var kx = (ki - st.reach) / (P.HG - 1), ky = (kj - st.reach) / (P.HG - 1);
            st.kern[kj * kw + ki] = P.RATE * Math.exp(-(kx * kx + ky * ky) / (2 * P.KERNEL * P.KERNEL));
          }
        }
        st.kw = kw;
        st.baseGrid = null;   // filled once st.base exists, below

        st.ag = [];
        for (var i = 0; i < P.POP; i++) {
          st.ag.push({ x: 0.10 + rng() * 0.80, y: 0.10 + rng() * 0.80, px: 0, py: 0 });
        }

        st.base = function (x, y) {
          var best = 0;
          for (var k = 0; k < st.bumps.length; k++) {
            var dx = x - st.bumps[k].x, dy = y - st.bumps[k].y;
            var v = st.bumps[k].h * Math.exp(-(dx * dx + dy * dy) / (2 * st.bumps[k].s * st.bumps[k].s));
            if (v > best) best = v;
          }
          return best;
        };
        st.field = function (x, y) {
          return st.base(x, y) + K.bilinear(st.h, P.HG, P.HG, x, y);
        };

        // The base terrain is static, so bake it to the render grid once. The
        // redraw was calling base() per cell — 25,600 cells x 5 bumps of exp()
        // on every rebuild frame, which was the whole p95 spike.
        st.baseGrid = new Float32Array(P.HG * P.HG);
        for (var bj = 0; bj < P.HG; bj++) {
          for (var bi2 = 0; bi2 < P.HG; bi2++) {
            st.baseGrid[bj * P.HG + bi2] = st.base(bi2 / (P.HG - 1), bj / (P.HG - 1));
          }
        }

        st.probe = function () {
          var mxBuilt = 0, mxBase = 0, sum = 0;
          for (var i = 0; i < st.h.length; i++) if (st.h[i] > mxBuilt) mxBuilt = st.h[i];
          for (var b2 = 0; b2 < st.bumps.length; b2++) if (st.bumps[b2].h > mxBase) mxBase = st.bumps[b2].h;
          for (var a = 0; a < P.POP; a++) sum += st.field(st.ag[a].x, st.ag[a].y);
          return {
            builtHeight: +mxBuilt.toFixed(3),
            tallestNatural: +mxBase.toFixed(3),
            builtExceedsNatural: mxBuilt > mxBase,
            meanFitness: +(sum / P.POP).toFixed(3),
            scattered: !!scattered
          };
        };
      },

      step: function (dt, api) {
        var st = api.state;
        if (api.steps > P.T_END) { api.restart = true; return; }

        // -- deposition (stamp the cached kernel) + decay --------------------
        var reach = st.reach, kw = st.kw, kern = st.kern;
        for (var i = 0; i < P.POP; i++) {
          var a = st.ag[i];
          var gi = Math.round(a.x * (P.HG - 1)), gj = Math.round(a.y * (P.HG - 1));
          var j0 = Math.max(0, gj - reach), j1 = Math.min(P.HG - 1, gj + reach);
          var k0 = Math.max(0, gi - reach), k1 = Math.min(P.HG - 1, gi + reach);
          for (var j = j0; j <= j1; j++) {
            var krow = (j - gj + reach) * kw - gi + reach;
            var hrow = j * P.HG;
            for (var k = k0; k <= k1; k++) st.h[hrow + k] += kern[krow + k];
          }
        }
        for (var n = 0; n < st.h.length; n++) {
          st.h[n] *= (1 - P.DECAY);
          if (st.h[n] > P.H_MAX) st.h[n] = P.H_MAX;
        }

        // -- repulsion -------------------------------------------------------
        for (var z = 0; z < P.POP; z++) { st.ag[z].px = 0; st.ag[z].py = 0; }
        for (var q1 = 0; q1 < P.POP; q1++) {
          for (var q2 = q1 + 1; q2 < P.POP; q2++) {
            var A = st.ag[q1], B = st.ag[q2];
            var rx = A.x - B.x, ry = A.y - B.y, rd = Math.hypot(rx, ry);
            if (rd >= P.SEP_R) continue;
            var ux, uy;
            if (rd < 1e-6) { var uu = K.hashUnitVec(q1 * 37 + q2, api.steps, api.seed); ux = uu.x; uy = uu.y; }
            else { ux = rx / rd; uy = ry / rd; }
            var f = P.SEP_K * (P.SEP_R - rd) / P.SEP_R;
            A.px += f * ux; A.py += f * uy; B.px -= f * ux; B.py -= f * uy;
          }
        }

        // -- move: climb the CONSTRUCTED field, plus cohesion ----------------
        var eps = 0.010;
        var cx = 0, cy = 0;
        for (var c = 0; c < P.POP; c++) { cx += st.ag[c].x; cy += st.ag[c].y; }
        cx /= P.POP; cy /= P.POP;

        for (var m = 0; m < P.POP; m++) {
          var ag = st.ag[m];
          var gx = (st.field(ag.x + eps, ag.y) - st.field(ag.x - eps, ag.y)) / (2 * eps);
          var gy = (st.field(ag.x, ag.y + eps) - st.field(ag.x, ag.y - eps)) / (2 * eps);
          var tx = cx - ag.x, ty = cy - ag.y;
          var tl = Math.hypot(tx, ty) || 1;
          var u2 = K.hashUnitVec(m + 613, api.steps, api.seed);
          var vx = gx * P.GRAD_W + P.COH * tx / tl + P.WANDER * u2.x + ag.px;
          var vy = gy * P.GRAD_W + P.COH * ty / tl + P.WANDER * u2.y + ag.py;
          var vl = Math.hypot(vx, vy) || 1;
          ag.x = K.clamp(ag.x + P.STEP * vx / vl, 0.02, 0.98);
          ag.y = K.clamp(ag.y + P.STEP * vy / vl, 0.02, 0.98);
        }
      },

      render: function (g, api) {
        var st = api.state, PAL = api.P;
        g.fillStyle = PAL.bg;
        g.fillRect(0, 0, api.W, api.H);

        if (!st.layer || --st.layerAge <= 0) {
          st.layer = st.layer || K.offscreen(P.HG, P.HG);
          var c = st.layer.getContext('2d');
          var img = c.createImageData(P.HG, P.HG);
          for (var j = 0; j < P.HG; j++) {
            for (var i = 0; i < P.HG; i++) {
              var gidx = j * P.HG + i;
              var v = K.clamp(st.baseGrid[gidx] + st.h[gidx], 0, 1);
              var t = Math.pow(v, 0.85);
              var idx = (j * P.HG + i) * 4;
              var band = Math.abs((v * 7) % 1 - 0.5) < 0.05 ? 34 : 0;
              // SIM 4's two-segment violet luminance ramp, verbatim — s26 and
              // s28 are one landscape story, so one colour language. (The old
              // ramp here peaked teal: a SUBSTRATE-era literal the 10 Aug hex
              // sweep couldn't catch because it lived as channel arithmetic.)
              var u4 = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
              if (t < 0.5) {
                img.data[idx]     = 14 + (59 - 14) * u4 + band;
                img.data[idx + 1] = 16 + (46 - 16) * u4 + band;
                img.data[idx + 2] = 48 + (140 - 48) * u4 + band;
              } else {
                img.data[idx]     = 59 + (255 - 59) * u4 + band;
                img.data[idx + 1] = 46 + (243 - 46) * u4 + band;
                img.data[idx + 2] = 140 + (208 - 140) * u4 + band;
              }
              img.data[idx + 3] = 255;
            }
          }
          c.putImageData(img, 0, 0);
          st.layerAge = 5;                    // rebuild every 5th frame: at 160x160 x 5 bumps a
                                              // rebuild is ~128k exp(), and doing it every other
                                              // frame pushed p95 to 24ms
        }

        g.imageSmoothingEnabled = true;
        g.drawImage(st.layer, PX, PY, PW, PH);
        g.strokeStyle = '#4AE87C'; g.lineWidth = 3;
        g.strokeRect(PX + 1.5, PY + 1.5, PW - 3, PH - 3);

        // flat round particles (10 Aug — glows and triangle headings removed)
        for (var b = 0; b < P.POP; b++) {
          global.SwarmChem.drawOid(g, PX + st.ag[b].x * PW, PY + st.ag[b].y * PH,
            0, 6, '#4AE87C', null);
        }
      }
    });
  }

  global.makeSim4b = makeSim4b;

})(typeof window !== 'undefined' ? window : this);
