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

// Opening greeting (homepage only). The <head> script adds .intro-on before first paint when it should
// play. "Hi, I'm Vincy Huang." settles on navy, then the panels part while the same line glides into
// the hero heading's position, so it becomes the homepage greeting. Click/tap or Enter/Space/Esc skips
// ahead. Total time stays under two seconds.
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
  var text = intro.querySelector('.intro-text');
  var page = document.querySelectorAll('body > :not(.intro)');
  for (var i = 0; i < page.length; i++) page[i].setAttribute('inert', '');

  // Wrap within the hero heading's width so the greeting breaks lines exactly like it will on the page,
  // while staying only as wide as the text so it sits centered on the navy screen.
  if (heading) {
    text.style.width = 'max-content';
    text.style.maxWidth = heading.getBoundingClientRect().width + 'px';
  }

  var done = false;
  function open() {
    if (done) return;
    done = true;
    clearTimeout(timer);
    document.removeEventListener('keydown', onKey);
    if (heading) {
      var from = text.getBoundingClientRect();
      var to = heading.getBoundingClientRect();
      text.style.animation = 'none';
      text.style.transform = 'translate(' + (to.left - from.left) + 'px,' + (to.top - from.top) + 'px)';
    }
    intro.classList.add('leaving');
    setTimeout(function () {
      root.classList.remove('intro-on');
      if (hero) hero.classList.add('arrive');
      intro.parentNode.removeChild(intro);
      for (var j = 0; j < page.length; j++) page[j].removeAttribute('inert');
    }, 660);
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
