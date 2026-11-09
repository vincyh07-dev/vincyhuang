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
      var bs = document.querySelector('.books-section');
      if (bs) bs.classList.add('arrive');
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

// Project books on the homepage. Each book is independent: it opens and closes on its own, and its pages
// turn around the spine (a single page turns on small screens). Arrows, Left/Right keys while the book has
// focus, and swipes turn pages. Click or tap a screenshot to enlarge it.
(function () {
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrow = window.matchMedia && matchMedia('(max-width: 760px)');
  var esc = function (t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; };

  function leftHTML(p, i) {
    return '<div class="page-inner"><p class="page-num">Page ' + (i + 1) + '</p><h3>' + esc(p.h) + '</h3><p>' + esc(p.p) + '</p></div>';
  }
  function rightHTML(p) {
    return '<div class="page-inner"><figure><button class="book-zoom" type="button" aria-label="Enlarge image: ' + esc(p.cap) +
      '"><img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '" width="' + p.w + '" height="' + p.ht + '" decoding="async"></button><figcaption>' +
      esc(p.cap) + '</figcaption></figure></div>';
  }

  Array.prototype.forEach.call(document.querySelectorAll('.book'), function (book) {
    var pages = JSON.parse(book.querySelector('.book-data').textContent);
    var body = book.querySelector('.book-body');
    var spread = book.querySelector('.book-spread');
    var left = book.querySelector('.book-left');
    var right = book.querySelector('.book-right');
    var prev = book.querySelector('.book-prev');
    var next = book.querySelector('.book-next');
    var num = book.querySelector('.book-n');
    var toggle = book.querySelector('.book-toggle');
    var cover = book.querySelector('.book-cover');
    var cur = 0, pending = null;

    // Preload the other screenshots so turns never show an empty page.
    pages.forEach(function (p) { var im = new Image(); im.src = p.src; });

    function sync() {
      num.textContent = cur + 1;
      prev.disabled = cur === 0;
      next.disabled = cur === pages.length - 1;
    }
    function settle() {
      if (!pending) return;
      var p = pending;
      pending = null;
      clearTimeout(p.t);
      p.done();
      if (p.leaf.parentNode) p.leaf.parentNode.removeChild(p.leaf);
    }
    function leaf(cls, frontHTML, frontSide, backHTML, backSide) {
      var el = document.createElement('div');
      el.className = 'book-leaf ' + cls;
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<div class="leaf-face leaf-front"><div class="book-page book-' + frontSide + '">' + frontHTML + '</div></div>' +
        (backHTML ? '<div class="leaf-face leaf-back"><div class="book-page book-' + backSide + '">' + backHTML + '</div></div>' : '');
      spread.appendChild(el);
      void el.offsetWidth;
      return el;
    }

    function go(to) {
      settle();
      if (to < 0 || to >= pages.length || to === cur) return;
      var dir = to > cur ? 1 : -1, from = cur;
      cur = to;
      sync();
      if (calm) { left.innerHTML = leftHTML(pages[to], to); right.innerHTML = rightHTML(pages[to]); return; }

      var el, done;
      if (narrow && narrow.matches) {
        // Stacked layout: the whole page turns from its left edge.
        if (dir > 0) {
          // The current page (text and image) turns away, revealing the next one already in place beneath it.
          el = leaf('fwd', '', 'left');
          el.querySelector('.leaf-front').innerHTML = '<div class="book-page">' + left.outerHTML + right.outerHTML + '</div>';
          left.innerHTML = leftHTML(pages[to], to); right.innerHTML = rightHTML(pages[to]);
          done = function () {};
        } else {
          // The previous page turns back in on top, then becomes the page in place.
          el = leaf('back', '', 'left');
          el.querySelector('.leaf-front').innerHTML = '<div class="book-page"><div class="book-page book-left">' + leftHTML(pages[to], to) +
            '</div><div class="book-page book-right">' + rightHTML(pages[to]) + '</div></div>';
          done = function () { left.innerHTML = leftHTML(pages[to], to); right.innerHTML = rightHTML(pages[to]); };
        }
      } else if (dir > 0) {
        // Forward: the right page lifts and turns over the spine, showing the next left page on its back.
        el = leaf('fwd', rightHTML(pages[from]), 'right', leftHTML(pages[to], to), 'left');
        right.innerHTML = rightHTML(pages[to]);
        done = function () { left.innerHTML = leftHTML(pages[to], to); };
      } else {
        // Back: the left page turns back over the spine, showing the previous right page on its back.
        el = leaf('back', leftHTML(pages[from], from), 'left', rightHTML(pages[to]), 'right');
        left.innerHTML = leftHTML(pages[to], to);
        done = function () { right.innerHTML = rightHTML(pages[to]); };
      }
      requestAnimationFrame(function () { el.classList.add('turn'); });
      pending = { leaf: el, done: done, t: setTimeout(settle, 720) };
    }

    function setOpen(open, focus) {
      settle();
      book.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close book' : 'Open book';
      cover.tabIndex = open ? -1 : 0;
      if (focus) (open ? body : cover).focus({ preventScroll: true });
    }

    cover.tabIndex = book.classList.contains('is-open') ? -1 : 0;
    sync();
    toggle.addEventListener('click', function () { setOpen(!book.classList.contains('is-open'), false); });
    cover.addEventListener('click', function () { setOpen(true, true); });
    next.addEventListener('click', function () { go(cur + 1); });
    prev.addEventListener('click', function () { go(cur - 1); });
    book.addEventListener('keydown', function (e) {
      if (!book.classList.contains('is-open') || e.target.closest('button.book-toggle')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    });

    var sx = null, sy = null;
    body.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    body.addEventListener('touchend', function (e) {
      if (sx === null || !book.classList.contains('is-open')) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        body.dataset.swiped = '1';
        go(cur + (dx < 0 ? 1 : -1));
        setTimeout(function () { delete body.dataset.swiped; }, 400);
      }
    });
  });

  // Lightbox shared by both books.
  var lb = document.getElementById('lightbox');
  if (!lb) return;
  var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), lbClose = lb.querySelector('.lightbox-close');
  var opener = null;
  function closeLb() {
    if (lb.hidden) return;
    lb.hidden = true;
    document.body.style.overflow = '';
    if (opener && document.contains(opener)) opener.focus();
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.book-zoom');
    if (!btn || btn.closest('.book-leaf')) return;
    var body = btn.closest('.book-body');
    if (body && body.dataset.swiped) return;
    var img = btn.querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = btn.parentNode.querySelector('figcaption').textContent;
    opener = btn;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  });
  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeLb(); }
    if (e.key === 'Tab') { e.preventDefault(); lbClose.focus(); }
  });
})();

// Experience cards: "View details" expands the details inside the card; "Hide details" collapses them.
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('.xp-toggle'), function (btn) {
    var card = btn.closest('.xp-card');
    var more = document.getElementById(btn.getAttribute('aria-controls'));
    var label = btn.querySelector('.xp-label');
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      label.textContent = open ? 'Hide details' : 'View details';
      card.classList.toggle('is-expanded', open);
      if (open) more.removeAttribute('inert'); else more.setAttribute('inert', '');
    });
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
