/* =========================================================
   Huraira Khan — portfolio interactions
   No dependencies. Everything degrades gracefully.
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle ----------
     The <head> script already picked the initial theme (stored choice, else
     system preference) before first paint. This just wires up the switch. */
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    var syncLabel = function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    };
    syncLabel();
    themeToggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncLabel();
    });
  }

  /* ---------- Nav scroll-spy ----------
     Sections live in two columns of very different heights (a long main
     column, a short sidebar), so "highlight whatever the scroll position
     has passed" only makes sense once the layout has collapsed to one
     column (the same breakpoint the CSS uses for that: max-width: 1000px).
     Above it, main and sidebar scroll independently side by side, so a
     single active link would be misleading — leave the nav unhighlighted
     there instead. */
  (function () {
    var pairs = Array.prototype.slice.call(document.querySelectorAll('.topnav a[href^="#"]'))
      .map(function (link) {
        var section = document.querySelector(link.getAttribute('href'));
        return section ? { link: link, section: section, active: false, top: Infinity } : null;
      })
      .filter(Boolean);

    if (!pairs.length || !('IntersectionObserver' in window)) return;

    function applyActive() {
      var visible = pairs.filter(function (p) { return p.active; });
      if (!visible.length) return;
      var winner = visible.reduce(function (best, p) {
        return Math.abs(p.top) < Math.abs(best.top) ? p : best;
      });
      pairs.forEach(function (p) {
        p.link.classList.toggle('is-active', p === winner);
      });
    }

    function handleEntries(entries) {
      entries.forEach(function (entry) {
        var pair = pairs.filter(function (p) { return p.section === entry.target; })[0];
        if (!pair) return;
        pair.active = entry.isIntersecting;
        pair.top = entry.boundingClientRect.top;
      });
      applyActive();
    }

    var observer = null;

    function start() {
      if (observer) return;
      observer = new IntersectionObserver(handleEntries, { rootMargin: '-90px 0px -55% 0px', threshold: [0, 1] });
      pairs.forEach(function (p) { observer.observe(p.section); });
    }

    function stop() {
      if (!observer) return;
      observer.disconnect();
      observer = null;
      pairs.forEach(function (p) {
        p.active = false;
        p.link.classList.remove('is-active');
      });
    }

    var singleColumn = window.matchMedia('(max-width: 1000px)');
    var sync = function () { singleColumn.matches ? start() : stop(); };
    sync();
    if (singleColumn.addEventListener) singleColumn.addEventListener('change', sync);
    else singleColumn.addListener(sync); // Safari < 14
  })();

  /* ---------- Reveal panels on scroll ----------
     Anything already on screen renders at rest with no animation, so the first
     painted frame is complete. Only panels below the fold animate in. */
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var below = [];

  panels.forEach(function (panel) {
    var isOnScreen = panel.getBoundingClientRect().top < window.innerHeight;
    if (isOnScreen || reduceMotion || !('IntersectionObserver' in window)) {
      panel.classList.add('is-in', 'no-anim');
    } else {
      below.push(panel);
    }
  });

  if (below.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.06 });
    below.forEach(function (p) { revealObserver.observe(p); });

    // Safety net: never leave a panel hidden if the observer misfires.
    window.setTimeout(function () {
      below.forEach(function (p) { p.classList.add('is-in'); });
    }, 2500);
  }

  /* ---------- Nav-click section highlight ----------
     Smooth-scroll already lands on the target; briefly flash its border so
     the destination is unmistakable even mid-panel. */
  document.querySelectorAll('.topnav a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function () {
      var target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;

      document.querySelectorAll('.nav-flash').forEach(function (el) {
        el.classList.remove('nav-flash');
      });
      // Force reflow so the animation restarts if the same section is clicked twice.
      void target.offsetWidth;
      target.classList.add('nav-flash');
      window.setTimeout(function () { target.classList.remove('nav-flash'); }, 1200);
    });
  });

  /* ---------- Tooltips ---------- */
  var tooltip = document.getElementById('tooltip');

  function showTip(el) {
    if (!tooltip) return;
    tooltip.innerHTML = el.dataset.tip;
    tooltip.classList.add('is-on');
    tooltip.setAttribute('aria-hidden', 'false');
    positionTip(el);
  }

  function positionTip(el) {
    var rect = el.getBoundingClientRect();
    var tipRect = tooltip.getBoundingClientRect();
    var left = rect.left + rect.width / 2 - tipRect.width / 2;
    var top = rect.top - tipRect.height - 9;

    // Keep it on screen
    left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
    if (top < 8) top = rect.bottom + 9;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  function hideTip() {
    if (!tooltip) return;
    tooltip.classList.remove('is-on');
    tooltip.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('[data-tip]').forEach(function (el) {
    el.addEventListener('mouseenter', function () { showTip(el); });
    el.addEventListener('mouseleave', hideTip);
    el.addEventListener('focus', function () { showTip(el); });
    el.addEventListener('blur', hideTip);
  });
  window.addEventListener('scroll', hideTip, { passive: true });

  /* ---------- Toast ---------- */
  var toast = document.getElementById('toast');
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-on');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-on');
    }, 2200);
  }

  /* ---------- Copy to clipboard ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      var text = btn.dataset.copy;

      function done() { showToast('Copied ' + text); }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        var input = document.createElement('textarea');
        input.value = text;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        try { document.execCommand('copy'); done(); } catch (err) { showToast(text); }
        document.body.removeChild(input);
      }
    });
  });
})();
