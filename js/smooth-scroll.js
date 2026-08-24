/* ============================================
   SHAHMEEN HUSAIN — Smooth Scroll Engine
   A lightweight Lenis-style inertia scroller.
   Self-contained: no external dependencies.
   ============================================ */

(function (global) {
  'use strict';

  var LINE_HEIGHT = 40;   // px per wheel 'line' (deltaMode 1)

  function SmoothScroll(options) {
    options = options || {};
    this.lerp = options.lerp || 0.15;          // easing factor per frame
    this.wheelMultiplier = options.wheelMultiplier || 1;
    this.enabled = false;
    this.target = window.scrollY;
    this.current = window.scrollY;
    this.velocity = 0;
    this.direction = 0;
    this.rafId = null;
    this._listeners = [];
    this._onWheel = this._onWheel.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._raf = this._raf.bind(this);
    this.limit = 0;
    this._updateLimit();
  }

  SmoothScroll.prototype._updateLimit = function () {
    this.limit = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
  };

  SmoothScroll.prototype._clamp = function (v) {
    return Math.max(0, Math.min(v, this.limit));
  };

  SmoothScroll.prototype._onWheel = function (e) {
    // Let nested scrollable regions (carousels, cart drawer) scroll natively.
    if (e.target.closest && e.target.closest('[data-native-scroll]')) return;
    e.preventDefault();

    /* deltaY is only in pixels when deltaMode is 0. Mouse wheels commonly
       report DOM_DELTA_LINE (1) with a delta of ~3 per notch — treating that
       as 3 pixels makes the page feel completely stuck. */
    var dy = e.deltaY;
    if (e.deltaMode === 1) dy *= LINE_HEIGHT;
    else if (e.deltaMode === 2) dy *= window.innerHeight;

    this.target = this._clamp(this.target + dy * this.wheelMultiplier);
    this._wake();
  };

  SmoothScroll.prototype._onKeydown = function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
    var page = window.innerHeight * 0.9;
    var map = {
      ArrowDown: 120, ArrowUp: -120,
      PageDown: page, PageUp: -page,
      Home: -this.limit, End: this.limit,
      ' ': e.shiftKey ? -page : page
    };
    if (map[e.key] === undefined) return;
    e.preventDefault();
    if (e.key === 'Home') this.target = 0;
    else if (e.key === 'End') this.target = this.limit;
    else this.target = this._clamp(this.target + map[e.key]);
    this._wake();
  };

  SmoothScroll.prototype._onResize = function () {
    this._updateLimit();
    this.target = this._clamp(this.target);
    this._wake();
  };

  SmoothScroll.prototype._raf = function () {
    var delta = this.target - this.current;

    if (Math.abs(delta) < 0.08) {
      // Settled: land exactly, emit once, then park the loop until the next
      // input. Spinning rAF forever costs battery and buys nothing.
      if (this.current !== this.target) {
        this.current = this.target;
        window.scrollTo(0, this.current);
      }
      this.velocity = 0;
      this._emit();
      this.rafId = null;
      this.running = false;
      return;
    }

    this.current += delta * this.lerp;
    this.velocity = delta;
    this.direction = delta > 0 ? 1 : -1;

    window.scrollTo(0, this.current);
    this._emit();
    this.rafId = requestAnimationFrame(this._raf);
  };

  /* Restart the loop after it has parked. */
  SmoothScroll.prototype._wake = function () {
    if (this.running || !this.enabled) return;
    this.running = true;
    this.rafId = requestAnimationFrame(this._raf);
  };

  SmoothScroll.prototype._emit = function () {
    for (var i = 0; i < this._listeners.length; i++) {
      this._listeners[i]({
        scroll: this.current,
        limit: this.limit,
        velocity: this.velocity,
        direction: this.direction,
        progress: this.limit ? this.current / this.limit : 0
      });
    }
  };

  /* Subscribe to scroll updates. Callback receives
     { scroll, limit, velocity, direction, progress }. */
  SmoothScroll.prototype.on = function (cb) {
    this._listeners.push(cb);
    return this;
  };

  SmoothScroll.prototype.start = function () {
    if (this.enabled) return;
    this.enabled = true;
    this.target = this.current = window.scrollY;
    this._updateLimit();
    window.addEventListener('wheel', this._onWheel, { passive: false });
    window.addEventListener('keydown', this._onKeydown);
    window.addEventListener('resize', this._onResize);

    /* CRITICAL: we call window.scrollTo() every frame. If the document has
       `scroll-behavior: smooth`, each of those calls starts a native
       smooth-scroll animation instead of jumping, so ~60 animations per
       second fight each other and the page judders badly. Force it off
       while we own the scroll, and restore it when we let go. */
    this._prevScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';

    this.running = false;
    this._wake();
  };

  SmoothScroll.prototype.stop = function () {
    if (!this.enabled) return;
    this.enabled = false;
    window.removeEventListener('wheel', this._onWheel, { passive: false });
    window.removeEventListener('keydown', this._onKeydown);
    window.removeEventListener('resize', this._onResize);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.running = false;
    document.documentElement.style.scrollBehavior = this._prevScrollBehavior || '';
  };

  /* Pause inertia without tearing down listeners — used when a
     modal/drawer locks the page. */
  SmoothScroll.prototype.pause = function () {
    this._paused = true;
    this.stop();
    // stay in 'auto' while paused — we resume owning the scroll shortly
    document.documentElement.style.scrollBehavior = 'auto';
  };
  SmoothScroll.prototype.resume = function () {
    if (!this._paused) return;
    this._paused = false;
    this.start();
  };

  SmoothScroll.prototype.scrollTo = function (value, opts) {
    opts = opts || {};
    var top = value;
    if (typeof value === 'string') {
      var el = document.querySelector(value);
      if (!el) return;
      top = el.getBoundingClientRect().top + this.current;
    } else if (value && value.nodeType) {
      top = value.getBoundingClientRect().top + this.current;
    }
    top = this._clamp(top + (opts.offset || 0));
    if (opts.immediate) {
      this.target = this.current = top;
      window.scrollTo(0, top);
    } else {
      this.target = top;
    }
    this._wake();
  };

  /* Recalculate bounds after DOM changes (e.g. products injected). */
  SmoothScroll.prototype.refresh = function () { this._updateLimit(); };

  global.SmoothScroll = SmoothScroll;
})(window);
