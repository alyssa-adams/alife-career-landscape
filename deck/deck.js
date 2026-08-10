/* =============================================================================
   Minimal deck engine. ~130 lines, zero dependencies.

   NOT reveal.js: the existing decks in this repo CDN-load it, and this talk has
   to survive a dead network — it is presented remotely, and the network already
   failed once while researching it. This also lets the whole deck ship as one
   self-contained HTML file that can be dropped into Discord for 550 people who
   then get to play with the simulations themselves.

   The stage is a fixed 1280x720 box scaled to fit. Nothing reflows between her
   laptop, the room projector and the stream.
   ============================================================================= */

(function (global) {
  'use strict';

  var stage = document.getElementById('stage');
  var hud = document.getElementById('hud');
  var bar = document.getElementById('progress');
  var help = document.getElementById('help');
  var slides = [], idx = 0, goBuf = '', mainCount = null;

  // Space a sim slide has after its act line, title, controls and source line.
  var MAX_SIM_W = 1180, MAX_SIM_H = 404, RO_H = 54;

  function fit() {
    var s = Math.min(global.innerWidth / 1280, global.innerHeight / 720);
    stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }
  global.addEventListener('resize', fit);

  function show(n) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (slides[idx]) slides[idx].classList.remove('on');
    idx = n;
    slides[idx].classList.add('on');
    // The counter and the bar track the PRESENTED path only. Backup slides live
    // after it in the same file so the Discord artifact keeps them and so she can
    // jump to one during Q&A — but they must never make her think she is behind.
    var main = mainCount || slides.length;
    // backups get .bk (pinned-top layout) so consecutive Q&A jumps don't
    // bounce the kicker/title anchor around the vertical centre
    slides[idx].classList.toggle('bk', idx >= main);
    if (idx < main) {
      hud.textContent = (idx + 1) + ' / ' + main;
      bar.style.width = ((idx + 1) / main * 100) + '%';
    } else {
      hud.textContent = 'backup ' + (idx - main + 1) + ' / ' + (slides.length - main);
      bar.style.width = '100%';
    }
    if (global.history && global.history.replaceState) {
      global.history.replaceState(null, '', '#' + (idx + 1));
    }
    // The .src footnote is absolutely positioned at the bottom, so a tall slide's
    // content runs silently underneath it — a stage-overflow check cannot see the
    // collision, and on a projector it reads as garbled text. Reserve exactly the
    // room the footnote needs and let the flex box centre what is left. A slide
    // that then cannot fit overflows the stage instead, which IS detected.
    // Sim slides are excluded: their bottom padding is load-bearing for the
    // canvas fit computed in addSim().
    var src = slides[idx].querySelector('.src');
    if (src && !slides[idx].classList.contains('simslide')) {
      slides[idx].style.paddingBottom = (src.offsetHeight + 40) + 'px';
    }

    var t = slides[idx].querySelector('.timer');
    if (t) resetTimer(t);
  }

  /* -- activity countdown ---------------------------------------------------
     A large on-slide timer is the single highest-value facilitation tool for a
     presenter who cannot see the room. It replaces every visual cue she has
     lost, and it makes a two-minute silence legible as intentional rather than
     as a technical fault.                                                    */
  var tHandle = null, tLeft = 0, tEl = null;
  function fmt(s) {
    var m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }
  function resetTimer(el) {
    if (tHandle) { clearInterval(tHandle); tHandle = null; }
    tEl = el;
    tLeft = parseInt(el.getAttribute('data-secs'), 10) || 120;
    el.textContent = fmt(tLeft);
    el.style.color = 'var(--amber)';
  }
  function toggleTimer() {
    if (!tEl) return;
    if (tHandle) { clearInterval(tHandle); tHandle = null; return; }
    tHandle = setInterval(function () {
      tLeft--;
      tEl.textContent = fmt(Math.max(0, tLeft));
      if (tLeft <= 10) tEl.style.color = 'var(--magenta)';
      if (tLeft <= 0) { clearInterval(tHandle); tHandle = null; }
    }, 1000);
  }

  document.addEventListener('keydown', function (e) {
    if (help.classList.contains('on') && e.key !== '?') { help.classList.remove('on'); return; }
    if (goBuf && /^[0-9]$/.test(e.key)) { goBuf += e.key; return; }
    switch (e.key) {
      case 'ArrowRight': case ' ': case 'PageDown': show(idx + 1); e.preventDefault(); break;
      case 'ArrowLeft': case 'PageUp': show(idx - 1); e.preventDefault(); break;
      case 'Home': show(0); break;
      case 'End': show(slides.length - 1); break;
      case 't': case 'T': toggleTimer(); break;
      case '?': help.classList.toggle('on'); break;
      case 'g': case 'G': goBuf = ' '; break;
      case 'Enter':
        if (goBuf) { show(parseInt(goBuf.trim(), 10) - 1); goBuf = ''; }
        break;
      case 'Escape': goBuf = ''; help.classList.remove('on'); break;
    }
  });

  // Click to advance, but never when she is driving a slider or pressing a
  // simulation control.
  document.addEventListener('click', function (e) {
    if (e.target.closest('.sim-controls') || e.target.closest('a')) return;
    show(idx + 1);
  });

  /* -- slide construction --------------------------------------------------- */

  function el(html) {
    var d = document.createElement('div');
    d.className = 'slide';
    d.innerHTML = html;
    return d;
  }

  var API = {
    /** Navigate. Exposed so the test harness drives the real code path rather
        than toggling .on itself — an audit that skips show() cannot see any
        layout work show() does. */
    show: function (n) { show(n); },

    /** Plain content slide. */
    add: function (html, cls) {
      var d = el(html);
      if (cls) d.className += ' ' + cls;
      stage.appendChild(d);
      slides.push(d);
      return d;
    },

    /**
     * Simulation slide. The factory is called ONCE, lazily, the first time the
     * slide is shown — building six simulations up front would stall the deck
     * on load for no reason, since most of them are minutes away.
     */
    addSim: function (opts) {
      var d = el(
        (opts.act ? '<div class="act">' + opts.act + '</div>' : '') +
        (opts.title ? '<div class="simcap">' + opts.title + '</div>' : '') +
        '<div class="simwrap"><div class="readout"></div>' +
        '<div class="simbox"><canvas></canvas></div><div class="mount"></div></div>' +
        (opts.src ? '<div class="src">' + opts.src + '</div>' : '')
      );
      d.className += ' simslide';
      stage.appendChild(d);
      slides.push(d);

      var built = false;
      var obs = new MutationObserver(function () {
        if (built || !d.classList.contains('on')) return;
        built = true;
        var cv = d.querySelector('canvas');
        var ctrl = opts.make(cv, d.querySelector('.mount'));

        // Fit the canvas into the space the slide actually has left, by scaling
        // the DISPLAY only. The simulation's backing store, coordinates and
        // dynamics are all untouched.
        var ro = d.querySelector('.readout');
        // Declared explicitly rather than probed off api.state: the engine only
        // runs setup() when the IntersectionObserver first fires, so reading
        // state.readout here always saw an empty object, the strip collapsed to
        // zero width at the slide's centre, and the labels marched off the edge.
        var hasReadout = !!opts.readout;
        var natW = ctrl.api.W, natH = ctrl.api.H;
        var avail = MAX_SIM_H - (hasReadout ? RO_H : 0);
        var scale = Math.min(MAX_SIM_W / natW, avail / natH, 1);
        var box = d.querySelector('.simbox');
        box.style.width = (natW * scale) + 'px';
        box.style.height = (natH * scale) + 'px';
        cv.style.transform = 'scale(' + scale + ')';

        // Only the sims that publish labels get vertical space for them, and
        // the strip is aligned to the canvas so the per-panel offsets land right.
        if (hasReadout) {
          ro.style.height = RO_H + 'px';
          ro.style.width = (natW * scale) + 'px';
        }
        (function paint() {
          requestAnimationFrame(paint);
          var st = ctrl.api.state;
          if (!st || !st.readout) return;
          var cells = st.readout();
          ro.innerHTML = cells.map(function (c) {
            return '<div class="ro-cell" style="width:' + (c.w * scale) + 'px;left:' + (c.x * scale) + 'px"><div class="ro-title" style="color:' +
              (c.color || '#F1F1F5') + '">' + c.title + '</div>' +
              (c.value ? '<div class="ro-value">' + c.value + '</div>' : '') + '</div>';
          }).join('');
        })();
      });
      obs.observe(d, { attributes: true, attributeFilter: ['class'] });
      return d;
    },

    /**
     * Marks the end of the presented path. Slides added after this call are
     * backup: they still ship in the file, still answer questions, still get
     * read on Discord — they just stop counting against the hour.
     */
    appendix: function () {
      mainCount = stage.querySelectorAll('.slide').length;
    },

    start: function () {
      slides = Array.prototype.slice.call(stage.querySelectorAll('.slide'));
      fit();
      var h = parseInt((location.hash || '#1').slice(1), 10);
      show(isNaN(h) ? 0 : h - 1);
    }
  };

  global.Deck = API;

})(window);
