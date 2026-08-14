/* =============================================================================
   SimKit — shared simulation engine for "You Are the Agent"
   ERA Minicon 2026 · Alyssa Adams

   Zero dependencies. Zero network. Designed to run live during a remote talk
   that is screen-shared to a Discord stream at ~720p.

   THE RULES (every sim spec independently arrived at these; do not violate):
     1.  NEVER ctx.shadowBlur          — software-rasterised on many drivers,
                                          the single worst canvas frame-killer.
     2.  NEVER create*Gradient per frame — allocate + recompile; cache at resize.
     3.  NEVER ctx.filter = 'blur(..)' — catastrophic.
     4.  NEVER full-canvas alpha fillRect for trail fades — 2M px of blending.
     5.  CAP devicePixelRatio           — a 4K backing store quadruples every fill.
     6.  Terrain/fields render ONCE offscreen, then blit.
     7.  NO canvas text. All text lives in HTML.
     8.  getContext('2d', {alpha:false}). (No desynchronized — it interacts
         badly with screen capture.)
     9.  Fixed timestep. Never scale by measured dt.
    10.  Math.random and Date.now appear NOWHERE in sim logic.
    11.  IntersectionObserver + visibilitychange -> pause; reset() on entry.
    12.  Reset button + at most 2 sliders. No numeric readouts.
    13.  Never leave a dead screen — freeze on a tableau or loop cleanly.
   ============================================================================= */

(function (global) {
  'use strict';

  // ---------------------------------------------------------------------------
  // Palette. Chosen to survive 4:2:0 chroma subsampling: saturated hues smear
  // at 720p but LUMINANCE survives, so every agent gets a white-hot core.
  // Shape is carried by the core; identity by the hue.
  // ---------------------------------------------------------------------------
  var PALETTE = {
    bg:        '#060607',   // near-black. Never #000 — it bands on stream.
    ink:       '#F1F1F5',
    dim:       '#9CA0B2',
    rule:      '#232330',
    cyan:      '#8A8AFF',
    magenta:   '#FF5C68',
    amber:     '#FFD24A',
    green:     '#4AE87C',
    stranded:  '#6E7080',   // light enough to survive banding
    core:      '#FCFCFF'
  };

  // ---------------------------------------------------------------------------
  // Deterministic randomness
  // ---------------------------------------------------------------------------

  /** mulberry32 — seedable, fast, well-distributed. 5 lines, zero deps. */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Box–Muller with cached spare, driven only by a seeded uniform. */
  function gaussFactory(rng) {
    var spare = null;
    return function () {
      if (spare !== null) { var v = spare; spare = null; return v; }
      var u, w, s;
      do { u = rng() * 2 - 1; w = rng() * 2 - 1; s = u * u + w * w; }
      while (s === 0 || s >= 1);
      var m = Math.sqrt(-2 * Math.log(s) / s);
      spare = w * m;
      return u * m;
    };
  }

  /**
   * Counter-based hash -> uniform in [0,1).
   *
   * WHY THIS EXISTS: a shared sequential PRNG stream desynchronises whenever
   * the substep count varies (a dropped frame, a different code path). Indexing
   * noise by (i, n) instead means agent i at step n ALWAYS draws the same value,
   * so a run is bit-identical regardless of frame drops — and two populations
   * taking different code paths still consume identical randomness.
   * That last property is what makes paired "common random numbers" work.
   */
  function hash01(i, n, seed) {
    var h = (Math.imul(i | 0, 0x9E3779B1) ^ Math.imul(n | 0, 0x85EBCA77) ^ (seed | 0)) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x7FEB352D) >>> 0;
    h = Math.imul(h ^ (h >>> 15), 0x846CA68B) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  /** Two hashes -> Box–Muller -> deterministic per-(i, n) Gaussian. */
  function hashGauss(i, n, seed) {
    var u1 = hash01(i, n, seed);
    var u2 = hash01(i, n, (seed ^ 0x5F356495) | 0);
    if (u1 < 1e-12) u1 = 1e-12;
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(6.283185307179586 * u2);
  }

  /** Deterministic unit vector from (i, n, seed). */
  function hashUnitVec(i, n, seed) {
    var th = hash01(i, n, seed) * 6.283185307179586;
    return { x: Math.cos(th), y: Math.sin(th) };
  }

  // ---------------------------------------------------------------------------
  // Pre-rendered glow sprites — LEGACY, zero callers since 10 Aug ("remove
  // glows throughout this deck"). Agents are flat solid discs now (see
  // SwarmChem.drawOid). Kept because it is still the only sanctioned way to
  // glow if a glow ever returns; ctx.shadowBlur stays banned regardless.
  // ---------------------------------------------------------------------------

  var _glowCache = Object.create(null);

  /**
   * Radial-gradient sprite, built once per colour. Draw with drawImage under
   * globalCompositeOperation='lighter'. This replaces ctx.shadowBlur entirely.
   */
  function glowSprite(color, size) {
    size = size || 96;
    var key = color + '@' + size;
    if (_glowCache[key]) return _glowCache[key];
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d');
    var r = size / 2;
    var grd = g.createRadialGradient(r, r, 0, r, r, r);
    grd.addColorStop(0.00, color + 'FF');
    grd.addColorStop(0.28, color + '99');
    grd.addColorStop(0.62, color + '2E');
    grd.addColorStop(1.00, color + '00');
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    _glowCache[key] = c;
    return c;
  }

  /** Offscreen canvas helper (for terrain/field layers blitted per frame). */
  function offscreen(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  // ---------------------------------------------------------------------------
  // clamp / lerp / misc
  // ---------------------------------------------------------------------------
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sigmoid(u) { return 1 / (1 + Math.exp(-u)); }

  /** Bilinear sample of a Float32Array grid laid out row-major [gy*gw + gx]. */
  function bilinear(grid, gw, gh, u, v) {
    var x = clamp(u, 0, 0.999999) * (gw - 1);
    var y = clamp(v, 0, 0.999999) * (gh - 1);
    var x0 = x | 0, y0 = y | 0;
    var x1 = x0 + 1 < gw ? x0 + 1 : x0;
    var y1 = y0 + 1 < gh ? y0 + 1 : y0;
    var fx = x - x0, fy = y - y0;
    var a = grid[y0 * gw + x0], b = grid[y0 * gw + x1];
    var c = grid[y1 * gw + x0], d = grid[y1 * gw + x1];
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  }

  // ---------------------------------------------------------------------------
  // Canvas sizing. DPR is capped because the stream is 720p — a 2x or 3x
  // backing store is pure wasted fill rate and a real framerate risk on
  // integrated graphics while a screen-share encoder is also running.
  // ---------------------------------------------------------------------------
  function fitCanvas(canvas, cssW, cssH, dprCap, maxBackingW) {
    var dpr = Math.min(global.devicePixelRatio || 1, dprCap || 1.5);
    var bw = Math.round(cssW * dpr);
    if (maxBackingW && bw > maxBackingW) {
      dpr = maxBackingW / cssW;
      bw = maxBackingW;
    }
    var bh = Math.round(cssH * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    return dpr;
  }

  // ---------------------------------------------------------------------------
  // createSim — the loop, lifecycle, and control chrome.
  //
  //   mode 'perframe'    : exactly one step() per rAF tick. Bit-identical under
  //                        frame drops (the sim just runs slower in wall-clock).
  //                        Use when reproducibility matters more than pacing.
  //   mode 'accumulator' : fixed-dt accumulator with a substep cap and backlog
  //                        drop. Use when story beats are scheduled in seconds.
  // ---------------------------------------------------------------------------
  function createSim(cfg) {
    var canvas       = cfg.canvas;
    var cssW         = cfg.width  || 1280;
    var cssH         = cfg.height || 620;
    var mode         = cfg.mode   || 'perframe';
    var DT           = cfg.dt     || (1 / 60);
    var MAX_SUBSTEPS = cfg.maxSubsteps || 3;
    var MAX_FRAME_DT = cfg.maxFrameDt  || 0.05;
    var dprCap       = cfg.dprCap || 1.5;

    var dpr = fitCanvas(canvas, cssW, cssH, dprCap, cfg.maxBackingWidth || 1920);
    var ctx = canvas.getContext('2d', { alpha: false });

    var api = {
      ctx: ctx,
      canvas: canvas,
      W: cssW,
      H: cssH,
      dpr: dpr,
      t: 0,            // simulation seconds
      steps: 0,        // integer step counter (drives hash-based noise)
      seed: cfg.seed || 1,
      params: {},      // live slider values, by key
      state: {},       // sim-owned scratch
      P: PALETTE,
      // helpers, exposed so sims don't re-import
      rng: null,
      gauss: null,
      glow: glowSprite,
      offscreen: offscreen,
      clamp: clamp, lerp: lerp, sigmoid: sigmoid, bilinear: bilinear,
      hash01: hash01, hashGauss: hashGauss, hashUnitVec: hashUnitVec,
      // Set from inside step() to request a clean restart on the next tick
      // (used by sims that loop unattended). Full re-setup, not a partial poke.
      restart: false
    };

    // Seed defaults from control definitions before setup() runs.
    (cfg.controls || []).forEach(function (c) {
      if (c.type === 'slider') api.params[c.key] = c.value;
      if (c.type === 'toggle') api.params[c.key] = !!c.value;
    });

    var raf = null, last = 0, acc = 0, onScreen = false, started = false;

    function reset() {
      api.t = 0;
      api.steps = 0;
      api.restart = false;
      api.rng = mulberry32(api.seed);
      api.gauss = gaussFactory(api.rng);
      api.state = {};
      acc = 0;
      if (cfg.setup) cfg.setup(api);
      if (cfg.render) { ctx.save(); ctx.scale(dpr, dpr); cfg.render(ctx, api); ctx.restore(); }
    }

    function frame(now) {
      raf = global.requestAnimationFrame(frame);
      if (!started) { last = now; return; }

      if (api.restart) { reset(); last = now; return; }

      if (mode === 'perframe') {
        if (!cfg.done || !cfg.done(api)) {
          cfg.step(DT, api);
          api.t += DT;
          api.steps++;
        }
      } else {
        var dt = (now - last) / 1000;
        if (dt > MAX_FRAME_DT) dt = MAX_FRAME_DT;   // no spiral of death
        acc += dt;
        var n = 0;
        while (acc >= DT && n < MAX_SUBSTEPS) {
          if (!cfg.done || !cfg.done(api)) {
            cfg.step(DT, api);
            api.t += DT;
            api.steps++;
          }
          acc -= DT;
          n++;
        }
        if (n === MAX_SUBSTEPS) acc = 0;            // drop backlog, don't chase
      }
      last = now;

      ctx.save();
      ctx.scale(dpr, dpr);
      cfg.render(ctx, api);
      ctx.restore();
    }

    function start() {
      if (started) return;
      started = true;
      last = global.performance.now();
      if (!raf) raf = global.requestAnimationFrame(frame);
    }

    function stop() {
      started = false;
      if (raf) { global.cancelAnimationFrame(raf); raf = null; }
    }

    function sync() {
      // She WILL navigate back to this slide. It must always start at t=0.
      if (onScreen && !document.hidden) { reset(); start(); }
      else stop();
    }

    if (global.IntersectionObserver) {
      new global.IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        if (vis === onScreen) return;
        onScreen = vis;
        sync();
      }, { threshold: cfg.visibilityThreshold || 0.25 }).observe(canvas);
    } else {
      onScreen = true;
      sync();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (onScreen) { last = global.performance.now(); start(); }
    });

    // -- control chrome ---------------------------------------------------------
    // Deliberately no numeric readouts: numbers invite questions you don't want
    // to field mid-talk. Labels only, and big hit targets — she may be driving
    // this on a trackpad on a shared screen.
    var controlsEl = null;
    if (cfg.controlsMount) {
      controlsEl = document.createElement('div');
      controlsEl.className = 'sim-controls';

      (cfg.controls || []).forEach(function (c) {
        if (c.type === 'slider') {
          var wrap = document.createElement('label');
          // narrow: opt-in 112px rail (vs 170px) for slides whose controls
          // row would otherwise wrap onto the .src footnote (see SIM 2).
          // gold: inward/interoception sliders — the accent colour is semantic.
          // world: knobs that reshape the WORLD, not one population — neutral
          // grey, so a slider never wears a flock's colour it doesn't control.
          wrap.className = 'sim-slider' + (c.narrow ? ' narrow' : '') +
                           (c.gold ? ' gold' : '') + (c.world ? ' world' : '') +
                           (c.red ? ' red' : '');
          wrap.innerHTML =
            '<span class="sim-lab">' + c.label + '</span>' +
            '<span class="sim-end">' + (c.lo || '') + '</span>';
          var input = document.createElement('input');
          input.type = 'range';
          input.min = c.min; input.max = c.max;
          input.step = c.step || 0.01;
          input.value = c.value;
          input.addEventListener('input', function () {
            var v = parseFloat(input.value);
            // Optional detent: lets her always snap back to the rehearsed value
            // without needing a full reset.
            if (c.detent !== undefined && Math.abs(v - c.detent) < (c.detentEps || 0.05)) {
              v = c.detent;
              input.value = String(v);
            }
            api.params[c.key] = v;
            if (c.onChange) c.onChange(v, api);
          });
          wrap.appendChild(input);
          var hi = document.createElement('span');
          hi.className = 'sim-end';
          hi.textContent = c.hi || '';
          wrap.appendChild(hi);
          controlsEl.appendChild(wrap);
          c._input = input;
        } else if (c.type === 'button') {
          var btn = document.createElement('button');
          btn.className = 'sim-btn';
          btn.textContent = c.label;
          btn.addEventListener('click', function () { c.onClick(api, ctrl); });
          controlsEl.appendChild(btn);
        }
      });

      cfg.controlsMount.appendChild(controlsEl);
    }

    /** Restore seed AND every control default in one click. */
    function hardReset() {
      (cfg.controls || []).forEach(function (c) {
        if (c.type === 'slider') {
          api.params[c.key] = c.value;
          if (c._input) c._input.value = String(c.value);
          if (c.onChange) c.onChange(c.value, api);
        }
        if (c.type === 'toggle') api.params[c.key] = !!c.value;
      });
      reset();
    }

    var ctrl = {
      api: api,
      reset: reset,
      hardReset: hardReset,
      start: start,
      stop: stop,
      setSeed: function (s) { api.seed = s >>> 0; reset(); },
      isRunning: function () { return started; }
    };

    return ctrl;
  }

  // ---------------------------------------------------------------------------
  global.SimKit = {
    PALETTE: PALETTE,
    mulberry32: mulberry32,
    gaussFactory: gaussFactory,
    hash01: hash01,
    hashGauss: hashGauss,
    hashUnitVec: hashUnitVec,
    glowSprite: glowSprite,
    offscreen: offscreen,
    fitCanvas: fitCanvas,
    clamp: clamp,
    lerp: lerp,
    sigmoid: sigmoid,
    bilinear: bilinear,
    createSim: createSim
  };

})(typeof window !== 'undefined' ? window : this);
