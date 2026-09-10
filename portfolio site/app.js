/* =========================================================
   Huraira Khan — portfolio interactions
   No dependencies. Everything degrades gracefully.
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
