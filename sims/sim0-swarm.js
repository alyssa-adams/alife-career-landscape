/* =============================================================================
   SIM 0a/0b — SWARM CHEMISTRY                    The frame the talk opens on
   -----------------------------------------------------------------------------
   A faithful JavaScript port of Hiroki Sayama's Swarm Chemistry kinetics.

   PROVENANCE & LICENSE
   Kinetic rules ported line-for-line from SwarmPopulationSimulator.java
   (simulateSwarmBehavior, lines ~395–455) and SwarmIndividual.java
   (accelerate/move) of Sayama's "Evolutionary Swarm Chemistry Simulator"
   (2006–2015 (c) Hiroki Sayama, GPLv3) — the kinetics are identical in his
   v1.2.0/1.3.0 simulators; the GPLv3 build is the cleanest lineage to derive
   from. Recipes are verbatim from the Swarm Chemistry homepage.
     https://bingweb.binghamton.edu/~sayama/SwarmChemistry/
     Sayama (2009) "Swarm Chemistry," Artificial Life 15(1):105–114,
     doi:10.1162/artl.2009.15.1.15107
   This file is accordingly GPLv3. It is a talk demo; credit stays with Sayama.

   PORTING TRAPS (verified against the Java, do not "fix" any of these):
   · Parameter order in a recipe line is  count * (R, Vn, Vm, c1, c2, c3, c4, c5).
   · The separation force is c3 · Δ/|Δ|²  — magnitude c3/|Δ|, NOT c3/|Δ|².
     The Java variable `d` in that loop holds the SQUARED distance, no sqrt.
   · Epsilon guards are exact `== 0` tests substituting 0.001 (a squared
     distance in the c3 loop, a speed in the c5 block).
   · c4 ("whim") is a probability gate, not a coefficient: fires only when
     rnd() < c4, adds uniform [-5,5) per axis, and sits INSIDE the has-
     neighbours branch — a lone agent never gets the whim, only a weak
     uniform [-0.5,0.5) jitter per axis.
   · Speed is clamped to Vm twice per tick — once per accelerate() call —
     so the pace-keeping correction can itself be clipped.
   · dt = 1: acceleration adds straight into velocity, position adds velocity.
   · Synchronous update, velocity double-buffered: forces read committed
     dx/dy, write pending dx2/dy2; move() commits after all agents step.
     Positions are stable within a tick.
   · Init (Recipe.java): positions uniform [0,300)², velocities [-5,5)/axis.

   The display camera is also Sayama's: an outlier-resistant bounding box
   (drop up to the 10 outermost per axis when their gap exceeds 10x the mean
   interval), padded 10%, midpoint lerped at 0.1 and scale at 0.5 per frame.

   The physics core has no DOM dependency — it also loads under node for the
   16-seed verification gates in test/sc-gates.js.
   ============================================================================= */

(function (global) {
  'use strict';

  /* ---------------------------------------------------------------- recipes */
  // Verbatim from Sayama's homepage — MECHANICALLY INJECTED from the fetched
  // recipes-named.txt by tools/inject-recipes.js. Never hand-edit the strings.
  var RECIPES = {
    "Pulsating Eye":
      "102 * (293.86, 17.06, 38.3, 0.81, 0.05, 0.83, 0.2, 0.9)\n124 * (226.18, 19.27,   24.57, 0.95, 0.84, 13.09, 0.07, 0.8)\n74 * (49.98, 8.44, 4.39, 0.92, 0.14,   96.92, 0.13, 0.51)",
    "Swinger":
      "48 * (150.39, 15.89, 23.54, 0.74, 0.45, 62.65, 0.33, 0.13)\n152 * (217.14, 12.13, 12.42, 0.59, 0.98, 14.06, 0.04, 0.65)\n14 * (248.54, 5.85, 22.26, 0.43, 0.11, 17.14, 0.06, 0.68)\n31 * (141.53, 2.91, 4.86, 0.92, 0.03, 21.87, 0.28, 0.2)",
    "Cell with Two Nuclei":
      "41 * (249.84, 4.85, 28.73, 0.34, 0.45, 14.44, 0.09, 0.82)\n26 * (277.87, 15.02, 35.48, 0.68, 0.05, 82.96, 0.46, 0.9)\n30 * (277.87, 15.02, 24.44, 0.68, 0.05, 82.96, 0.43, 0.9)\n28 * (110.8, 16.12, 38.6, 0.18, 0.34, 14.3, 0.01, 0.01)\n48 * (83.79, 13.29, 7.54, 0.08, 0.79, 1.07, 0.15, 0.45)\n74 * (269.64, 6.62, 34.69, 0.36, 0.5, 30.2, 0.03, 0.23)",
    "Rotary":
      "29 * (122.13, 19.19, 17.98, 0.65, 0.44, 19.88, 0.46, 0.2)\n51 * (299.13, 0.79, 38.71, 0.25, 0.18, 86.49, 0.38, 0.43)\n10 * (252.92, 19.99, 10.21, 0.23, 0.17, 1.22, 0.28, 0.92)",
    "Blobs":
      "300 * (20.8, 1.95, 20.75, 0.95, 0.99, 9.31, 0.05, 0.68)",
    "Linear Oscillator":
      "133 * (214.41, 17.93, 35.14, 0.64, 0.13, 0.29, 0.08, 0.97)\n24 * (253.6, 7.19, 15.51, 0.82, 0.33, 32.65, 0.34, 0.56)"
  };

  /* ----------------------------------------------------------------- parser */
  // Sayama-compatible: strip every character that is not a digit or period,
  // tokenize, consume 9 numbers per ingredient.
  function parseRecipe(txt) {
    var toks = txt.replace(/[^0-9.]+/g, ' ').trim().split(/\s+/).map(Number);
    var types = [];
    for (var i = 0; i + 8 < toks.length; i += 9) {
      types.push({
        n: toks[i] | 0,
        R: toks[i + 1], Vn: toks[i + 2], Vm: toks[i + 3],
        c1: toks[i + 4], c2: toks[i + 5], c3: toks[i + 6],
        c4: toks[i + 7], c5: toks[i + 8]
      });
    }
    return types;
  }

  /* ------------------------------------------------------------------ world */
  function makeWorld(types, rng, scatter) {
    var S = scatter || 300;
    var ags = [];
    for (var t = 0; t < types.length; t++) {
      for (var i = 0; i < types[t].n; i++) {
        ags.push({
          x: rng() * S, y: rng() * S,
          dx: rng() * 10 - 5, dy: rng() * 10 - 5,
          dx2: 0, dy2: 0, t: t, ang: 0
        });
      }
    }
    for (var k = 0; k < ags.length; k++) { ags[k].dx2 = ags[k].dx; ags[k].dy2 = ags[k].dy; }
    return { types: types, ags: ags };
  }

  function accelerate(a, ax, ay, vm) {
    a.dx2 += ax; a.dy2 += ay;
    var d2 = a.dx2 * a.dx2 + a.dy2 * a.dy2;
    if (d2 > vm * vm) {
      var f = vm / Math.sqrt(d2);
      a.dx2 *= f; a.dy2 *= f;
    }
  }

  // One synchronous tick over every agent. Faithful to the Java (see header).
  function stepWorld(w, rng) {
    var ags = w.ags, types = w.types, N = ags.length;
    var i, j, a, b, p, ax, ay, n, cx, cy, cdx, cdy, ddx, ddy, d2;
    for (i = 0; i < N; i++) {
      a = ags[i]; p = types[a.t];
      var R2 = p.R * p.R;
      n = 0; cx = 0; cy = 0; cdx = 0; cdy = 0; ax = 0; ay = 0;
      for (j = 0; j < N; j++) {
        if (j === i) continue;
        b = ags[j];
        ddx = a.x - b.x; ddy = a.y - b.y;
        d2 = ddx * ddx + ddy * ddy;
        if (d2 < R2) {
          n++;
          cx += b.x; cy += b.y; cdx += b.dx; cdy += b.dy;
          if (d2 === 0) d2 = 0.001;
          ax += ddx / d2 * p.c3;          // separation: c3 · Δ/|Δ|², see header
          ay += ddy / d2 * p.c3;
        }
      }
      if (n === 0) {
        ax = rng() - 0.5;
        ay = rng() - 0.5;
      } else {
        cx /= n; cy /= n; cdx /= n; cdy /= n;
        ax += (cx - a.x) * p.c1 + (cdx - a.dx) * p.c2;
        ay += (cy - a.y) * p.c1 + (cdy - a.dy) * p.c2;
        if (rng() < p.c4) {
          ax += rng() * 10 - 5;
          ay += rng() * 10 - 5;
        }
      }
      accelerate(a, ax, ay, p.Vm);
      var sp = Math.sqrt(a.dx2 * a.dx2 + a.dy2 * a.dy2);
      if (sp === 0) sp = 0.001;
      accelerate(a, a.dx2 * (p.Vn - sp) / sp * p.c5,
                    a.dy2 * (p.Vn - sp) / sp * p.c5, p.Vm);
    }
    for (i = 0; i < N; i++) {
      a = ags[i];
      a.dx = a.dx2; a.dy = a.dy2;
      a.x += a.dx; a.y += a.dy;
      if (a.dx * a.dx + a.dy * a.dy > 0.0025) a.ang = Math.atan2(a.dy, a.dx);
    }
  }

  /* ----------------------------------------------------------------- camera */
  // Sayama's tracking display, ported: robust bbox that ignores stragglers.
  function robustSpan(vals) {
    var v = vals.slice().sort(function (a, b) { return a - b; });
    var m = v.length, lo = v[0], hi = v[m - 1];
    if (m > 20) {
      var avg = (v[m - 1] - v[0]) / (m - 1), i;
      for (i = 0; i < m - 10; i++) if (v[i + 10] - v[i] < avg * 10) { lo = v[i]; break; }
      for (i = m - 1; i >= 10; i--) if (v[i] - v[i - 10] < avg * 10) { hi = v[i]; break; }
    }
    var pad = (hi - lo) * 0.1;
    return [lo - pad, hi + pad];
  }

  function trackCamera(cam, ags, W, H, mustInclude) {
    var xs = [], ys = [], i;
    for (i = 0; i < ags.length; i++) { xs.push(ags[i].x); ys.push(ags[i].y); }
    var sx = robustSpan(xs), sy = robustSpan(ys);
    if (mustInclude) for (i = 0; i < mustInclude.length; i++) {
      var m = mustInclude[i];
      if (m.x < sx[0]) sx[0] = m.x - 30; if (m.x > sx[1]) sx[1] = m.x + 30;
      if (m.y < sy[0]) sy[0] = m.y - 30; if (m.y > sy[1]) sy[1] = m.y + 30;
    }
    var mx = (sx[0] + sx[1]) / 2, my = (sy[0] + sy[1]) / 2;
    var s = Math.min(W / Math.max(sx[1] - sx[0], 1), H / Math.max(sy[1] - sy[0], 1)) * 0.92;
    s = Math.max(0.3, Math.min(2.4, s));
    if (!cam.ok) { cam.mx = mx; cam.my = my; cam.s = s; cam.ok = true; }
    else {
      cam.mx += (mx - cam.mx) * 0.1;   // Sayama's lerp rates
      cam.my += (my - cam.my) * 0.1;
      cam.s += (s - cam.s) * 0.5;
    }
  }

  /* -------------------------------------------------------------- rendering */
  // The oid: a flat round particle, one solid colour per agent (10 AUG revision;
  // was an oriented triangle with a luminance core — Alyssa asked for round
  // particles, no glow, "just make each particle a color"). The signature keeps
  // the triangle era's shape so no call site churned: `ang` and `core` are
  // accepted and ignored, and `s` — the old nose length — maps to a disc radius
  // of similar visual weight.
  function drawOid(g, x, y, ang, s, fill, core) {
    g.fillStyle = fill;
    g.beginPath();
    g.arc(x, y, Math.max(1.5, 0.68 * s), 0, 6.2832);
    g.fill();
    // 1px dark rim: invisible on the graphite ground, but it articulates
    // individual agents inside dense same-colour clusters and keeps discs
    // legible on bright terrain (both red-team findings, 10 Aug)
    g.strokeStyle = 'rgba(0,0,0,0.38)';
    g.lineWidth = 1;
    g.stroke();
  }

  function drawGrid(g, cam, W, H, ruleColor) {
    var step = 300 * cam.s;
    if (step < 40) return;
    g.strokeStyle = ruleColor;
    g.lineWidth = 1;
    g.globalAlpha = 0.5;
    var x0 = W / 2 - cam.mx * cam.s, y0 = H / 2 - cam.my * cam.s;
    for (var x = x0 % step; x < W; x += step) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
    }
    for (var y = y0 % step; y < H; y += step) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    }
    g.globalAlpha = 1;
  }

  var CORE_API = {
    RECIPES: RECIPES, parseRecipe: parseRecipe, makeWorld: makeWorld,
    stepWorld: stepWorld, trackCamera: trackCamera, robustSpan: robustSpan,
    drawOid: drawOid, drawGrid: drawGrid
  };
  global.SwarmChem = CORE_API;
  if (typeof module !== 'undefined' && module.exports) module.exports = CORE_API;
  if (typeof window === 'undefined') return;   // node: physics core only

  var K = global.SimKit;

  /* ============================== SIM 0a =================================== */
  // Slide 2 — the spectacle. Published recipes, cycled with one button.
  var ORDER = ['Pulsating Eye', 'Swinger', 'Cell with Two Nuclei', 'Rotary'];
  var recipeIdx = 0;   // survives resets so RECIPE ▸ cycles, RESET replays

  function makeSim0a(canvas, mount) {
    var W = 1148, H = 574;
    var ctrl = K.createSim({
      canvas: canvas, controlsMount: mount,
      width: W, height: H, mode: 'perframe', seed: 20260816,
      controls: [
        { type: 'button', label: 'RECIPE ▸', onClick: function (api, c) {
            recipeIdx = (recipeIdx + 1) % ORDER.length;
            api.restart = true;
          } },
        { type: 'button', label: 'RESET ⟲', onClick: function (api, c) {
            api.restart = true;
          } }
      ],
      setup: function (api) {
        var name = ORDER[recipeIdx];
        var st = api.state;
        st.name = name;
        st.world = makeWorld(parseRecipe(RECIPES[name]), api.rng);
        st.cam = { ok: false };
        // Palette for ingredient identity, in recipe order.
        st.hues = [api.P.cyan, api.P.amber, api.P.magenta, api.P.green, api.P.ink, '#6E7080'];
        st.readout = function () {
          return [
            { x: 0, w: 560, title: 'PUBLISHED RECIPE', value: st.name.toUpperCase(), color: api.P.ink },
            { x: 560, w: 300, title: 'SPECIES', value: String(st.world.types.length), color: api.P.ink },
            { x: 860, w: 288, title: 'AGENTS', value: String(st.world.ags.length), color: api.P.ink }
          ];
        };
        st.probe = function () {
          var ags = st.world.ags, n = ags.length, ms = 0, mx = 0, my = 0, i;
          for (i = 0; i < n; i++) { ms += Math.hypot(ags[i].dx, ags[i].dy); mx += ags[i].x; my += ags[i].y; }
          ms /= n; mx /= n; my /= n;
          var rms = 0;
          for (i = 0; i < n; i++) { var dx = ags[i].x - mx, dy = ags[i].y - my; rms += dx * dx + dy * dy; }
          rms = Math.sqrt(rms / n);
          return { recipe: st.name, n: n, meanSpeed: +ms.toFixed(2), spread: +rms.toFixed(0) };
        };
      },
      step: function (dt, api) {
        stepWorld(api.state.world, api.rng);
      },
      render: function (g, api) {
        var st = api.state, P = api.P;
        g.fillStyle = P.bg; g.fillRect(0, 0, W, H);
        trackCamera(st.cam, st.world.ags, W, H);
        drawGrid(g, st.cam, W, H, P.rule);
        var cam = st.cam, ags = st.world.ags, i, a;
        var sz = Math.max(3.4, Math.min(11, 6.2 * cam.s));
        for (i = 0; i < ags.length; i++) {
          a = ags[i];
          var ox = (a.x - cam.mx) * cam.s + W / 2, oy = (a.y - cam.my) * cam.s + H / 2;
          if (ox < -20 || ox > W + 20 || oy < -20 || oy > H + 20) continue;
          drawOid(g, ox, oy, a.ang, sz, st.hues[a.t % st.hues.length], P.core);
        }
      }
    });
    return ctrl;
  }

  /* ============================== SIM 0b =================================== */
  // Slide 3 — one agent, two kinds of sensors. Ambient = "Blobs" (published,
  // single ingredient, robustly cohesive). The hero carries the same recipe
  // except its inner clock asks for Vn = 12 — six times the blob's pace. The
  // OUTWARD slider is its perception radius R; the INWARD slider is c5, the
  // gain on its own pace sense. Both are honest Swarm Chemistry parameters.
  function makeSim0b(canvas, mount) {
    var W = 1148, H = 574;
    var HERO_VN = 12;
    var ctrl = K.createSim({
      canvas: canvas, controlsMount: mount,
      width: W, height: H, mode: 'perframe', seed: 20260817,
      controls: [
        { type: 'slider', key: 'R', label: 'OUTWARD REACH', min: 5, max: 300, value: 20.8, step: 0.1, detent: 20.8, lo: 'blind', hi: 'everyone' },
        { type: 'slider', key: 'g', label: 'INWARD GAIN', min: 0, max: 1, value: 0.68, step: 0.01, detent: 0.68, lo: 'numb', hi: 'insistent', gold: true },
        { type: 'button', label: 'RESET ⟲', onClick: function (api) { api.restart = true; } }
      ],
      setup: function (api) {
        var st = api.state;
        var blob = parseRecipe(RECIPES['Blobs'])[0];
        // 299 ambient agents + 1 hero on its own type slot.
        var ambient = Object.assign({}, blob, { n: blob.n - 1 });
        var heroT = Object.assign({}, blob, { n: 1, Vn: HERO_VN });
        st.world = makeWorld([ambient, heroT], api.rng);
        st.hero = st.world.ags[st.world.ags.length - 1];
        // Spawn the hero at the ambient centroid: with the default R (20.8,
        // smaller than the scatter) a rim spawn loses the blob during the
        // initial cohesion transient and exits at Vn forever — measured
        // dc 3857 → 15111 in the first harness run. From the centroid all
        // four slider corners give legible fates (see test/sc0b-sweep.js).
        var mx = 0, my = 0, na = st.world.ags.length - 1;
        for (var q = 0; q < na; q++) { mx += st.world.ags[q].x; my += st.world.ags[q].y; }
        st.hero.x = mx / na; st.hero.y = my / na;
        st.cam = { ok: false };
        st.trail = [];
        st.readout = function () {
          var h = st.hero;
          return [
            { x: 0, w: 330, title: 'OUTWARD · R', value: api.params.R.toFixed(1), color: api.P.cyan },
            { x: 330, w: 330, title: 'INWARD · GAIN', value: api.params.g.toFixed(2), color: api.P.amber },
            { x: 660, w: 250, title: 'SENSES', value: String(st.senses), color: api.P.ink },
            { x: 910, w: 238, title: 'SPEED', value: Math.hypot(h.dx, h.dy).toFixed(1), color: api.P.ink }
          ];
        };
        st.senses = 0;
        st.probe = function () {
          var h = st.hero, ags = st.world.ags, mx = 0, my = 0, n = ags.length - 1;
          for (var i = 0; i < n; i++) { mx += ags[i].x; my += ags[i].y; }
          return {
            R: api.params.R, g: api.params.g, n: st.senses,
            sp: +Math.hypot(h.dx, h.dy).toFixed(2),
            dc: +Math.hypot(h.x - mx / n, h.y - my / n).toFixed(0)
          };
        };
      },
      step: function (dt, api) {
        var st = api.state, heroType = st.world.types[1];
        heroType.R = api.params.R;
        heroType.c5 = api.params.g;
        stepWorld(st.world, api.rng);
        var h = st.hero, R2 = heroType.R * heroType.R, s = 0;
        for (var i = 0; i < st.world.ags.length - 1; i++) {
          var b = st.world.ags[i];
          var dx = h.x - b.x, dy = h.y - b.y;
          if (dx * dx + dy * dy < R2) s++;
        }
        st.senses = s;
        if ((api.steps & 1) === 0) {
          st.trail.push(h.x, h.y);
          if (st.trail.length > 300) st.trail.splice(0, 2);
        }
      },
      render: function (g, api) {
        var st = api.state, P = api.P, cam = st.cam;
        g.fillStyle = P.bg; g.fillRect(0, 0, W, H);
        trackCamera(cam, st.world.ags, W, H, [st.hero]);
        // no drawGrid here (unlike 0a): at this zoom only 2-3 grid lines fit
        // and they read as a world-boundary box the agents ignore
        var sx = function (x) { return (x - cam.mx) * cam.s + W / 2; };
        var sy = function (y) { return (y - cam.my) * cam.s + H / 2; };
        var i, a, ags = st.world.ags;
        // hero trail, gold, fading — thin and quiet, or its recent segments
        // read as a stray chevron next to the hero
        if (st.trail.length > 3) {
          g.lineWidth = 1.5;
          for (i = 2; i < st.trail.length; i += 2) {
            g.globalAlpha = 0.04 + 0.30 * (i / st.trail.length);
            g.strokeStyle = P.amber;
            g.beginPath();
            g.moveTo(sx(st.trail[i - 2]), sy(st.trail[i - 1]));
            g.lineTo(sx(st.trail[i]), sy(st.trail[i + 1]));
            g.stroke();
          }
          g.globalAlpha = 1;
        }
        var sz = Math.max(3.4, Math.min(11, 6.2 * cam.s));
        for (i = 0; i < ags.length - 1; i++) {
          a = ags[i];
          drawOid(g, sx(a.x), sy(a.y), a.ang, sz, P.cyan, P.core);
        }
        // the hero's perception radius, outward, violet and dashed
        g.setLineDash([6, 8]);
        g.strokeStyle = P.cyan;
        g.globalAlpha = 0.65;
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(sx(st.hero.x), sy(st.hero.y), api.params.R * cam.s, 0, 6.2832);
        g.stroke();
        g.setLineDash([]);
        g.globalAlpha = 1;
        drawOid(g, sx(st.hero.x), sy(st.hero.y), st.hero.ang, sz * 1.9, P.amber, null);
      }
    });
    return ctrl;
  }

  global.makeSim0a = makeSim0a;
  global.makeSim0b = makeSim0b;

})(typeof window !== 'undefined' ? window : this);
