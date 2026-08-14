/* =============================================================================
   SIM 1 — "THE PEAK YOU'RE STANDING ON"          Act 1: the environment moves
   -----------------------------------------------------------------------------
   A 1D fitness landscape drawn as a glowing cross-section silhouette, with 14
   large agents sitting ON the curve.

   WHY 1D CROSS-SECTION AND NOT A 2D HEIGHTMAP: a 2D noise field with a colormap
   is the worst possible thing to put on a low-bitrate H.264 stream — high
   frequency detail everywhere starves the bitrate and macroblocks into mush. A
   bold filled silhouette plus 14 fat dots is enormous flat colour regions, which
   is exactly what compression preserves. It is also Wright's 1932 diagram,
   rotated 90 degrees.

   The terrain deforms from TWO sources at once:
     (1) EXOGENOUS — a deterministic wall-clock schedule. The 2015 peak decays;
         a new peak rises far right. This is the robustness guarantee: the stage
         performs no matter what the agents do.
     (2) ENDOGENOUS — a depletion field. The ground sags UNDER the crowd. The
         dimple is NARROWER than the peak (s=0.045 < w0=0.075), so it forms a
         visible crater with shoulders that shove rim agents outward.
         Emergent dispersal. Nobody decided to leave.

   THE AHA: every stranded agent is still at a local maximum when the lights go
   out. The rule that got them to the top is the rule that stranded them — and
   the hill sank partly because they were all standing on it.
   ============================================================================= */

(function (global) {
  'use strict';

  var K = global.SimKit;

  var P = {
    N: 14, N_EXPLORERS: 2,
    G: 200,                          // depletion grid resolution
    X_MIN: 0.02, X_MAX: 0.98,

    // (c, w, kind, base, amp, t0, tau)  — say each of these out loud on stage
    //
    // TIMING IS THE STORY. The climbers must be allowed to WIN first — to sit on
    // a tall peak looking obviously correct — before the ground goes. Decay t0
    // is therefore well after they summit (~4s), not on top of it.
    //   t=0-4   converge      t=4-11  piled on a TALL peak, visibly winning
    //   t=11-18 it sinks      t=18-26 stranding; the new peak rises
    //   t=26-36 final tableau
    PEAKS: [
      { c: 0.24, w: 0.075, kind: 'decay', base: 0.30, amp: 0.70, t0: 12.0, tau: 2.2 }, // "the 2015 peak"
      { c: 0.50, w: 0.060, kind: 'const', base: 0.45 },                                 // adjacent field
      { c: 0.80, w: 0.070, kind: 'rise',  base: 0.15, amp: 1.00, t0: 19.0, tau: 2.6 }, // "the new peak"
      { c: 0.62, w: 0.220, kind: 'const', base: 0.18 }                                  // background swell
    ],
    DRIFT_AMP: 0.03, DRIFT_W: [0.15, 0.40],

    CROWD_SIGMA: 0.045,              // NARROWER than peak w=0.075 -> crater w/ shoulders
    UPTAKE: 0.55, RECOVERY: 0.22,    // recovery 0.22 => ~4.5s memory: niches don't snap back
    DEPLETION_SCALE: 0.26, D_MAX: 3.0,

    // Short-range repulsion. WITHOUT THIS THE DEMO DOES NOT WORK: near a peak
    // the restoring rate is mu*|H''| ~= 0.060 * (1.0/0.075^2) ~= 10.7/s, so the
    // stationary spread is sigma/sqrt(2k) ~= 0.008/4.63 ~= 0.0017 — about two
    // pixels. All twelve climbers render as ONE dot, and the audience cannot see
    // the crowd that is sinking the peak.
    // Raising sigma instead would let them diffuse across the valley and break
    // the argument. Repulsion is short-range and bounded, so it spreads the
    // cluster visually while leaving the valley arithmetic untouched — and it is
    // on-theme, because crowding is what this whole act is about.
    SEP_R: 0.020, SEP_K: 12.0,

    MU:    { CLIMBER: 0.060, EXPLORER: 0.018 },
    SIGMA: { CLIMBER: 0.008, EXPLORER: 0.060 },
    EPS: 0.004,

    ENERGY_GAIN: 0.55, ENERGY_COST: 0.22,   // break-even at H = 0.40
    REVIVE_H: 0.55, REVIVE_RATE: 0.15, REVIVE_THRESH: 0.25,

    TRAIL_LEN: 10,
    LOOP_AT: 40.0,
    H_DISPLAY_MAX: 1.35,
    SEED: 20260817
  };

  /* -- LOAD-BEARING ARITHMETIC. Do not touch MU/SIGMA without redoing this. ----
     Max |grad H| on a unit Gaussian of width 0.075 is 1/(0.075*sqrt(e)) ~= 8.1.
     Climber peak speed = 0.060 * 8.1 ~= 0.49 domain-widths/sec -> summits in ~3s
     from mid-flank. Fast enough to satisfy, slow enough to watch.

     Climber diffusion over 10s = 0.008 * sqrt(10) ~= 0.025.
     THE VALLEY FROM x=0.24 TO x=0.80 IS 0.56 WIDE.
     A climber cannot cross it by luck — by a factor of ~22. That is WHY they are
     genuinely stranded rather than merely unlucky, and it is the load-bearing
     fact of the whole demo.

     Explorer diffusion over 10s = 0.060 * sqrt(10) ~= 0.19 — a fifth of the world.

     Energy: on a full peak +0.33/s (0->1 in 3s). In the valley at H~0.18,
     -0.12/s (1->0 in 8.3s). Stranding is a SLOW FADE, not a pop. Critical for
     the emotional read.
  ---------------------------------------------------------------------------- */

  function amplitude(peak, T) {
    if (peak.kind === 'const') return peak.base;
    var s = K.sigmoid((T - peak.t0) / peak.tau);
    if (peak.kind === 'rise')  return peak.base + peak.amp * s;
    return peak.base + peak.amp * (1 - s);           // decay
  }

  /** Base landscape H0 before any crowd depletion. T is already scaled by RATE. */
  function H0(x, T, st) {
    var sum = 0;
    for (var k = 0; k < P.PEAKS.length; k++) {
      var pk = P.PEAKS[k];
      var c = pk.c + P.DRIFT_AMP * Math.sin(st.driftW[k] * T + st.driftPhi[k]);
      var d = x - c;
      sum += amplitude(pk, T) * Math.exp(-(d * d) / (2 * pk.w * pk.w));
    }
    return sum;
  }

  /** Realised landscape: base terrain minus what the crowd has eaten out of it. */
  function Hreal(x, T, st, crowding) {
    var base = H0(x, T, st);
    if (crowding <= 0) return base;
    var g = K.clamp(x, 0, 1) * (P.G - 1);
    var i0 = g | 0, i1 = Math.min(i0 + 1, P.G - 1), f = g - i0;
    var D = st.D[i0] * (1 - f) + st.D[i1] * f;
    return Math.max(0, base - crowding * P.DEPLETION_SCALE * D);
  }

  function makeSim1(canvas, controlsMount) {
    return K.createSim({
      canvas: canvas,
      controlsMount: controlsMount,
      width: 1280, height: 620,
      mode: 'accumulator',       // story beats are scheduled in SECONDS, so a
      dt: 1 / 60,                // dropped frame must not shift the schedule
      maxSubsteps: 3,
      seed: P.SEED,

      controls: [
        // world:true — both knobs reshape the terrain, not one population;
        // a violet slider next to violet climbers read as "climbers only"
        { type: 'slider', key: 'rate', label: 'CHANGE RATE', lo: 'SLOW', hi: 'FAST',
          min: 0.15, max: 3.0, step: 0.01, value: 1.0, world: true,
          detent: 1.0, detentEps: 0.05 },   // always snap back to the rehearsed run
        { type: 'slider', key: 'crowding', label: 'CROWDING', lo: 'OFF', hi: 'STRONG',
          min: 0, max: 1, step: 0.01, value: 0.6, world: true },
        { type: 'button', label: 'RESET ⟲', onClick: function (api, ctrl) { ctrl.hardReset(); } }
      ],

      setup: function (api) {
        var st = api.state;
        var rng = api.rng;

        st.driftW = [];
        st.driftPhi = [];
        for (var k = 0; k < P.PEAKS.length; k++) {
          st.driftW.push(K.lerp(P.DRIFT_W[0], P.DRIFT_W[1], rng()));
          st.driftPhi.push(rng() * 6.283185307179586);
        }

        st.D = new Float32Array(P.G);
        st.rho = new Float32Array(P.G);

        st.agents = [];
        for (var i = 0; i < P.N; i++) {
          var isExplorer = i >= P.N - P.N_EXPLORERS;
          // BOTH init ranges are deliberate, and both ARE the story — say so
          // plainly if anyone in Discord asks, because someone will.
          //
          // Climbers start LEFT-OF-CENTRE: everybody was working on the thing
          // that was hot in 2015. Uniform init would scatter several of them
          // into the right-hand basin, where they'd inherit the new peak for
          // free and the whole argument would evaporate.
          //
          // Explorers start in the right-hand half so at least one is always in
          // the new peak's basin: "some people were already off in a weird
          // corner of the space, and they looked like they were wasting their
          // time."
          var x0 = isExplorer
            ? K.lerp(0.55, 0.95, rng())
            : K.lerp(0.05, 0.42, rng());
          st.agents.push({
            x: x0,
            e: 0.55 + 0.35 * rng(),
            explorer: isExplorer,
            stranded: false,
            trail: []
          });
        }

        // Freeze the t=0 silhouette. The dashed ghost lets the audience SEE how
        // far the ground has moved from where it started. One extra polyline,
        // enormous narrative payoff.
        st.ghost = new Float32Array(P.G);
        for (var j = 0; j < P.G; j++) {
          st.ghost[j] = H0(j / (P.G - 1), 0, st);
        }

        st.curve = new Float32Array(P.G);
        st.grad = null;
        st.terrainGrad = null;
      },

      step: function (dt, api) {
        var st = api.state;
        var R = api.params.rate;
        var C = api.params.crowding;
        var T = api.t * R;

        // Loop cleanly and forever, via a FULL re-setup — a partial poke would
        // leave every agent wherever it was stranded and the second run would
        // be nonsense.
        if (api.t > P.LOOP_AT) { api.restart = true; return; }

        // --- crowd density (LIVE agents only) ------------------------------
        // A burnt-out agent stops consuming the niche. That is both true and a
        // good line.
        var rho = st.rho;
        rho.fill(0);
        var s2 = 2 * P.CROWD_SIGMA * P.CROWD_SIGMA;
        var reach = Math.ceil(3 * P.CROWD_SIGMA * (P.G - 1));   // truncate at 3 sigma
        var live = 0;
        for (var i = 0; i < st.agents.length; i++) {
          var a = st.agents[i];
          if (a.stranded) continue;
          live++;
          var gi = Math.round(a.x * (P.G - 1));
          var lo = Math.max(0, gi - reach), hi = Math.min(P.G - 1, gi + reach);
          for (var j = lo; j <= hi; j++) {
            var d = (j / (P.G - 1)) - a.x;
            rho[j] += Math.exp(-(d * d) / s2);
          }
        }
        var invN = 1 / P.N;
        for (var j2 = 0; j2 < P.G; j2++) {
          var target = rho[j2] * invN;
          st.D[j2] = K.clamp(st.D[j2] + dt * (P.UPTAKE * target - P.RECOVERY * st.D[j2]), 0, P.D_MAX);
        }

        // --- short-range repulsion (14 agents = 91 pairs; free) -------------
        for (var r1 = 0; r1 < st.agents.length; r1++) st.agents[r1].push = 0;
        for (var p1 = 0; p1 < st.agents.length; p1++) {
          if (st.agents[p1].stranded) continue;
          for (var p2 = p1 + 1; p2 < st.agents.length; p2++) {
            if (st.agents[p2].stranded) continue;
            var dx = st.agents[p1].x - st.agents[p2].x;
            var ad = Math.abs(dx);
            if (ad >= P.SEP_R) continue;
            // sign is stable even at exact overlap: break ties by index
            var dir = ad < 1e-6 ? (p1 < p2 ? 1 : -1) : (dx > 0 ? 1 : -1);
            var f = P.SEP_K * (P.SEP_R - ad);
            st.agents[p1].push += f * dir;
            st.agents[p2].push -= f * dir;
          }
        }

        // --- agents ---------------------------------------------------------
        var sqdt = Math.sqrt(dt);
        for (var m = 0; m < st.agents.length; m++) {
          var ag = st.agents[m];
          var h = Hreal(ag.x, T, st, C);

          if (!ag.stranded) {
            var mu    = ag.explorer ? P.MU.EXPLORER    : P.MU.CLIMBER;
            var sigma = ag.explorer ? P.SIGMA.EXPLORER : P.SIGMA.CLIMBER;
            var gp = Hreal(ag.x + P.EPS, T, st, C);
            var gm = Hreal(ag.x - P.EPS, T, st, C);
            var grad = (gp - gm) / (2 * P.EPS);
            // note sqrt(dt) on the noise — this is a DIFFUSION, not per-frame jitter
            var xi = K.hashGauss(m, api.steps, api.seed);
            ag.x += dt * (mu * grad + ag.push) + sigma * sqdt * xi;
            if (ag.x < P.X_MIN) ag.x = P.X_MIN + (P.X_MIN - ag.x);
            if (ag.x > P.X_MAX) ag.x = P.X_MAX - (ag.x - P.X_MAX);
            ag.x = K.clamp(ag.x, P.X_MIN, P.X_MAX);

            ag.e = K.clamp(ag.e + dt * (P.ENERGY_GAIN * h - P.ENERGY_COST), 0, 1);
            if (ag.e <= 0) ag.stranded = true;
          } else {
            // Stranded agents stay VISIBLE (grey) and can revive if terrain
            // rises under them. The screen never goes empty.
            if (h > P.REVIVE_H) {
              ag.e += dt * P.REVIVE_RATE;
              if (ag.e > P.REVIVE_THRESH) ag.stranded = false;
            }
          }

          if (api.steps % 4 === 0) {
            ag.trail.push(ag.x);
            if (ag.trail.length > P.TRAIL_LEN) ag.trail.shift();
          }
        }

        // --- cache the drawn curve -----------------------------------------
        for (var c2 = 0; c2 < P.G; c2++) {
          st.curve[c2] = Hreal(c2 / (P.G - 1), T, st, C);
        }
      },

      render: function (g, api) {
        var st = api.state, W = api.W, H = api.H, PAL = api.P;
        var baseY = H * 0.86;
        var span  = H * 0.62;

        function px(x) { return x * W; }
        function py(h) { return baseY - (h / P.H_DISPLAY_MAX) * span; }

        g.fillStyle = PAL.bg;
        g.fillRect(0, 0, W, H);

        // -- ghost terrain: where the ground WAS at t=0 ---------------------
        g.save();
        g.setLineDash([10, 10]);
        g.strokeStyle = 'rgba(241,241,245,0.30)';
        g.lineWidth = 2;
        g.beginPath();
        for (var i = 0; i < P.G; i++) {
          var X = px(i / (P.G - 1)), Y = py(st.ghost[i]);
          if (i === 0) g.moveTo(X, Y); else g.lineTo(X, Y);
        }
        g.stroke();
        g.restore();

        // -- filled terrain (gradient cached at first draw) ------------------
        if (!st.terrainGrad) {
          st.terrainGrad = g.createLinearGradient(0, py(P.H_DISPLAY_MAX), 0, baseY);
          st.terrainGrad.addColorStop(0, '#191934');
          st.terrainGrad.addColorStop(1, '#08080C');
        }
        g.beginPath();
        g.moveTo(0, baseY);
        for (var j = 0; j < P.G; j++) g.lineTo(px(j / (P.G - 1)), py(st.curve[j]));
        g.lineTo(W, baseY);
        g.closePath();
        g.fillStyle = st.terrainGrad;
        g.fill();

        // -- terrain top edge: the load-bearing line ------------------------
        g.beginPath();
        for (var k = 0; k < P.G; k++) {
          var X2 = px(k / (P.G - 1)), Y2 = py(st.curve[k]);
          if (k === 0) g.moveTo(X2, Y2); else g.lineTo(X2, Y2);
        }
        // neutral grey terrain line (was violet): the violet climbers sat ON a
        // violet curve and read as a thickening of the line once glows left
        g.strokeStyle = '#9CA0B2';
        g.lineWidth = 5;
        g.lineJoin = 'round';
        g.stroke();

        // -- trails ----------------------------------------------------------
        g.globalAlpha = 0.35;
        g.lineWidth = 3;
        for (var m = 0; m < st.agents.length; m++) {
          var a = st.agents[m];
          if (a.stranded || a.trail.length < 2) continue;
          g.strokeStyle = a.explorer ? PAL.amber : PAL.cyan;
          g.beginPath();
          for (var t = 0; t < a.trail.length; t++) {
            var TX = px(a.trail[t]);
            var TY = py(sampleCurve(st, a.trail[t]));
            if (t === 0) g.moveTo(TX, TY); else g.lineTo(TX, TY);
          }
          g.stroke();
        }
        g.globalAlpha = 1;

        // -- agents: flat round particles, one colour each (10 Aug — glows
        // and triangle headings removed; grey = stranded is the only state cue)
        for (var q = 0; q < st.agents.length; q++) {
          var b = st.agents[q];
          global.SwarmChem.drawOid(g, px(b.x), py(sampleCurve(st, b.x)), 0, 11,
            b.stranded ? PAL.stranded : (b.explorer ? PAL.amber : PAL.cyan), null);
        }
      }
    });

    function sampleCurve(st, x) {
      var gi = K.clamp(x, 0, 1) * (P.G - 1);
      var i0 = gi | 0, i1 = Math.min(i0 + 1, P.G - 1), f = gi - i0;
      return st.curve[i0] * (1 - f) + st.curve[i1] * f;
    }
  }

  global.makeSim1 = makeSim1;

})(typeof window !== 'undefined' ? window : this);
