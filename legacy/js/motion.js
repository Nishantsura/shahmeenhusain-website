/* ============================================
   SHAHMEEN HUSAIN — Motion System
   Preloader, custom cursor, smooth scroll,
   scroll reveals, parallax, count-up.
   Loaded on every page.
   ============================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var isTouch = !finePointer;

  /* Shared motion bus so other scripts (main.js) can read scroll
     position without binding their own listeners. */
  var Motion = window.Motion = {
    scroll: window.scrollY,
    progress: 0,
    velocity: 0,
    scroller: null,
    reduceMotion: reduceMotion,
    isTouch: isTouch,
    _scrollSubs: [],
    onScroll: function (cb) { this._scrollSubs.push(cb); return this; },
    _emitScroll: function (data) {
      this.scroll = data.scroll;
      this.progress = data.progress;
      this.velocity = data.velocity;
      for (var i = 0; i < this._scrollSubs.length; i++) this._scrollSubs[i](data);
    }
  };

  /* ---------------------------------------
     1. SMOOTH SCROLL
     --------------------------------------- */
  function initSmoothScroll() {
    // Reduced motion or touch devices keep native scrolling.
    if (reduceMotion || isTouch || !window.SmoothScroll) {
      window.addEventListener('scroll', function () {
        Motion._emitScroll({
          scroll: window.scrollY,
          limit: document.documentElement.scrollHeight - window.innerHeight,
          velocity: 0,
          direction: 0,
          progress: window.scrollY /
            Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        });
      }, { passive: true });
      return;
    }

    // 0.085 felt sluggish layered on top of the OS's own momentum;
    // 0.15 stays smooth while still feeling attached to the input.
    var scroller = new window.SmoothScroll({ lerp: 0.15 });
    scroller.on(function (data) { Motion._emitScroll(data); });
    scroller.start();
    Motion.scroller = scroller;
    document.documentElement.classList.add('has-smooth-scroll');

    // Anchor links route through the scroller.
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      scroller.scrollTo(target, { offset: -80 });
    });

    // Modals/drawers lock the page — pause inertia while locked.
    var lockObserver = new MutationObserver(function () {
      if (document.body.classList.contains('no-scroll')) scroller.pause();
      else scroller.resume();
    });
    lockObserver.observe(document.body, {
      attributes: true, attributeFilter: ['class']
    });

    // Recalculate bounds once async product content settles.
    window.addEventListener('load', function () { scroller.refresh(); });
    setTimeout(function () { scroller.refresh(); }, 1500);
  }

  /* ---------------------------------------
     2. PRELOADER — monogram + 0→100 counter
     --------------------------------------- */
  function initPreloader() {
    var el = document.getElementById('preloader');
    if (!el) return;

    var seen = sessionStorage.getItem('sh-intro-seen');
    if (seen || reduceMotion) {
      el.parentNode.removeChild(el);
      document.documentElement.classList.remove('is-loading');
      startEntrance();
      return;
    }

    document.documentElement.classList.add('is-loading');
    var counter = el.querySelector('.preloader__count');
    var value = 0;
    var duration = 1600;
    var startTime = null;

    function tick(now) {
      if (!startTime) startTime = now;
      var t = Math.min(1, (now - startTime) / duration);
      // easeOutExpo so it decelerates into 100
      var eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      value = Math.round(eased * 100);
      if (counter) counter.textContent = value < 10 ? '00' + value
        : value < 100 ? '0' + value : '100';
      if (t < 1) { requestAnimationFrame(tick); }
      else { finish(); }
    }

    function finish() {
      sessionStorage.setItem('sh-intro-seen', '1');
      el.classList.add('preloader--done');
      document.documentElement.classList.remove('is-loading');
      startEntrance();
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        if (Motion.scroller) Motion.scroller.refresh();
      }, 1200);
    }

    requestAnimationFrame(tick);
  }

  /* Hero entrance plays after the intro clears. */
  function startEntrance() {
    var hero = document.querySelector('[data-entrance]');
    if (hero) requestAnimationFrame(function () { hero.classList.add('is-entered'); });
  }

  /* ---------------------------------------
     3. CUSTOM CURSOR
     --------------------------------------- */
  function initCursor() {
    if (isTouch || reduceMotion) return;

    /* Matches the reference exactly: a small solid arrowhead, ~11x15,
       in the accent red. It does not grow or morph on hover — measured
       on fmrg.studio, the mark stays identical over links. */
    var dot = document.createElement('div');
    dot.className = 'cursor';
    dot.innerHTML =
      '<svg class="cursor__arrow" width="11" height="15" viewBox="0 0 11 15" fill="none">' +
        '<path d="M0.6 0.7 L0.6 13.2 L3.9 10.0 L6.1 14.4 L8.0 13.5 L5.9 9.2 L10.2 8.9 Z" ' +
              'fill="currentColor"/>' +
      '</svg>' +
      '<span class="cursor__label"></span>';
    document.body.appendChild(dot);
    document.documentElement.classList.add('has-custom-cursor');

    var label = dot.querySelector('.cursor__label');
    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var cx = mx, cy = my;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!dot.classList.contains('is-visible')) dot.classList.add('is-visible');
    });

    document.addEventListener('mouseleave', function () {
      dot.classList.remove('is-visible');
    });

    (function render() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      dot.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(render);
    })();

    // Grow / label over interactive targets.
    document.addEventListener('mouseover', function (e) {
      var target = e.target.closest('[data-cursor], a, button');
      if (!target) return;
      var text = target.getAttribute('data-cursor');
      dot.classList.add('is-active');
      if (text) { dot.classList.add('is-labelled'); label.textContent = text; }
    });

    document.addEventListener('mouseout', function (e) {
      var target = e.target.closest('[data-cursor], a, button');
      if (!target) return;
      dot.classList.remove('is-active', 'is-labelled');
      label.textContent = '';
    });
  }

  /* ---------------------------------------
     4. SCROLL REVEALS
     data-reveal="fade|rise|words|lines|mask"
     --------------------------------------- */
  function splitText(el, mode) {
    if (el.dataset.split === 'done') return;
    var text = el.textContent.trim();
    var units = mode === 'words' ? text.split(/\s+/) : [text];
    el.textContent = '';
    units.forEach(function (unit, i) {
      var outer = document.createElement('span');
      outer.className = 'reveal-unit';
      var inner = document.createElement('span');
      inner.className = 'reveal-unit__inner';
      inner.textContent = unit;
      inner.style.transitionDelay = (i * 45) + 'ms';
      outer.appendChild(inner);
      el.appendChild(outer);
      if (mode === 'words' && i < units.length - 1) {
        el.appendChild(document.createTextNode(' '));
      }
    });
    el.dataset.split = 'done';
  }

  function initReveals() {
    // Skip anything already bound so repeated refreshes don't stack observers.
    var els = Array.prototype.slice
      .call(document.querySelectorAll('[data-reveal]'))
      .filter(function (el) { return el.dataset.revealBound !== '1'; });
    if (!els.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        el.classList.add('is-revealed');
        el.dataset.revealBound = '1';
      });
      return;
    }

    els.forEach(function (el) {
      var mode = el.getAttribute('data-reveal');
      if (mode === 'words' || mode === 'lines') splitText(el, mode);
      el.dataset.revealBound = '1';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-reveal-delay') || 0, 10);
        setTimeout(function () { el.classList.add('is-revealed'); }, delay);
        observer.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    els.forEach(function (el) { observer.observe(el); });

    /* Safety net: an element observed while it still has zero area
       (async images, late-injected content) can miss its threshold and
       stay hidden. Nothing that carries real content may depend on the
       observer firing, so sweep anything still hidden but on screen. */
    scheduleRevealSweep();
  }

  var sweepTimer = null;
  function scheduleRevealSweep() {
    if (sweepTimer) clearTimeout(sweepTimer);
    sweepTimer = setTimeout(function () {
      var vh = window.innerHeight;
      document.querySelectorAll('[data-reveal]:not(.is-revealed)')
        .forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < vh && r.bottom > 0) el.classList.add('is-revealed');
        });
    }, 2500);
  }

  /* ---------------------------------------
     5. PARALLAX — data-parallax="0.2"

     Positions are cached, never re-read per frame. Two reasons:
     getBoundingClientRect() right after window.scrollTo() forces a
     synchronous layout every frame, and — worse — the rect it returns
     already includes the translate we applied on the previous frame,
     so feeding it back in makes the value oscillate and the image
     visibly judder. Measure once (untransformed), then derive purely
     from the scroll position.
     --------------------------------------- */
  var layoutCaches = [];

  /* Read the reference box from the element's PARENT, never the element
     itself. The element carries the translate we wrote last frame, so
     measuring it feeds our own output back into the input and the image
     visibly oscillates. The parent is untouched by us, and — unlike a
     cached document offset — it stays correct inside position:sticky
     containers, where visual position and flow position diverge. */
  function refBox(el) {
    return (el.parentElement || el).getBoundingClientRect();
  }

  function initParallax() {
    if (reduceMotion) return;
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if (!els.length) return;

    var items = els.map(function (el) {
      return { el: el, speed: parseFloat(el.getAttribute('data-parallax')) || 0.15 };
    });

    function update() {
      var vh = window.innerHeight;
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var r = refBox(it.el);
        if (r.bottom < -vh || r.top > vh * 2) continue;
        var centre = (r.top + r.height / 2 - vh / 2) / vh;
        it.el.style.transform =
          'translate3d(0,' + (centre * it.speed * 100).toFixed(2) + 'px,0)';
      }
    }

    Motion.onScroll(update);
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------------------------------
     6. EXPANDING FULL-WIDTH IMAGE
     data-expand — grows from a framed inset to full bleed.
     Its height is pinned in CSS so only the width animates; if the
     height grew too, every section below would shift while the user
     scrolls, which reads as the page fighting you.
     --------------------------------------- */
  function initExpand() {
    if (reduceMotion) return;
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-expand]'));
    if (!els.length) return;

    function update() {
      var vh = window.innerHeight;
      for (var i = 0; i < els.length; i++) {
        // width-only animation, so the element's own top is stable
        var top = els[i].getBoundingClientRect().top;
        var p = 1 - Math.min(1, Math.max(0, (top - vh * 0.1) / (vh * 0.9)));
        els[i].style.setProperty('--expand', p.toFixed(3));
      }
    }

    Motion.onScroll(update);
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------------------------------
     7. COUNT-UP STATS — data-count="20"
     --------------------------------------- */
  function initCountUp() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;

    function run(el) {
      var end = parseFloat(el.getAttribute('data-count'));
      var duration = 1800;
      var start = null;
      function tick(now) {
        if (!start) start = now;
        var t = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * end).toLocaleString('en-IN');
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        el.textContent = parseFloat(el.getAttribute('data-count')).toLocaleString('en-IN');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    els.forEach(function (el) {
      if (el.dataset.countBound === '1') return;
      el.dataset.countBound = '1';
      el.textContent = '0';
      observer.observe(el);
    });
  }


  /* ---------------------------------------
     NAV — measure the spread gap
     With justify-content:flex-end the right edge is always the anchor,
     so shrinking `gap` gathers the links rightwards without moving the
     last one. The spread value has to be measured, not guessed: it is
     whatever gap makes the first link land on the left edge.
     --------------------------------------- */
  function initNav() {
    var nav = document.querySelector('.header__nav');
    var header = document.getElementById('header');
    if (!nav || !header) return;

    var items = nav.querySelectorAll('.header__nav-item');
    if (items.length < 2) return;

    function measure() {
      // Only the homepage hero runs the spread state.
      if (!header.classList.contains('header--transparent')) return;

      var prev = nav.style.getPropertyValue('--nav-gap-spread');
      nav.style.setProperty('--nav-gap-spread', '0px');

      var total = 0;
      for (var i = 0; i < items.length; i++) total += items[i].offsetWidth;
      var avail = nav.clientWidth;
      var gap = (avail - total) / (items.length - 1);

      if (!isFinite(gap) || gap < 24) {
        nav.style.setProperty('--nav-gap-spread', prev || '3rem');
        return;
      }
      nav.style.setProperty('--nav-gap-spread', gap.toFixed(1) + 'px');
    }

    // Measure without animating the very first paint into place.
    var t = nav.style.transition;
    nav.style.transition = 'none';
    measure();
    nav.offsetHeight;            // flush
    nav.style.transition = t;

    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);   // widths shift once webfonts land
    }

    // Re-measure whenever the header returns to its spread state, since the
    // logo collapsing/expanding changes how much room the links have.
    new MutationObserver(function () {
      if (header.classList.contains('header--transparent')) measure();
    }).observe(header, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------------------------------------
     BOOT
     --------------------------------------- */
  function boot() {
    initSmoothScroll();
    initNav();
    initPreloader();
    initCursor();
    initReveals();
    initParallax();
    initExpand();
    initCountUp();
  }

  /* Re-scan after async (Shopify) content lands. */
  Motion.refresh = function () {
    initReveals();
    initCountUp();
    layoutCaches.forEach(function (fn) { fn(); });
    if (Motion.scroller) Motion.scroller.refresh();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('load', function () { scheduleRevealSweep(); });
})();
