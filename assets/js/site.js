// Mobile menu: opens/closes the navigation, closes on Escape, and returns focus to the button.
(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (!btn || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'Close' : 'Menu';
  }

  btn.addEventListener('click', function () {
    setOpen(!nav.classList.contains('open'));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      btn.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 820) setOpen(false);
  });
})();

// Maroon entrance (homepage only). The <head> script adds .intro-on before first paint when it should play.
// "Hi," appears, then "I'm Vincy Huang." is revealed as a gold seam draws across the screen. The panels part
// along that seam while the greeting glides into the hero heading. Click, tap, Enter, Space or Escape skips.
// The whole sequence stays under two seconds.
(function () {
  var root = document.documentElement;
  try { sessionStorage.setItem('vh-visited', '1'); } catch (e) {}
  var intro = document.getElementById('intro');
  if (!intro || !root.classList.contains('intro-on')) {
    if (intro) intro.parentNode.removeChild(intro);
    return;
  }
  var hero = document.querySelector('.hero-intro');
  var heading = hero && hero.querySelector('h1');
  var greet = intro.querySelector('.intro-greeting');
  var page = document.querySelectorAll('body > :not(.intro)');
  for (var i = 0; i < page.length; i++) page[i].setAttribute('inert', '');

  // Wrap within the heading's width so the greeting breaks lines exactly as the heading will.
  if (heading) greet.style.maxWidth = heading.getBoundingClientRect().width + 'px';
  greet.style.width = 'max-content';

  var done = false;
  function open() {
    if (done) return;
    done = true;
    clearTimeout(timer);
    document.removeEventListener('keydown', onKey);
    if (heading) {
      var from = greet.getBoundingClientRect();
      var to = heading.getBoundingClientRect();
      // Keep the centring translate and add the distance to the heading.
      greet.style.transform = 'translate(calc(-50% + ' + (to.left - from.left) + 'px),' + (to.top - from.top) + 'px)';
    }
    intro.classList.add('leaving');
    setTimeout(function () {
      root.classList.remove('intro-on');
      if (hero) hero.classList.add('arrive');
      intro.parentNode.removeChild(intro);
      for (var j = 0; j < page.length; j++) page[j].removeAttribute('inert');
    }, 600);
  }
  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  }
  var timer = setTimeout(open, 950);
  intro.addEventListener('click', open);
  document.addEventListener('keydown', onKey);
})();

// Project box on the homepage: one visual at a time with a caption and a page-turn animation.
// Arrows, Left/Right keys (when the box has focus) and swipes change pages; there is no autoplay.
(function () {
  var box = document.querySelector('.pv');
  if (!box) return;
  var slides = Array.prototype.slice.call(box.querySelectorAll('.pv-slide'));
  var title = box.querySelector('.pv-title');
  var count = box.querySelector('.pv-n');
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 0, busy = null;

  function finish() {
    if (!busy) return;
    clearTimeout(busy.t);
    busy.el.classList.remove('turn-out', 'turn-in');
    if (busy.hide) busy.hide.hidden = true;
    busy = null;
  }

  function show(next, dir) {
    finish();
    next = (next + slides.length) % slides.length;
    if (next === cur) return;
    var from = slides[cur], to = slides[next];
    title.textContent = to.getAttribute('data-project');
    count.textContent = next + 1;
    to.setAttribute('aria-label', (next + 1) + ' of ' + slides.length);
    if (calm) {
      from.hidden = true;
      to.hidden = false;
    } else if (dir > 0) {
      // Forward: the current page turns away to reveal the next one beneath it.
      to.hidden = false;
      from.classList.add('turn-out');
      busy = { el: from, hide: from, t: setTimeout(finish, 560) };
    } else {
      // Back: the previous page turns back in on top of the current one.
      to.hidden = false;
      to.classList.add('turn-in');
      busy = { el: to, hide: from, t: setTimeout(finish, 560) };
    }
    cur = next;
  }

  box.querySelector('.pv-next').addEventListener('click', function () { show(cur + 1, 1); });
  box.querySelector('.pv-prev').addEventListener('click', function () { show(cur - 1, -1); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1, 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1, -1); }
  });

  var sx = null, sy = null;
  var stage = box.querySelector('.pv-stage');
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      stage.dataset.swiped = '1';
      show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      setTimeout(function () { delete stage.dataset.swiped; }, 400);
    }
  });

  // Lightbox: click or tap an image to enlarge it; close with the button, Escape, or a click outside.
  var lb = document.getElementById('lightbox');
  if (!lb) return;
  var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), lbClose = lb.querySelector('.lightbox-close');
  var opener = null;
  function openLb(btn) {
    var img = btn.querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = btn.parentNode.querySelector('figcaption').textContent;
    opener = btn;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }
  function closeLb() {
    if (lb.hidden) return;
    lb.hidden = true;
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }
  box.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.pv-zoom');
    if (btn && !stage.dataset.swiped) openLb(btn);
  });
  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeLb(); }
    if (e.key === 'Tab') { e.preventDefault(); lbClose.focus(); } // Only one control, so keep focus on it.
  });
})();

// Gold-line page transition. Clicking a navigation item or an experience card extends a thin gold line from
// the clicked item while a cream panel sweeps across; the new page then reveals with the line settling under
// its heading (see the <head> script and .nav-arrive). About 350 ms in total; skipped with reduced motion.
(function () {
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  if (root.classList.contains('nav-arrive')) {
    var h1 = document.querySelector('main h1');
    if (h1 && !calm) {
      var line = document.createElement('span');
      line.className = 'pt-settle';
      line.setAttribute('aria-hidden', 'true');
      h1.insertAdjacentElement('afterend', line);
      setTimeout(function () { if (line.parentNode) line.parentNode.removeChild(line); }, 1700);
    }
    setTimeout(function () { root.classList.remove('nav-arrive'); }, 400);
  }
  // Pages restored from the back/forward cache should never keep a transition overlay.
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    root.classList.remove('nav-arrive');
    var v = document.querySelector('.pt-veil'), l = document.querySelector('.pt-line');
    if (v) v.parentNode.removeChild(v);
    if (l) l.parentNode.removeChild(l);
  });
  if (calm) return;

  var SELECTOR = '.nav a, .brand, .xp-card .xp-go, .work-row';
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest(SELECTOR);
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();

    var src = (a.closest('.xp-card') || a).getBoundingClientRect();
    var line = document.createElement('span');
    line.className = 'pt-line';
    line.style.left = src.left + 'px';
    line.style.width = src.width + 'px';
    line.style.top = (src.bottom - 1) + 'px';
    var veil = document.createElement('div');
    veil.className = 'pt-veil';
    veil.innerHTML = '<div class="pt-panel"></div>';
    document.body.appendChild(veil);
    document.body.appendChild(line);
    void veil.offsetWidth;
    veil.classList.add('pt-go');
    line.style.left = '0px';
    line.style.width = '100vw';
    try { sessionStorage.setItem('vh-nav', String(Date.now())); } catch (err) {}
    setTimeout(function () { location.href = url.href; }, 190);
  });
})();

// Cursor ring: a small gold ring that trails the pointer on desktop. It grows over links and
// buttons and becomes a maroon "Explore" badge over the Jarvis card. The native pointer stays visible.
(function () {
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || calm) return;

  var ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  ring.innerHTML = '<span class="cursor-label">Explore</span>';
  document.body.appendChild(ring);

  var x = -100, y = -100, rx = -100, ry = -100, raf = 0;
  function frame() {
    rx += (x - rx) * 0.2;
    ry += (y - ry) * 0.2;
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(frame) : 0;
  }

  document.addEventListener('mousemove', function (e) {
    x = e.clientX;
    y = e.clientY;
    if (!ring.classList.contains('visible')) {
      rx = x; ry = y;
      ring.classList.add('visible');
    }
    var t = e.target instanceof Element ? e.target : null;
    var explore = t && t.closest('[data-cursor="explore"]');
    ring.classList.toggle('explore', !!explore);
    ring.classList.toggle('hover', !explore && !!(t && t.closest('a, button, [role="button"], summary, label, input, select, textarea')));
    if (!raf) raf = requestAnimationFrame(frame);
  }, { passive: true });

  document.addEventListener('mouseleave', function () { ring.classList.remove('visible'); });
  document.addEventListener('mousedown', function () { ring.style.opacity = '.6'; });
  document.addEventListener('mouseup', function () { ring.style.opacity = ''; });
})();
