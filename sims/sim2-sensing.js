/* =============================================================================
   SIM 2 — "VISIBLE vs TRUE FIELD"                    Act 2: two kinds of sensing
   -----------------------------------------------------------------------------
   THREE populations, not two. Two controls and one hybrid — because a two-way
   demo only shows "external-only is bad", which argues for pure introspection,
   the opposite of the point.

   THE MODELLING DECISION THAT MAKES THIS RIGOROUS RATHER THAN STIPULATED:

       Exteroception gives you a VECTOR. Interoception gives you a SCALAR.

   An agent sensing the external field can measure its GRADIENT — it knows which
   way is up. An agent sensing its own internal state knows only how it is doing
   RIGHT NOW, with no directional information at all. To turn a scalar into a
   direction it must compare across time and use memory — which is run-and-tumble
   chemotaxis, exactly what E. coli does. Physically honest, an idiom this
   audience loves, and it hands you both failure modes for free:

     EXTEROCEPTION ONLY : fast, directed, confidently wrong.
     INTEROCEPTION ONLY : right in principle, diffusive, slow to arrive — it
                          starves from having no map, not from bad taste.
     BOTH               : use the external gradient for direction, gate it on
                          the internal signal, and let go when the felt signal
                          stops rising. That rule IS wayfinding.

   TWO FIELDS, AND — THE KEY DESIGN DECISION — THEY HAVE DIFFERENT PEAKS:

     V, the VISIBLE field. Rendered, bright. Citations, prestige, job postings.
        This is the borrowed objective function.
     H, the TRUE field. NEVER rendered (until the reveal). Sensed only at the
        agent's own position, as a scalar.

   An earlier version gave both fields the same peak locations and merely
   different amplitudes. That leaks: the nourishing peak is then also a local
   maximum of V, so exteroceptive agents that happen to start on it settle there
   and thrive, the populations never separate, and the demo says nothing.

   V has exactly ONE dominant maximum. The thing that actually nourishes you is
   INVISIBLE in the field everyone is looking at. That is the entire point of the
   act, and it has to be true of the model, not just of the narration.

   10 AUG — THE FLOCK IS THE EXTEROCEPTION: the populations now move as boids
   (Reynolds 1987 — cohesion, alignment, separation), and the flocking terms
   live INSIDE the exteroceptive vector, alongside the visible gradient and
   the crowd-density pull. That placement is the argument drawn kinetically:
   the violet exteroceptive flock schools beautifully straight onto the decoy;
   the red interoception-only population CANNOT flock, because flocking is
   seeing your neighbours; and a hybrid that detaches stops flocking in the
   same moment it stops trusting the visible field (betaEff -> 1 turns both
   off together, no extra rule needed). Agents render as oriented oids.
   Verified: the energy ordering BOTH > INT > EXT and the decoy/true-peak
   occupancy gates reproduce the pre-boids baselines (test/shots/sc2base-*).

   THE AHA: everything they can see says they're winning. Nothing they can feel
   does.

   PRE-EMPT THE OBJECTION UNPROMPTED: "this only works because I decoupled the
   two landscapes — watch," then slide VISIBLE≈TRUE to 1 and let the cyan agents
   win. That converts the demo's weakest point into its strongest.
   ============================================================================= */

(function (global) {
  'use strict';

  var K = global.SimKit;

  // Internal coordinates are X in [0, AR], Y in [0, 1], so one unit of X and one
  // unit of Y are the same number of pixels. Gaussians, speeds and sensing radii
  // are then isotropic on screen with no per-axis fudge.
  var W = 1280, H = 620;
  var AR = W / H;

  var P = {
    N_PER_POP: 40,                   // 120 total. Fewer + bigger reads far better at 720p
    GW: 166, GH: 80,
    DW: 42,  DH: 20,

    // Doubled from 0.0034. The dynamics were already correct at the slower
    // speed but the reversal did not land until ~t=80s, and the beat has to
    // read inside thirty seconds. Run lengths halve to match, keeping run
    // displacement at ~0.15 units — comfortably under the true peak's sigma.
    SPEED: 0.0068,
    LAMBDA_SOC: 0.35,
    NOISE: 0.09,
    // "I have reached the top of the visible field", as a fraction of max V.
    //
    // This started life as a test on |grad V| — "nothing left to climb" — and
    // that cannot work, because a Gaussian is flat at its SUMMIT and equally
    // flat far away on the plain. Tight thresholds fired only for the few agents
    // at the dead centre; loose ones fired at the starting positions, so the
    // hybrids detached before the visible field had done any work for them and
    // became interoception-only with a worse start.
    //
    // ALTITUDE is the discriminator, not slope.
    V_SUMMIT: 0.75,
    EMA_A: 0.012,                    // ~80-step felt baseline

    // Felt state RELAXES toward local true quality; it does not integrate a
    // flux. Integrating meant any location above break-even saturated at 1.0,
    // so an agent parked on the middling peak scored exactly the same as one on
    // the true peak and the bars said nothing. Relaxing makes the bar an honest
    // readout of "how good is where you actually are": decoy ~0.10, middling
    // ~0.46, the real thing ~1.0.
    E_RATE: 0.035,
    // "This place is not feeding me." Set clear of the visible summit's actual
    // value (~0.33) rather than right on top of it — at 0.35 the test sat inside
    // the spread of the crowd and fired for only about a third of them. The true
    // peak relaxes to 1.0, so there is no risk of detaching once you arrive.
    DETACH_E: 0.50,
    SEED: 20260731,

    // Boid terms (10 Aug). Same-population only, and summed into the
    // EXTEROCEPTIVE vector before normalisation — see header. Weights are
    // deliberately modest: the field gradient must keep doing the long-range
    // work or the EXT population stops finding the decoy and the beat dies.
    FLOCK_R: 0.10, C_ALIGN: 0.35, C_COH: 2.0,

    // Short-range repulsion, or 40 agents render as one dot. Do NOT raise this:
    // repulsion is summed into the heading BEFORE normalisation, so in the dense
    // starting strip a larger radius gives every agent enough neighbours to
    // swamp the field gradient completely, and the migration never happens.
    // 0.042 was enough to break it.
    SEP_R: 0.032, SEP_K: 0.9,

    // The detach LATCHES, and that is deliberate. A one-frame detach is useless:
    // the moment the agent steps off the flat summit the visible gradient points
    // back uphill and drags it home. It commits to its own signal and only
    // re-engages on a large, unambiguous improvement — which is the difference
    // between "I should probably leave" and leaving.
    DETACH_STEPS: 100000,
    REATTACH_GAIN: 0.25,

    // THE GEOGRAPHY IS THE ARGUMENT, and getting it wrong makes the demo lie.
    //
    // An earlier version put the true peak far away from everything visible. But
    // then exteroception is PURE COST, and the hybrid is merely "interoception,
    // started late" — it can never beat interoception-only, however it is tuned.
    // The demo would have been quietly asserting something false.
    //
    // The honest claim is that the visible field does real long-range work and
    // only misses the LAST MILE. So the true peak sits just INSIDE the visible
    // peak, offset by 0.30 units:
    //
    //   EXT  : rides V straight to its summit, fast and directed — and starves
    //          there, maddeningly close to the real thing.
    //   INT  : has no map at all. Must random-walk the whole domain, and usually
    //          arrives somewhere mediocre, slowly.
    //   BOTH : lets V do the long-range work, then inner sense walks the last
    //          0.3 units. Fast AND correct.
    V_PEAKS: [
      { cx: 0.62, cy: 0.45, s: 0.40, a: 1.00 }    // the ONLY visible maximum
    ],
    // And the true field must be FLAT far from the visible peak. Leaving a
    // second nourishing spot out west gave interoception-only a long-range
    // signal to follow, so it found the true peak just as often as the hybrid
    // did and the whole point collapsed. A hybrid only EXCEEDS both parents when
    // the task genuinely needs two different scales: long-range direction, which
    // only V supplies, and local precision, which only H supplies.
    H_PEAKS: [
      { cx: 0.50, cy: 0.62, s: 0.14, a: 1.00 },   // "the real thing" — invisible, and close
      { cx: 0.62, cy: 0.45, s: 0.40, a: 0.15 }    // the visible region is thin, not empty
    ],

    // Real run-and-tumble RUNS. Re-tumbling every frame that h ticks down makes
    // the walk Brownian, with essentially zero net displacement — which is why
    // the hybrids used to detach and then never actually go anywhere. E. coli
    // holds a heading for roughly a second and extends the run when things are
    // improving; that persistence is the entire mechanism.
    // Run length must stay well BELOW the feature size or the walk cannot hold
    // a peak: at 110 steps a run carries an agent 0.37 units, roughly 3 sigma
    // clear of the true peak (s=0.13), so it arrives and is immediately flung
    // back out. 45 steps is 0.15 units — enough persistence to drift a long way,
    // short enough to settle.
    RUN_LONG: 22, RUN_SHORT: 6,

    POPS: [
      { key: 'EXT',  beta: 0,    color: '#8A8AFF' },
      { key: 'INT',  beta: 1,    color: '#FF5C68' },
      { key: 'BOTH', beta: null, color: '#FFD24A' }   // null => driven by the slider
    ]
  };

  function buildGrid(peaks) {
    var g = new Float32Array(P.GW * P.GH);
    for (var j = 0; j < P.GH; j++) {
      var y = j / (P.GH - 1);
      for (var i = 0; i < P.GW; i++) {
        var x = (i / (P.GW - 1)) * AR, sum = 0;
        for (var k = 0; k < peaks.length; k++) {
          var dx = x - peaks[k].cx * AR, dy = y - peaks[k].cy;
          sum += peaks[k].a * Math.exp(-(dx * dx + dy * dy) / (2 * peaks[k].s * peaks[k].s));
        }
        g[j * P.GW + i] = sum;
      }
    }
    return g;
  }

  function sampleGrid(g, x, y) { return K.bilinear(g, P.GW, P.GH, x / AR, y); }

  function makeSim2(canvas, controlsMount) {
    var revealed = false;

    return K.createSim({
      canvas: canvas,
      controlsMount: controlsMount,
      width: W, height: H,
      mode: 'perframe',       // one step per rAF => bit-identical under frame drops
      dt: 1 / 60,     // still ONE step per frame; this only makes api.t read in seconds
      seed: (global.__SIM_SEED || P.SEED),

      controls: [
        // PRIMARY, and it is the honesty slider: at 1, H == V and the
        // exteroceptive agents WIN. External sensing isn't bad — it's bad when
        // the fields decouple, which is what happens when the visible field is
        // maintained by other people's incentives.
        // terse labels on purpose: two sliders + two buttons must share ONE
        // row — a wrapped controls row lands on the .src footnote, and the
        // audit cannot see it (sim slides are exempt from the under-footnote
        // guard). Endpoint words lowercase to match SIM 0b's row.
        // Scope is now IN the labels (14 Aug): FIELDS reshapes the WORLD —
        // it rewrites the true field under all three flocks — while INNER
        // SENSE steers the GOLD flock only (violet and red have beta pinned
        // at 0 and 1). The world slider is grey on purpose: it must not wear
        // any flock's colour.
        { type: 'slider', key: 'rho', label: 'WORLD FIELDS', lo: 'apart', hi: 'aligned',
          min: 0, max: 1, step: 0.01, value: 0.0, narrow: true, world: true,
          onChange: function (v, api) { api.state.rebuildH = true; } },
        { type: 'slider', key: 'beta', label: 'GOLD INNER SENSE', lo: 'none', hi: 'only',
          min: 0, max: 1, step: 0.01, value: 0.45, narrow: true, gold: true },
        { type: 'button', label: 'TRUE FIELD', onClick: function () { revealed = !revealed; },
          lit: function () { return revealed; } },
        { type: 'button', label: 'RESET ⟲', onClick: function (api, ctrl) {
            revealed = false; ctrl.hardReset();
          } }
      ],

      setup: function (api) {
        var st = api.state, rng = api.rng;

        st.V  = buildGrid(P.V_PEAKS);
        st.H0 = buildGrid(P.H_PEAKS);
        st.H  = new Float32Array(st.V.length);
        st.rebuildH = true;

        var mx = 0;
        for (var j = 1; j < P.GH - 1; j++) {
          for (var i = 1; i < P.GW - 1; i++) {
            var gx = st.V[j * P.GW + i + 1] - st.V[j * P.GW + i - 1];
            var gy = st.V[(j + 1) * P.GW + i] - st.V[(j - 1) * P.GW + i];
            var m = Math.sqrt(gx * gx + gy * gy);
            if (m > mx) mx = m;
          }
        }
        // central difference spans 2 cells, each AR/(GW-1) wide
        st.gradMax = mx / (2 * AR / (P.GW - 1));
        st.vMax = 0;
        for (var w = 0; w < st.V.length; w++) if (st.V[w] > st.vMax) st.vMax = st.V[w];

        st.D = new Float32Array(P.DW * P.DH);
        st.Db = new Float32Array(P.DW * P.DH);

        st.agents = [];
        for (var p = 0; p < P.POPS.length; p++) {
          for (var n = 0; n < P.N_PER_POP; n++) {
            var th = rng() * 6.283185307179586;
            // Everyone starts FAR WEST, a long way from the only visible peak.
            // Crossing that distance is the long-range half of the task — the
            // half interoception has no way of solving.
            st.agents.push({
              pop: p, x: 0.04 + rng() * 0.36, y: 0.06 + rng() * 0.88,
              dx: Math.cos(th), dy: Math.sin(th),
              e: 0.55, hPrev: 0, hEma: 0, detach: 0, px: 0, py: 0,
              rdx: Math.cos(th), rdy: Math.sin(th), runLeft: 1, hRunStart: 0,
              arrive: 0,   // step of FIRST entry into the true peak's radius
              tx: [], ty: []
            });
          }
        }

        st.bars = [0, 0, 0];
        st.fieldLayer = null;
        st.truthLayer = null;

        // Verified numerically by the test harness, not by squinting.
        // The demo only works if BOTH > INT > EXT.
        st.probe = function () {
          var atDecoy = [0, 0, 0], atTrue = [0, 0, 0], detached = 0;
          for (var i = 0; i < st.agents.length; i++) {
            var a = st.agents[i];
            if (a.detach > 0) detached++;
            var dxd = a.x - P.V_PEAKS[0].cx * AR, dyd = a.y - P.V_PEAKS[0].cy;
            if (Math.hypot(dxd, dyd) < 0.16) atDecoy[a.pop]++;
            var dxt = a.x - P.H_PEAKS[0].cx * AR, dyt = a.y - P.H_PEAKS[0].cy;
            if (Math.hypot(dxt, dyt) < 0.18) atTrue[a.pop]++;
          }
          var mx = [0, 0, 0], mc = [0, 0, 0];
          for (var q = 0; q < st.agents.length; q++) {
            mx[st.agents[q].pop] += st.agents[q].x; mc[st.agents[q].pop]++;
          }
          var arr = [[], [], []];
          for (var v = 0; v < st.agents.length; v++) {
            var av = st.agents[v];
            if (av.arrive) arr[av.pop].push(av.arrive / 60);
          }
          function med(a) {
            if (!a.length) return null;
            a.sort(function (x, y) { return x - y; });
            return +a[a.length >> 1].toFixed(1);
          }
          return {
            energy: { EXT: +st.bars[0].toFixed(3), INT: +st.bars[1].toFixed(3), BOTH: +st.bars[2].toFixed(3) },
            onDecoy: { EXT: atDecoy[0], INT: atDecoy[1], BOTH: atDecoy[2] },
            onTruePeak: { EXT: atTrue[0], INT: atTrue[1], BOTH: atTrue[2] },
            arrived: { EXT: arr[0].length, INT: arr[1].length, BOTH: arr[2].length },
            medArriveS: { EXT: med(arr[0]), INT: med(arr[1]), BOTH: med(arr[2]) },
            // decoy sits at x=1.44, the true peak at x=0.33 — so meanX falling
            // is the migration actually happening
            meanX: { EXT: +(mx[0] / mc[0]).toFixed(2), INT: +(mx[1] / mc[1]).toFixed(2), BOTH: +(mx[2] / mc[2]).toFixed(2) },
            detached: detached
          };
        };
      },

      step: function (dt, api) {
        var st = api.state;

        if (st.rebuildH) {
          var rho = api.params.rho;
          for (var b0 = 0; b0 < st.H.length; b0++) {
            st.H[b0] = rho * st.V[b0] + (1 - rho) * st.H0[b0];
          }
          st.rebuildH = false;
          st.truthLayer = null;
        }

        // -- density grid: O(N) splat + one 3x3 blur ------------------------
        var D = st.D, Db = st.Db;
        D.fill(0);
        for (var a = 0; a < st.agents.length; a++) {
          var g0 = st.agents[a];
          var ci = K.clamp((g0.x / AR) * (P.DW - 1), 0, P.DW - 1) | 0;
          var cj = K.clamp(g0.y * (P.DH - 1), 0, P.DH - 1) | 0;
          D[cj * P.DW + ci] += 1;
        }
        for (var j2 = 0; j2 < P.DH; j2++) {
          for (var i2 = 0; i2 < P.DW; i2++) {
            var s = 0, c = 0;
            for (var oy = -1; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++) {
              var xx = i2 + ox, yy = j2 + oy;
              if (xx < 0 || yy < 0 || xx >= P.DW || yy >= P.DH) continue;
              s += D[yy * P.DW + xx]; c++;
            }
            Db[j2 * P.DW + i2] = s / c;
          }
        }

        // -- pairs: short-range repulsion + same-pop flock accumulation ------
        // (120 agents = 7140 pairs; ~free)
        for (var z = 0; z < st.agents.length; z++) {
          var Z = st.agents[z];
          Z.px = 0; Z.py = 0; Z.fx = 0; Z.fy = 0; Z.fvx = 0; Z.fvy = 0; Z.fn = 0;
        }
        for (var q1 = 0; q1 < st.agents.length; q1++) {
          var A1 = st.agents[q1];
          for (var q2 = q1 + 1; q2 < st.agents.length; q2++) {
            var A2 = st.agents[q2];
            var rx = A1.x - A2.x, ry = A1.y - A2.y;
            var rd = Math.hypot(rx, ry);
            if (rd < P.FLOCK_R && A1.pop === A2.pop) {
              A1.fx += A2.x; A1.fy += A2.y; A1.fvx += A2.dx; A1.fvy += A2.dy; A1.fn++;
              A2.fx += A1.x; A2.fy += A1.y; A2.fvx += A1.dx; A2.fvy += A1.dy; A2.fn++;
            }
            if (rd >= P.SEP_R) continue;
            var ux, uy;
            if (rd < 1e-6) { var uu = K.hashUnitVec(q1 * 31 + q2, api.steps, api.seed); ux = uu.x; uy = uu.y; }
            else { ux = rx / rd; uy = ry / rd; }
            var f = P.SEP_K * (P.SEP_R - rd) / P.SEP_R;
            A1.px += f * ux; A1.py += f * uy;
            A2.px -= f * ux; A2.py -= f * uy;
          }
        }

        var eps = 0.008;
        var sums = [0, 0, 0], counts = [0, 0, 0];

        for (var m2 = 0; m2 < st.agents.length; m2++) {
          var ag = st.agents[m2];
          var beta = P.POPS[ag.pop].beta;
          if (beta === null) beta = api.params.beta;

          // interoception: a SCALAR. There is no direction in it.
          var h = sampleGrid(st.H, ag.x, ag.y);

          // exteroception: a VECTOR — visible gradient plus the pull of the crowd
          var vgx = (sampleGrid(st.V, ag.x + eps, ag.y) - sampleGrid(st.V, ag.x - eps, ag.y)) / (2 * eps);
          var vgy = (sampleGrid(st.V, ag.x, ag.y + eps) - sampleGrid(st.V, ag.x, ag.y - eps)) / (2 * eps);
          var dgx = K.bilinear(Db, P.DW, P.DH, (ag.x + 0.03) / AR, ag.y) -
                    K.bilinear(Db, P.DW, P.DH, (ag.x - 0.03) / AR, ag.y);
          var dgy = K.bilinear(Db, P.DW, P.DH, ag.x / AR, ag.y + 0.03) -
                    K.bilinear(Db, P.DW, P.DH, ag.x / AR, ag.y - 0.03);
          var ex = vgx + P.LAMBDA_SOC * dgx, ey = vgy + P.LAMBDA_SOC * dgy;
          // Boids, as exteroception: cohesion toward the local same-pop
          // centroid, alignment with the local same-pop heading. Inside this
          // vector on purpose — a population that cannot see cannot flock.
          if (ag.fn > 0) {
            ex += P.C_COH * (ag.fx / ag.fn - ag.x) + P.C_ALIGN * (ag.fvx / ag.fn);
            ey += P.C_COH * (ag.fy / ag.fn - ag.y) + P.C_ALIGN * (ag.fvy / ag.fn);
          }
          var el = Math.hypot(ex, ey) || 1;
          ex /= el; ey /= el;

          // interoceptive drive: run-and-tumble, compared ACROSS A RUN.
          // Hold a heading; at the end of a run, ask whether things got better
          // over the whole run. Better -> keep the heading and run long again.
          // Worse -> tumble to a new heading and only commit to a short run.
          // That asymmetry between long good runs and short bad ones IS the
          // biased random walk, and it is the only thing that produces net drift.
          ag.runLeft--;
          if (ag.runLeft <= 0) {
            var improved = h > ag.hRunStart;
            if (!improved) {
              var ut = K.hashUnitVec(m2, api.steps, api.seed);
              ag.rdx = ut.x; ag.rdy = ut.y;
            }
            ag.runLeft = improved ? P.RUN_LONG : P.RUN_SHORT;
            ag.hRunStart = h;
          }
          var ix = ag.rdx, iy = ag.rdy;

          // -- THE WAYFINDING RULE (hybrids only) ----------------------------
          var betaEff = beta;
          if (beta > 0 && beta < 1) {
            if (ag.detach > 0) {
              // NO RE-ATTACH. An earlier version re-engaged the visible gradient
              // once the agent was thriving again — and since that gradient still
              // points at the decoy, thriving agents were dragged straight back
              // off the true peak and cycled forever. Once you have learned that
              // the visible field is lying to you, you do not go back to trusting
              // it. Cleaner model, and the honest version of the message.
              ag.detach--;
              betaEff = 1;
            } else if (sampleGrid(st.V, ag.x, ag.y) > P.V_SUMMIT * st.vMax &&
                       ag.e < P.DETACH_E) {
              // "There is nothing left to climb on the field I can see, and I am
              //  still running on empty." NOT "my felt state is falling" — on
              //  the decoy the felt signal never falls, it is simply, permanently
              //  low, and a falling-edge test therefore never fires at all.
              ag.detach = P.DETACH_STEPS;
              betaEff = 1;
            }
          }

          var mx2 = (1 - betaEff) * ex + betaEff * ix;
          var my2 = (1 - betaEff) * ey + betaEff * iy;
          var u3 = K.hashUnitVec(m2 + 104729, api.steps, api.seed);
          mx2 += P.NOISE * u3.x; my2 += P.NOISE * u3.y;
          mx2 += ag.px; my2 += ag.py;
          var ml = Math.hypot(mx2, my2) || 1;
          ag.dx = mx2 / ml; ag.dy = my2 / ml;

          ag.x += P.SPEED * ag.dx;
          ag.y += P.SPEED * ag.dy;
          if (ag.x < 0)  { ag.x = -ag.x;         ag.dx = -ag.dx; }
          if (ag.x > AR) { ag.x = 2 * AR - ag.x; ag.dx = -ag.dx; }
          if (ag.y < 0)  { ag.y = -ag.y;         ag.dy = -ag.dy; }
          if (ag.y > 1)  { ag.y = 2 - ag.y;      ag.dy = -ag.dy; }

          // SETTLING at the true peak — not first touch. With 22-step run
          // persistence every walker sweeps the domain near-ballistically, so
          // "first within radius" is a flyby anyone scores in seconds (measured:
          // 40/40 INT "arrivals" by t≈6s). The claim is FINDING the peak, which
          // means staying: 90 consecutive steps (1.5 s) inside r=0.18 — a
          // straight pass-through at cruise speed lasts ~0.9 s and is excluded.
          // (The instantaneous INT-vs-BOTH energy bars are a ~60/40 coin flip
          // across seeds; settle time separates cleanly — see test/sc2-gates.js.)
          var axp = ag.x - P.H_PEAKS[0].cx * AR, ayp = ag.y - P.H_PEAKS[0].cy;
          if (Math.hypot(axp, ayp) < 0.18) ag.inPk = (ag.inPk || 0) + 1;
          else ag.inPk = 0;
          if (!ag.arrive && ag.inPk >= 90) ag.arrive = api.steps - 90;

          // Brightness IS internal state. Nothing else needs explaining.
          ag.e += P.E_RATE * (K.clamp(h, 0, 1) - ag.e);
          ag.hEma += P.EMA_A * (h - ag.hEma);
          ag.hPrev = h;

          if (api.steps % 9 === 0) {
            ag.tx.push(ag.x); ag.ty.push(ag.y);
            if (ag.tx.length > 5) { ag.tx.shift(); ag.ty.shift(); }
          }

          sums[ag.pop] += ag.e; counts[ag.pop]++;
        }

        for (var bb = 0; bb < 3; bb++) st.bars[bb] = counts[bb] ? sums[bb] / counts[bb] : 0;
      },

      render: function (g, api) {
        var st = api.state, PAL = api.P;

        if (!st.fieldLayer) {
          st.fieldLayer = K.offscreen(P.GW, P.GH);
          var fg = st.fieldLayer.getContext('2d');
          var img = fg.createImageData(P.GW, P.GH);
          var mx = 0;
          for (var q = 0; q < st.V.length; q++) if (st.V[q] > mx) mx = st.V[q];
          for (var i = 0; i < st.V.length; i++) {
            var t = Math.pow(K.clamp(st.V[i] / mx, 0, 1), 0.85);
            // EMISSION violet ramp (10 Aug) — the old blue-cyan ramp was the
            // rejected dashboard hue family
            img.data[i * 4 + 0] = 9  + 78  * t;
            img.data[i * 4 + 1] = 9  + 74  * t;
            img.data[i * 4 + 2] = 15 + 165 * t;
            img.data[i * 4 + 3] = 255;
          }
          fg.putImageData(img, 0, 0);
        }
        g.imageSmoothingEnabled = true;
        g.drawImage(st.fieldLayer, 0, 0, api.W, api.H);

        // -- the reveal: the TRUE field, as warm quantised bands -------------
        if (revealed) {
          if (!st.truthLayer) {
            st.truthLayer = K.offscreen(P.GW, P.GH);
            var tg = st.truthLayer.getContext('2d');
            var timg = tg.createImageData(P.GW, P.GH);
            var hm = 0;
            for (var r = 0; r < st.H.length; r++) if (st.H[r] > hm) hm = st.H[r];
            for (var s2 = 0; s2 < st.H.length; s2++) {
              var band = Math.floor(K.clamp(st.H[s2] / hm, 0, 1) * 7) / 7;
              timg.data[s2 * 4 + 0] = 255 * band;
              timg.data[s2 * 4 + 1] = 150 * band;
              timg.data[s2 * 4 + 2] = 30  * band;
              timg.data[s2 * 4 + 3] = 255 * (0.25 + 0.60 * band);
            }
            tg.putImageData(timg, 0, 0);
          }
          g.globalAlpha = 0.75;
          g.drawImage(st.truthLayer, 0, 0, api.W, api.H);
          g.globalAlpha = 1;
        }

        // -- trails: explicit short polylines from a ring buffer -------------
        // NOT a persistent layer faded by a full-canvas destination-out
        // fillRect — that costs ~800k px of alpha blending per frame and is
        // banned by rule 4 in the engine header.
        g.lineWidth = 2.5;
        g.lineCap = 'round';
        for (var n = 0; n < st.agents.length; n++) {
          var a2 = st.agents[n];
          if (a2.tx.length < 2) continue;
          g.strokeStyle = P.POPS[a2.pop].color;
          g.globalAlpha = 0.16 * a2.e;
          g.beginPath();
          for (var tp = 0; tp < a2.tx.length; tp++) {
            var TX = a2.tx[tp] * api.H, TY = a2.ty[tp] * api.H;
            if (tp === 0) g.moveTo(TX, TY); else g.lineTo(TX, TY);
          }
          g.lineTo(a2.x * api.H, a2.y * api.H);
          g.stroke();
        }
        g.globalAlpha = 1;

        // -- agents: flat round particles, hue = population; energy still
        // shows (disc radius AND alpha track e) — a starving crowd must LOOK
        // starving, it just no longer glows about it (10 Aug)
        var SC = global.SwarmChem;
        for (var k = 0; k < st.agents.length; k++) {
          var ag2 = st.agents[k];
          // floors raised 10 Aug: without the old glow pass, 0.25-alpha 5px
          // discs vanished on stream while the energy bars stayed full-strength
          // — the decoration outshone the subject. Energy still reads: size and
          // alpha both halve from fed to starving.
          g.globalAlpha = 0.5 + 0.5 * ag2.e;
          SC.drawOid(g, ag2.x * api.H, ag2.y * api.H,
                     Math.atan2(ag2.dy, ag2.dx), 7.5 + 5.5 * ag2.e,
                     P.POPS[ag2.pop].color, null);
        }
        g.globalAlpha = 1;

        // -- energy bars (no canvas text; labels live in HTML) ---------------
        var bx = 40, bw = api.W - 80, bh = 22, by = api.H - 96;
        for (var p = 0; p < 3; p++) {
          var y = by + p * (bh + 10);
          g.fillStyle = '#121218';
          g.fillRect(bx, y, bw, bh);
          g.fillStyle = P.POPS[p].color;
          g.fillRect(bx, y, bw * K.clamp(st.bars[p], 0, 1), bh);
        }
      }
    });
  }

  global.makeSim2 = makeSim2;

})(typeof window !== 'undefined' ? window : this);
