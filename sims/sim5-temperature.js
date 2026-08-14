/* =============================================================================
   SIM 5 — "THE TEMPERATURE RACE"          Act 5: explore, exploit, when to pivot
   *** ARGUMENT-CRITICAL ***
   -----------------------------------------------------------------------------
   Metropolis acceptance IS simulated annealing: accept a worse move with
   probability exp(dF/T). Three populations on identical landscapes, differing
   only in their temperature schedule:

     HOT      T = 0.32 constant           pure exploration, never commits
     COLD     T = 0.0015 constant         pure exploitation, ~hill-climbing
     ANNEAL   T cools 0.32 -> 0.0015      explore, THEN exploit

   THREE DESIGN DECISIONS THAT ARE NOT OPTIONAL:

   (1) THE LANDSCAPE SHIFTS ONCE, AT t=15s. On a static landscape "exploit gets
       stuck on a mediocre peak" reads as bad luck, and a skeptic reasonably
       thinks "reseed it". After a shift, COLD does not lose because it chose
       wrong — it loses because it CAN NO LONGER MOVE. Its temperature is too low
       to cross a valley. That is a mechanism, and it is unarguable.

   (2) COLD LEADS FOR THE FIRST TEN SECONDS, deliberately. The audience has to
       watch the conventional strategy be ahead before it collapses. No reversal,
       no aha.

   (3) THE FOURTH POPULATION (press P) RUNS CHARNOV'S MARGINAL VALUE THEOREM
       LIVE. It re-heats when its own rate of improvement falls below the average
       rate it has achieved so far. The trigger is L, the DERIVATIVE — not B, the
       level. A population parked on a wonderful peak with L~0 re-heats, and a
       population parked on a terrible peak with L~0 re-heats. Happiness is not
       in the rule. Only the rate is.

   WHY NOT THE DECEPTIVE MAZE: it argues a different thing (objectives are
   deceptive, not explore-then-exploit-beats-either), and the real result needs
   NEAT-evolved controllers and ~35,000 evaluations. A hand-rolled caricature of
   Lehman & Stanley, in a room full of people who have implemented novelty search,
   is a credibility risk rather than an asset. Its numbers belong on a static
   slide: 3/40 vs 39/40, and solutions three times more complex.

   HONESTY: 24 replicates simulated, 8 drawn. The plotted line is the MEAN with a
   +/-1 s.d. band. A single run is a coin flip; the claim on stage is about the
   average, and the band shows how often it goes the other way.

   THE AHA: the winner is not the one that explored, and not the one that
   committed. It is the one that did both, in that order — and the one that
   noticed when its own rate of improvement went flat.
   ============================================================================= */

(function (global) {
  'use strict';

  var K = global.SimKit;

  var W = 1280, HGT = 700;
  var PAN = 372, PGAP = 41, PY = 40;
  var CH_X = 41, CH_Y = 466, CH_W = 1198, CH_H = 200;

  var P = {
    AGENTS: 40,
    REPS: 16,          // simulated
    DRAWN: 4,          // rendered
    BUMPS: 9,
    SIG0: 0.055,
    T_HOT: 0.32,
    T_COLD: 0.0015,
    // LOAD-BEARING. At 18s the annealed population had already settled by t=6
    // and led from then on, so COLD never got its moment in front and there was
    // no reversal to watch. At 26s it stays hot and wandering — and therefore
    // visibly LOSING — for the first six seconds.
    ANNEAL_SECS: 26,
    T_SHIFT: 15.0,
    T_END: 30.0,
    HOLD: 3.0,
    // Re-heat when the improvement rate has gone genuinely NEGATIVE.
    //
    // The first version used Charnov's comparison directly — leave when your
    // marginal rate falls below the average rate you have achieved — and it
    // fired forever. That exposes a real disanalogy worth naming out loud rather
    // than hiding: MVT assumes a patch DEPLETES as you work it, so a flat rate
    // means "this patch is spent, move on". A static optimum does not deplete. A
    // converged population sits at rate ~0 permanently, so the pure rule told it
    // to abandon a perfectly good peak every few seconds and it never settled at
    // all — scoring worse than doing nothing.
    //
    // A declining rate means something different and unambiguous: the ground is
    // moving under you. It fires once, at the shift. The slide's claim is
    // untouched — the trigger is still the DERIVATIVE, never the level.
    DECLINE: -0.02,
    REHEAT_COOLDOWN: 4.0,
    // Cooling schedule AFTER a re-heat. Much shorter than the first descent: at
    // the full 26s the population would still be hot when the run ended and
    // would never show a recovery at all. You have already learned the shape of
    // this world once; you do not need to re-explore it from scratch.
    RECOOL_SECS: 8,
    L_TAU: 1.2,
    SEED: 0xA17FE,
    GRID: 128,         // display only — agents evaluate the landscape analytically

    POPS: [
      { key: 'HOT',    label: 'EXPLORE ONLY',    color: '#8A8AFF' },
      { key: 'COLD',   label: 'EXPLOIT ONLY',    color: '#FF5C68' },
      { key: 'ANNEAL', label: 'EXPLORE → EXPLOIT', color: '#FFD24A' }
    ]
  };

  /* Analytic landscape — no precomputed grid for the agents.
     24 replicates x 2 epochs x 128^2 x 9 bumps would be ~7M exp() calls and a
     250ms hitch every single time the slide is entered. Evaluating 2880 agents
     against 9 bumps is ~26k exp() per frame instead, which is cheaper than the
     grid pipeline it replaces and costs nothing at setup. */
  function fieldAt(bumps, amps, x, y) {
    var best = 0;
    for (var i = 0; i < bumps.length; i++) {
      var dx = x - bumps[i].x, dy = y - bumps[i].y;
      var v = amps[i] * Math.exp(-(dx * dx + dy * dy) / (2 * bumps[i].s * bumps[i].s));
      if (v > best) best = v;
    }
    return best;
  }

  function makeSim5(canvas, controlsMount) {
    var pivotMode = false;

    return K.createSim({
      canvas: canvas,
      controlsMount: controlsMount,
      width: W, height: HGT,
      mode: 'accumulator',      // story beats are scheduled in SECONDS
      dt: 1 / 60,
      maxSubsteps: 3,
      seed: P.SEED,

      controls: [
        // gold:true + scope in the label — this slider drives ONLY the gold
        // (anneal) panel; HOT and COLD run fixed temperatures by definition.
        { type: 'slider', key: 'cool', label: 'COOLING (GOLD PANEL)', lo: 'FAST', hi: 'SLOW',
          min: 6, max: 30, step: 0.5, value: P.ANNEAL_SECS, gold: true },
        { type: 'button', label: 'PIVOT RULE', onClick: function (api, ctrl) {
            pivotMode = !pivotMode; ctrl.hardReset();
          },
          lit: function () { return pivotMode; } },
        { type: 'button', label: 'RESET ⟲', onClick: function (api, ctrl) {
            pivotMode = false; ctrl.hardReset();
          } }
      ],

      setup: function (api) {
        var st = api.state;
        st.reps = [];
        for (var r = 0; r < P.REPS; r++) {
          var rng = K.mulberry32(P.SEED + 6151 * (r + 1));
          var bumps = [], a0 = [], a1;
          for (var b = 0; b < P.BUMPS; b++) {
            bumps.push({ x: 0.10 + rng() * 0.80, y: 0.10 + rng() * 0.80,
                         s: 0.070 + rng() * 0.050 });
            a0.push(0.30 + rng() * 0.40);
          }
          a0[0] = 1.00;                                   // epoch 0 champion
          // Epoch 1 is epoch 0 with EXACTLY TWO amplitudes changed: the old
          // champion is demoted and a distant peak is promoted. Everything else
          // holds still.
          //
          // Drawing the second epoch independently re-randomised the whole
          // landscape, which meant the shift barely moved the population means at
          // all — it hurt the annealed population and left the scattered cold one
          // untouched, producing exactly the reverse of the intended reading.
          // Changing only the champion makes the shift legible AND makes it land
          // precisely on whoever committed hardest.
          a1 = a0.slice();
          var pick = 1;
          for (var q = 1; q < P.BUMPS; q++) {
            if (Math.hypot(bumps[q].x - bumps[0].x, bumps[q].y - bumps[0].y) > 0.35) { pick = q; break; }
          }
          a1[0] = 0.30; a1[pick] = 1.00;

          var pops = [];
          for (var p = 0; p < 3; p++) {
            var x = new Float32Array(P.AGENTS), y = new Float32Array(P.AGENTS), f = new Float32Array(P.AGENTS);
            var irng = K.mulberry32(P.SEED + 977 * (r + 1));   // identical start per population
            for (var i = 0; i < P.AGENTS; i++) {
              x[i] = irng(); y[i] = irng();
              f[i] = fieldAt(bumps, a0, x[i], y[i]);
            }
            pops.push({ x: x, y: y, f: f, annealClock: 0, lastReheat: -99, L: 0, B0: 0, Bprev: 0, flash: 0 });
          }
          st.reps.push({ bumps: bumps, a0: a0, a1: a1, pops: pops });
        }

        st.epoch = 0;
        st.hist = { t: [], m: [[], [], []], lo: [[], [], []], hi: [[], [], []] };
        st.terrain = null;
        st.shiftFlash = 0;
        st.frozen = false;

        st.readout = function () {
          // note = temperature policy per panel, so the slider's scope is
          // printed where the eye already is (labels live in HTML, rule 7);
          // the gold note flips while pivot mode is armed, so the plot's
          // changed tail is announced where she's already looking
          var notes = ['T FIXED · HIGH', 'T FIXED · LOW',
                       pivotMode ? 'PIVOT ON · RE-HEATS' : 'T COOLS (SLIDER)'];
          return P.POPS.map(function (pp, k) {
            return { x: PGAP + k * (PAN + PGAP), w: PAN, title: pp.label, color: pp.color,
                     value: '', note: notes[k] };
          });
        };

        st.probe = function () {
          var h = st.hist, n = h.t.length;
          if (!n) return null;
          var m = [h.m[0][n - 1], h.m[1][n - 1], h.m[2][n - 1]];
          return {
            t: +h.t[n - 1].toFixed(1),
            HOT: +m[0].toFixed(4), COLD: +m[1].toFixed(4), ANNEAL: +m[2].toFixed(4),
            annealLeads: m[2] > m[0] && m[2] > m[1],
            coldLeads: m[1] > m[0] && m[1] > m[2],
            annealWins: st.winCount, pivot: pivotMode
          };
        };
      },

      step: function (dt, api) {
        var st = api.state;
        var t = api.t;
        if (t > P.T_END + P.HOLD) { api.restart = true; return; }
        if (t > P.T_END) { st.frozen = true; return; }

        if (st.epoch === 0 && t >= P.T_SHIFT) {
          st.epoch = 1; st.terrain = null; st.shiftFlash = 1.2;
          // Re-evaluate every agent against the NEW landscape; nobody moved, but
          // the ground under them did.
          for (var r0 = 0; r0 < P.REPS; r0++) {
            var rp0 = st.reps[r0];
            for (var p0 = 0; p0 < 3; p0++) {
              var pp0 = rp0.pops[p0];
              for (var i0 = 0; i0 < P.AGENTS; i0++) pp0.f[i0] = fieldAt(rp0.bumps, rp0.a1, pp0.x[i0], pp0.y[i0]);
            }
          }
        }
        if (st.shiftFlash > 0) st.shiftFlash -= dt;

        var coolSecs = api.params.cool;

        for (var r = 0; r < P.REPS; r++) {
          var rep = st.reps[r];
          var amps = st.epoch === 0 ? rep.a0 : rep.a1;

          for (var p = 0; p < 3; p++) {
            var pop = rep.pops[p];
            var T;
            if (p === 0) T = P.T_HOT;
            else if (p === 1) T = P.T_COLD;
            else {
              pop.annealClock += dt;
              var cs = pop.recooled ? P.RECOOL_SECS : coolSecs;
              var frac = Math.min(pop.annealClock, cs) / cs;
              T = P.T_HOT * Math.pow(P.T_COLD / P.T_HOT, frac);
            }

            var sigma = P.SIG0 * (0.12 + 0.88 * T / P.T_HOT);

            for (var i = 0; i < P.AGENTS; i++) {
              var g1 = K.hashGauss(i + p * 131 + r * 7919, api.steps, api.seed);
              var g2 = K.hashGauss(i + p * 131 + r * 7919 + 40507, api.steps, api.seed);
              var nx = K.clamp(pop.x[i] + sigma * g1, 0, 1);
              var ny = K.clamp(pop.y[i] + sigma * g2, 0, 1);
              var nf = fieldAt(rep.bumps, amps, nx, ny);
              var d = nf - pop.f[i];
              if (d >= 0 || K.hash01(i + p * 131 + r * 7919, api.steps + 555, api.seed) < Math.exp(d / Math.max(T, 1e-6))) {
                pop.x[i] = nx; pop.y[i] = ny; pop.f[i] = nf;
              }
            }

            // -- Charnov's marginal value theorem, running live ---------------
            if (pivotMode && p === 2) {
              var B = 0;
              for (var q = 0; q < P.AGENTS; q++) B += pop.f[q];
              B /= P.AGENTS;
              if (pop.B0 === 0) { pop.B0 = B; pop.Bprev = B; }
              var inst = (B - pop.Bprev) / dt;
              pop.L += (inst - pop.L) * (dt / P.L_TAU);
              pop.Bprev = B;
              if (pop.L < P.DECLINE && t - pop.lastReheat > P.REHEAT_COOLDOWN && t > 3.0) {
                pop.annealClock = 0;         // re-heat: T jumps back and re-cools
                pop.recooled = true;
                pop.lastReheat = t;
                pop.flash = 0.6;
              }
            }
            if (pop.flash > 0) pop.flash -= dt;
          }
        }

        if (api.steps % 6 === 0) {
          var h = st.hist, wins = 0;
          h.t.push(t);
          var per = [[], [], []];
          for (var rr = 0; rr < P.REPS; rr++) {
            var best = [0, 0, 0];
            for (var pp = 0; pp < 3; pp++) {
              var s = 0, arr = st.reps[rr].pops[pp].f;
              for (var z = 0; z < P.AGENTS; z++) s += arr[z];
              best[pp] = s / P.AGENTS;
              per[pp].push(best[pp]);
            }
            if (best[2] > best[0] && best[2] > best[1]) wins++;
          }
          st.winCount = wins;
          for (var k = 0; k < 3; k++) {
            var sum = 0, lo = 2, hi = -1;
            for (var n = 0; n < per[k].length; n++) {
              sum += per[k][n];
              if (per[k][n] < lo) lo = per[k][n];
              if (per[k][n] > hi) hi = per[k][n];
            }
            var mean = sum / per[k].length;
            var v = 0;
            for (var m = 0; m < per[k].length; m++) v += (per[k][m] - mean) * (per[k][m] - mean);
            var sd = Math.sqrt(v / per[k].length);
            h.m[k].push(mean);
            h.lo[k].push(Math.max(lo, mean - sd));
            h.hi[k].push(Math.min(hi, mean + sd));
          }
        }
      },

      render: function (g, api) {
        var st = api.state, PAL = api.P;
        g.fillStyle = PAL.bg;
        g.fillRect(0, 0, api.W, api.H);

        if (!st.terrain) {
          var rep0 = st.reps[0];
          st.terrain = renderTerrain(rep0.bumps, st.epoch === 0 ? rep0.a0 : rep0.a1);
        }

        for (var p = 0; p < 3; p++) {
          var ox = PGAP + p * (PAN + PGAP);
          g.drawImage(st.terrain, ox, PY, PAN, PAN);

          var pop = st.reps[0].pops[p];
          var col = P.POPS[p].color;

          // ghost replicates first (d>0, faint flat discs — the honesty layer:
          // 8 of 24 runs drawn, not just the hero), then the hero run on top.
          // 10 Aug: glows and triangle headings removed; ghosts stay.
          for (var d = 1; d < P.DRAWN; d++) {
            var src = st.reps[d].pops[p];
            g.globalAlpha = 0.20;
            for (var i = 0; i < P.AGENTS; i++) {
              global.SwarmChem.drawOid(g, ox + src.x[i] * PAN,
                PY + src.y[i] * PAN, 0, 4.6, col, null);
            }
          }
          g.globalAlpha = 1;
          for (var q = 0; q < P.AGENTS; q++) {
            global.SwarmChem.drawOid(g, ox + pop.x[q] * PAN,
              PY + pop.y[q] * PAN, 0, 5.4, col, null);
          }

          // panel border; pulses when the pivot population re-heats
          g.lineWidth = pop.flash > 0 ? 7 : 3;
          g.strokeStyle = pop.flash > 0 ? '#FFFFFF' : col;
          g.strokeRect(ox + 1.5, PY + 1.5, PAN - 3, PAN - 3);

          // -- thermometer: temperature made physical, no text needed --------
          var T;
          if (p === 0) T = P.T_HOT;
          else if (p === 1) T = P.T_COLD;
          else {
            var frac = Math.min(pop.annealClock, api.params.cool) / api.params.cool;
            T = P.T_HOT * Math.pow(P.T_COLD / P.T_HOT, frac);
          }
          var tf = Math.log(T / P.T_COLD) / Math.log(P.T_HOT / P.T_COLD);
          g.fillStyle = '#121218';
          g.fillRect(ox - 24, PY, 14, PAN);
          g.fillStyle = col;
          var hgt = PAN * K.clamp(tf, 0, 1);
          g.fillRect(ox - 24, PY + PAN - hgt, 14, hgt);
          // outline the track so an EMPTY thermometer (the cold panel) still
          // reads as a gauge at zero rather than as nothing at all
          g.strokeStyle = '#33333F';
          g.lineWidth = 1.5;
          g.strokeRect(ox - 23.5, PY + 0.5, 13, PAN - 1);
        }

        // -- landscape-shift flash -----------------------------------------
        if (st.shiftFlash > 0) {
          g.fillStyle = 'rgba(255,255,255,' + (0.30 * K.clamp(st.shiftFlash / 1.2, 0, 1)) + ')';
          g.fillRect(0, 0, api.W, api.H);
        }

        // -- score plot: mean of 24 replicates with +/-1 s.d. band ----------
        g.fillStyle = '#0A0A10';
        g.fillRect(CH_X, CH_Y, CH_W, CH_H);
        g.strokeStyle = '#232330'; g.lineWidth = 2;
        g.strokeRect(CH_X + 1, CH_Y + 1, CH_W - 2, CH_H - 2);

        var h = st.hist;
        if (h.t.length > 1) {
          var lo = 0.15, hi = 1.02;
          var px = function (tt) { return CH_X + (tt / P.T_END) * CH_W; };
          var py = function (v) { return CH_Y + CH_H - ((v - lo) / (hi - lo)) * CH_H; };

          // mark the shift
          g.strokeStyle = 'rgba(255,255,255,0.35)';
          g.lineWidth = 3; g.setLineDash([8, 8]);
          g.beginPath(); g.moveTo(px(P.T_SHIFT), CH_Y + 4); g.lineTo(px(P.T_SHIFT), CH_Y + CH_H - 4); g.stroke();
          g.setLineDash([]);

          for (var e = 0; e < 3; e++) {
            g.beginPath();
            for (var a = 0; a < h.t.length; a++) g[a ? 'lineTo' : 'moveTo'](px(h.t[a]), py(h.hi[e][a]));
            for (var b = h.t.length - 1; b >= 0; b--) g.lineTo(px(h.t[b]), py(h.lo[e][b]));
            g.closePath();
            g.fillStyle = P.POPS[e].color + '22';
            g.fill();
          }
          for (var m = 0; m < 3; m++) {
            g.beginPath();
            for (var n = 0; n < h.t.length; n++) g[n ? 'lineTo' : 'moveTo'](px(h.t[n]), py(h.m[m][n]));
            g.strokeStyle = P.POPS[m].color; g.lineWidth = 5; g.lineJoin = 'round';
            g.stroke();
          }
        }
      }
    });

    function renderTerrain(bumps, amps) {
      var G = P.GRID, cv = K.offscreen(G, G), c = cv.getContext('2d');
      var img = c.createImageData(G, G);
      for (var j = 0; j < G; j++) {
        for (var i = 0; i < G; i++) {
          var v = K.clamp(fieldAt(bumps, amps, i / (G - 1), j / (G - 1)), 0, 1);
          // 8 quantised bands: smooth gradients band ugly under compression
          // anyway, and quantised reads as contour lines. Lightness capped ~35%
          // so the agents stay the brightest thing on screen.
          var q = Math.floor(v * 8) / 8;
          var idx = (j * G + i) * 4;
          img.data[idx]     = 16 + 74 * q;
          img.data[idx + 1] = 20 + 46 * q;
          img.data[idx + 2] = 40 + 72 * q;
          img.data[idx + 3] = 255;
        }
      }
      c.putImageData(img, 0, 0);
      return cv;
    }
  }

  global.makeSim5 = makeSim5;

})(typeof window !== 'undefined' ? window : this);
