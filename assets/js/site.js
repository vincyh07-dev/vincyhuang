/* Vincy Huang portfolio — The Studio.
   Modules: shared helpers, header and menu, crescent transition and in-page navigation, scroll spy,
   maroon welcome, studio notebook, project books, screenshot strips, sticky sequence, video, lightbox,
   reveal on scroll, cursor ring. Every motion respects prefers-reduced-motion. */
(function () {
  "use strict";
  var root = document.documentElement;
  var calm = !!(
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  var $ = function (s, c) {
    return (c || document).querySelector(s);
  };
  var $$ = function (s, c) {
    return Array.prototype.slice.call((c || document).querySelectorAll(s));
  };
  var clamp = function (v, a, b) {
    return Math.min(b, Math.max(a, v));
  };
  var esc = function (t) {
    var d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
  };
  var samePath = function (a, b) {
    return a.replace(/index\.html$/, "") === b.replace(/index\.html$/, "");
  };

  /* ---------- Header: menu and the scrolled hairline ---------- */
  var header = $(".site-header");
  var menuBtn = $(".menu-btn");
  var nav = $("#site-nav");
  function setMenu(open) {
    if (!nav) return;
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.textContent = open ? "Close" : "Menu";
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      setMenu(!nav.classList.contains("open"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) setMenu(false);
    });
  }
  function onScrollHeader() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Scroll spy: highlight the section in view (homepage) ---------- */
  var spyLinks = $$(".nav-pill a[data-section]");
  var spySections = $$("[data-spy]");
  function setCurrent(id) {
    spyLinks.forEach(function (a) {
      if (a.getAttribute("data-section") === id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  if (spySections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) setCurrent(en.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    spySections.forEach(function (s) {
      spy.observe(s);
    });
  }

  /* ---------- Crescent transition ----------
     Deliberate navigation (links marked data-nav) sends a maroon crescent across the screen: its curved edge
     covers the page in 400 ms, a gold V holds briefly, then the trailing curve uncovers the destination in
     380 ms (about 900 ms in all). In-page jumps happen under the cover; other pages load under it and
     uncover on arrival. Reduced motion: navigation is instant. */
  var cres = $(".cres");
  var shape = cres && $(".cres-shape", cres);
  var vmark = cres && $(".cres-v", cres);
  var busy = false;
  var canAnimate = !!(cres && shape && shape.animate) && !calm;

  function clearCres() {
    if (!cres) return;
    cres.classList.remove("on");
    root.classList.remove("cres-arrive");
    [shape, vmark].forEach(function (el) {
      if (el.getAnimations)
        el.getAnimations().forEach(function (a) {
          a.cancel();
        });
    });
    busy = false;
  }
  function cover(then) {
    busy = true;
    cres.classList.add("on");
    var a = shape.animate(
      [{ transform: "translateX(-144vw)" }, { transform: "translateX(-22vw)" }],
      { duration: 400, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" },
    );
    vmark.animate(
      [
        { opacity: 0, transform: "scale(.86)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 220, delay: 240, easing: "ease-out", fill: "forwards" },
    );
    a.onfinish = then;
  }
  function uncover(hold) {
    busy = true;
    vmark.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(1.06)" },
      ],
      { duration: 200, delay: hold, easing: "ease-in", fill: "forwards" },
    );
    var b = shape.animate(
      [{ transform: "translateX(-22vw)" }, { transform: "translateX(100vw)" }],
      {
        duration: 380,
        delay: hold,
        easing: "cubic-bezier(.45,0,.2,1)",
        fill: "forwards",
      },
    );
    b.onfinish = clearCres;
  }

  // Jump to a section on this page and move keyboard focus to its heading.
  function jumpTo(hash, focus) {
    var id = (hash || "#home").slice(1) || "home";
    var target = document.getElementById(id);
    if (!target) return;
    if (id === "home") window.scrollTo(0, 0);
    else target.scrollIntoView({ block: "start", behavior: "instant" });
    if (spyLinks.length)
      setCurrent(target.closest("[data-spy]") ? target.closest("[data-spy]").id : id);
    if (focus) {
      var h = target.matches("h1, h2") ? target : $("h1[tabindex], h2[tabindex]", target);
      if (h) h.focus({ preventScroll: true });
    }
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-nav]");
    if (
      !a ||
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    if (a.target && a.target !== "_self") return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (nav && nav.classList.contains("open")) setMenu(false);
    e.preventDefault();
    if (busy) return;
    var inPage = samePath(url.pathname, location.pathname) && $("[data-spy]");
    if (inPage) {
      var go = function () {
        if (url.hash !== location.hash) history.pushState(null, "", url.hash || "#home");
        jumpTo(url.hash, true);
      };
      if (!canAnimate) {
        go();
        return;
      }
      cover(function () {
        go();
        uncover(160);
      });
    } else {
      if (!canAnimate) {
        location.href = url.href;
        return;
      }
      cover(function () {
        try {
          sessionStorage.setItem("vh-cres", "1");
        } catch (err) {}
        location.href = url.href;
      });
    }
  });
  window.addEventListener("popstate", function () {
    if ($("[data-spy]")) jumpTo(location.hash, false);
  });
  // Arriving under the crescent: uncover once the page is laid out.
  if (root.classList.contains("cres-arrive")) {
    if (canAnimate)
      requestAnimationFrame(function () {
        uncover(110);
      });
    else clearCres();
  }
  // Coming back to a page we left under the crescent (back/forward cache): uncover it.
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted || !cres) return;
    if (cres.classList.contains("on") && canAnimate) {
      [shape, vmark].forEach(function (el) {
        el.getAnimations().forEach(function (a) {
          a.cancel();
        });
      });
      shape.style.transform = "translateX(-22vw)";
      vmark.style.opacity = "1";
      requestAnimationFrame(function () {
        shape.style.transform = "";
        vmark.style.opacity = "";
        uncover(60);
      });
    } else clearCres();
  });

  /* ---------- Maroon welcome (homepage) ----------
     "Hi," appears, then "I'm Vincy Huang." is revealed as a gold seam draws across. The full greeting is in
     place by about 0.8 s and holds about two more seconds; then the panels part and the greeting glides into
     the hero heading. Click, tap, Enter, Space, Escape or "Skip intro" skips. */
  (function () {
    try {
      sessionStorage.setItem("vh-visited", "1");
    } catch (e) {}
    var intro = $("#intro");
    if (!intro) return;
    if (!root.classList.contains("intro-on")) {
      intro.parentNode.removeChild(intro);
      return;
    }
    var home = $(".home");
    var heading = $(".hero-name");
    var greet = $(".intro-greeting", intro);
    var page = $$("body > :not(.intro)");
    page.forEach(function (el) {
      el.setAttribute("inert", "");
    });
    if (heading) {
      var cs = getComputedStyle(heading);
      greet.style.fontSize = cs.fontSize;
      greet.style.lineHeight = cs.lineHeight;
      greet.style.letterSpacing = cs.letterSpacing;
      greet.style.maxWidth = heading.getBoundingClientRect().width + "px";
      greet.style.width = "max-content";
      greet.style.whiteSpace = cs.whiteSpace;
    }
    var done = false,
      timer;
    function open() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      if (heading) {
        var from = greet.getBoundingClientRect(),
          to = heading.getBoundingClientRect();
        greet.style.transform =
          "translate(calc(-50% + " +
          (to.left - from.left) +
          "px)," +
          (to.top - from.top) +
          "px)";
      }
      intro.classList.add("leaving");
      setTimeout(function () {
        root.classList.remove("intro-on");
        if (home) home.classList.add("arrive");
        intro.parentNode.removeChild(intro);
        page.forEach(function (el) {
          el.removeAttribute("inert");
        });
      }, 640);
    }
    function onKey(e) {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    }
    timer = setTimeout(open, 2950);
    intro.addEventListener("click", open);
    document.addEventListener("keydown", onKey);
  })();

  /* ---------- Studio notebook: tabs, pointer tilt, and drawing closer on scroll ---------- */
  (function () {
    var tablist = $(".nb-tabs");
    if (!tablist) return;
    var tabs = $$('[role="tab"]', tablist);
    var notebook = tablist.closest(".notebook");
    function select(i, focus) {
      if (notebook) notebook.classList.add("is-open");
      tabs.forEach(function (t, j) {
        var on = j === i;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        panel.hidden = !on;
        if (on && !calm) {
          panel.classList.remove("flip");
          void panel.offsetWidth;
          panel.classList.add("flip");
        }
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        select(i, false);
      });
    });
    tablist.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var n = tabs.length,
        to = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") to = (i + 1) % n;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = (i - 1 + n) % n;
      if (e.key === "Home") to = 0;
      if (e.key === "End") to = n - 1;
      if (to !== null) {
        e.preventDefault();
        select(to, true);
      }
    });

    if (calm) return;
    var scene = $(".scene"),
      book = $(".notebook");
    var fine =
      window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fine && scene && book) {
      var tx = 0,
        ty = 0,
        cx = 0,
        cy = 0,
        raf = 0;
      var tick = function () {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        book.style.setProperty("--ry", (cx * 7).toFixed(2) + "deg");
        book.style.setProperty("--rx", (-cy * 5).toFixed(2) + "deg");
        book.style.setProperty("--sx", (-cx * 14).toFixed(1) + "px");
        book.style.setProperty("--sy", (-cy * 10).toFixed(1) + "px");
        raf =
          Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : 0;
      };
      scene.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        var r = book.getBoundingClientRect();
        tx = clamp((e.clientX - r.left) / r.width - 0.5, -0.6, 0.6);
        ty = clamp((e.clientY - r.top) / r.height - 0.5, -0.6, 0.6);
        book.classList.add("tracking");
        if (!raf) raf = requestAnimationFrame(tick);
      });
      scene.addEventListener("pointerleave", function () {
        tx = 0;
        ty = 0;
        if (!raf) raf = requestAnimationFrame(tick);
      });
    }
    if (scene) {
      var queued = false;
      var closer = function () {
        queued = false;
        scene.style.setProperty(
          "--closer",
          clamp(window.scrollY / (window.innerHeight * 0.7), 0, 1).toFixed(3),
        );
      };
      window.addEventListener(
        "scroll",
        function () {
          if (!queued) {
            queued = true;
            requestAnimationFrame(closer);
          }
        },
        { passive: true },
      );
      closer();
    }
  })();

  /* ---------- Project books ----------
     Each book opens on its own: the cover swings around the spine and the book takes the combined width.
     Pages turn as a leaf made of nested strips, each rotated a little more than the last, so the page lifts
     from its outer corner, bends as it turns, and settles flat. A fold shadow follows the moving edge.
     Drag a page partway and let go: past 40% (or with a quick flick) it completes, otherwise it falls back.
     Arrows, Left/Right keys, and swipes also turn pages. Stacked layout on narrow screens: the whole page
     turns from its left edge. */
  (function () {
    var narrowMQ = window.matchMedia && matchMedia("(max-width: 760px)");
    var narrow = function () {
      return !!(narrowMQ && narrowMQ.matches);
    };
    var ease = function (t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    var easeOut = function (t) {
      return 1 - Math.pow(1 - t, 3);
    };

    function leftHTML(p, i) {
      return (
        '<div class="page-inner"><p class="page-num">Page ' +
        (i + 1) +
        "</p><h4>" +
        esc(p.h) +
        "</h4><p>" +
        esc(p.p) +
        "</p></div>"
      );
    }
    function rightHTML(p) {
      return (
        '<div class="page-inner"><figure><button class="zoom" type="button" data-cap="' +
        esc(p.kind + " · " + p.cap) +
        '" aria-label="Enlarge image: ' +
        esc(p.cap) +
        '"><img src="' +
        esc(p.src) +
        '" alt="' +
        esc(p.alt) +
        '" width="' +
        p.w +
        '" height="' +
        p.ht +
        '" decoding="async"></button><figcaption><span class="kind' +
        (p.kind === "Illustration" ? " kind-illustration" : "") +
        '">' +
        esc(p.kind) +
        "</span> " +
        esc(p.cap) +
        "</figcaption></figure></div>"
      );
    }

    $$(".book").forEach(function (book) {
      var pages = JSON.parse($(".book-data", book).textContent);
      var body = $(".book-body", book),
        spread = $(".book-spread", book);
      var left = $(".book-left", book),
        right = $(".book-right", book);
      var prev = $(".book-prev", book),
        next = $(".book-next", book),
        num = $(".book-n", book);
      var toggle = $(".book-toggle", book),
        cover = $(".book-cover", book),
        shadowEl = $(".turn-shadow", book);
      var cur = 0,
        turn = null;

      pages.forEach(function (p) {
        var im = new Image();
        im.src = p.src;
      });
      function render(i) {
        left.innerHTML = leftHTML(pages[i], i);
        right.innerHTML = rightHTML(pages[i]);
      }
      function sync() {
        num.textContent = cur + 1;
        prev.disabled = cur === 0;
        next.disabled = cur === pages.length - 1;
      }
      function mpage(i) {
        return (
          '<div class="book-page book-left">' +
          leftHTML(pages[i], i) +
          '</div><div class="book-page book-right">' +
          rightHTML(pages[i]) +
          "</div>"
        );
      }

      // Build the turning leaf. geo: 'fwd' turns around its left edge, 'back' around its right edge.
      function buildLeaf(geo, W, H, frontHTML, frontCls, backHTML, backCls, mobile) {
        var N = mobile ? 6 : 8,
          s = W / N;
        var leaf = document.createElement("div");
        leaf.className = "book-leaf " + geo;
        leaf.setAttribute("aria-hidden", "true");
        var parent = leaf,
          strips = [];
        for (var k = 0; k < N; k++) {
          var st = document.createElement("div");
          st.className = "leaf-strip";
          st.style.width = s + 1 + "px"; // 1px overlap hides seams between strips
          var offF = geo === "fwd" ? -k * s : -(W - (k + 1) * s);
          var offB = geo === "fwd" ? -(W - (k + 1) * s) : -k * s;
          var face = function (cls, html, pageCls, off) {
            return (
              '<div class="leaf-face ' +
              cls +
              '"><div class="book-page ' +
              pageCls +
              '" style="width:' +
              W +
              "px;height:" +
              H +
              "px;transform:translateX(" +
              off +
              'px)">' +
              html +
              "</div></div>"
            );
          };
          st.innerHTML =
            face("leaf-f", frontHTML, frontCls, offF) +
            face("leaf-b", backHTML, backCls, offB);
          parent.appendChild(st);
          strips.push({ el: st, f: st.children[0], b: st.children[1] });
          parent = st;
        }
        spread.appendChild(leaf);
        return {
          el: leaf,
          strips: strips,
          N: N,
          s: s,
          W: W,
          sign: geo === "fwd" ? -1 : 1,
          geo: geo,
          mobile: mobile,
        };
      }

      // Pose the leaf at progress p (0 = flat where it started, 1 = flat on the other side).
      function pose(L, p) {
        var theta = 180 * p,
          bend = (L.mobile ? 30 : 36) * Math.sin(Math.PI * p);
        var d = bend / (L.N - 1),
          a0 = Math.max(0, theta - bend / 2),
          proj = 0,
          A = 0;
        L.strips.forEach(function (st, k) {
          var step = k === 0 ? a0 : d;
          A = k === 0 ? a0 : A + d;
          if (k === 0) {
            // Tilt the hinge a little mid-turn so the bottom outer corner lifts first, then settle flat.
            var phi = L.sign * 0.1 * Math.sin(Math.PI * p);
            st.el.style.transform =
              "rotate3d(" +
              Math.sin(phi).toFixed(4) +
              "," +
              Math.cos(phi).toFixed(4) +
              ",0," +
              (L.sign * step).toFixed(2) +
              "deg)";
          } else st.el.style.transform = "rotateY(" + (L.sign * step).toFixed(2) + "deg)";
          var rad = (A * Math.PI) / 180;
          proj += L.s * Math.cos(rad);
          var fs = A < 90 ? 0.3 * Math.pow(A / 90, 2) : 0,
            bs = A > 90 ? 0.3 * Math.pow((180 - A) / 90, 2) : 0;
          st.f.style.setProperty("--shade", fs.toFixed(3));
          st.b.style.setProperty("--shade", bs.toFixed(3));
          st.f.style.setProperty(
            "--gloss",
            (A < 90 ? 0.22 * Math.sin(rad * 2) : 0).toFixed(3),
          );
          st.b.style.setProperty(
            "--gloss",
            (A > 90 ? 0.18 * -Math.sin(rad * 2) : 0).toFixed(3),
          );
        });
        if (L.mobile)
          L.el.style.opacity = A > 115 ? clamp(1 - (A - 115) / 55, 0, 1).toFixed(3) : "";
        // Fold shadow on the page beneath, just beyond the moving edge.
        var spineX = L.mobile ? 0 : L.W;
        var edgeX = L.geo === "fwd" ? spineX + proj : spineX - proj;
        var w = 14 + 80 * Math.abs(Math.sin((A * Math.PI) / 180));
        var k2 = (0.34 * Math.sin(Math.PI * p)).toFixed(3);
        var rightOf = edgeX >= spineX;
        shadowEl.style.left = (rightOf ? edgeX : edgeX - w) + "px";
        shadowEl.style.width = w + "px";
        shadowEl.style.opacity = "1";
        shadowEl.style.background =
          "linear-gradient(" +
          (rightOf ? "90deg" : "270deg") +
          ", rgba(20,30,45," +
          k2 +
          "), rgba(20,30,45,0))";
      }

      // Begin a turn toward page `to`. Returns a turn object, or null when the turn is not possible.
      function begin(to) {
        if (to < 0 || to >= pages.length || to === cur) return null;
        var dir = to > cur ? 1 : -1,
          from = cur,
          mobile = narrow();
        var W = mobile ? spread.clientWidth : spread.clientWidth / 2,
          H = spread.clientHeight;
        var t = { to: to, from: from, dir: dir, p: 0, p0: 0, p1: 1 };
        if (mobile) {
          var blank = "";
          if (dir > 0) {
            t.L = buildLeaf("fwd", W, H, mpage(from), "mpage", blank, "book-left", true);
            render(to);
            t.commit = function () {};
            t.revert = function () {
              render(from);
            };
          } else {
            t.L = buildLeaf("fwd", W, H, mpage(to), "mpage", blank, "book-left", true);
            t.p0 = 1;
            t.p1 = 0;
            t.commit = function () {
              render(to);
            };
            t.revert = function () {};
          }
        } else if (dir > 0) {
          t.L = buildLeaf(
            "fwd",
            W,
            H,
            rightHTML(pages[from]),
            "book-right",
            leftHTML(pages[to], to),
            "book-left",
            false,
          );
          right.innerHTML = rightHTML(pages[to]);
          t.commit = function () {
            left.innerHTML = leftHTML(pages[to], to);
          };
          t.revert = function () {
            right.innerHTML = rightHTML(pages[from]);
          };
        } else {
          t.L = buildLeaf(
            "back",
            W,
            H,
            leftHTML(pages[from], from),
            "book-left",
            rightHTML(pages[to]),
            "book-right",
            false,
          );
          left.innerHTML = leftHTML(pages[to], to);
          t.commit = function () {
            right.innerHTML = rightHTML(pages[to]);
          };
          t.revert = function () {
            left.innerHTML = leftHTML(pages[from], from);
          };
        }
        t.p = t.p0;
        pose(t.L, t.p);
        turn = t;
        return t;
      }
      // Progress q (0..1) toward completing the turn.
      function setQ(t, q) {
        t.q = q;
        t.p = t.p0 + (t.p1 - t.p0) * q;
        pose(t.L, t.p);
      }
      function finish(t, completed) {
        cancelAnimationFrame(t.raf);
        if (t.L.el.parentNode) t.L.el.parentNode.removeChild(t.L.el);
        shadowEl.style.opacity = "0";
        if (completed) {
          t.commit();
          cur = t.to;
        } else t.revert();
        if (turn === t) turn = null;
        sync();
      }
      function animateTo(t, target, dur, fn, cb) {
        var q0 = t.q || 0,
          start = performance.now();
        t.target = target;
        cancelAnimationFrame(t.raf);
        var step = function (now) {
          var k = clamp((now - start) / dur, 0, 1);
          setQ(t, q0 + (target - q0) * fn(k));
          if (k < 1) t.raf = requestAnimationFrame(step);
          else cb();
        };
        t.raf = requestAnimationFrame(step);
      }
      function settle() {
        if (turn) finish(turn, turn.target != null ? turn.target === 1 : turn.q >= 0.5);
      }

      function go(to) {
        settle();
        if (to < 0 || to >= pages.length || to === cur) return;
        if (calm) {
          cur = to;
          render(cur);
          sync();
          return;
        }
        var t = begin(to);
        if (!t) return;
        t.q = 0;
        cur = to;
        sync(); // controls reflect the destination right away
        cur = t.from;
        animateTo(t, 1, 900, ease, function () {
          finish(t, true);
        });
      }

      // Opening: the book takes the full width, then the cover swings open. Closing: the cover swings
      // back, both closed books return side by side, and focus goes back to this book's cover.
      var shelf = book.parentNode,
        swap = null;
      function setOpen(open) {
        settle();
        clearTimeout(swap);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.textContent = open ? "Close book" : "Open book";
        if (open) {
          render(cur);
          shelf.classList.add("has-open");
          book.classList.add("is-solo");
          void book.offsetWidth;
          book.classList.add("is-open");
          cover.tabIndex = -1;
          body.tabIndex = 0;
          body.focus({ preventScroll: true });
          book.scrollIntoView({
            block: "nearest",
            behavior: calm ? "auto" : "smooth",
          });
        } else {
          book.classList.remove("is-open");
          body.tabIndex = -1;
          cover.tabIndex = 0;
          cover.focus({ preventScroll: true });
          swap = setTimeout(
            function () {
              book.classList.remove("is-solo");
              shelf.classList.remove("has-open");
              cover.focus({ preventScroll: true });
            },
            calm ? 0 : 780,
          );
        }
      }

      cover.tabIndex = 0;
      sync();
      toggle.addEventListener("click", function () {
        setOpen(!book.classList.contains("is-open"));
      });
      cover.addEventListener("click", function () {
        setOpen(true);
      });
      next.addEventListener("click", function () {
        go(cur + 1);
      });
      prev.addEventListener("click", function () {
        go(cur - 1);
      });
      book.addEventListener("keydown", function (e) {
        if (
          !book.classList.contains("is-open") ||
          e.target.closest("button.book-toggle, a")
        )
          return;
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(cur + 1);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(cur - 1);
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setOpen(false);
        }
      });

      // Drag to turn (mouse, pen, or touch). Vertical movement is left to the page so scrolling still works.
      var drag = null;
      spread.addEventListener("pointerdown", function (e) {
        if (
          !book.classList.contains("is-open") ||
          (e.pointerType === "mouse" && e.button !== 0)
        )
          return;
        settle();
        drag = {
          id: e.pointerId,
          x0: e.clientX,
          y0: e.clientY,
          mode: null,
          pts: [[e.clientX, performance.now()]],
        };
      });
      spread.addEventListener("pointermove", function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var dx = e.clientX - drag.x0,
          dy = e.clientY - drag.y0;
        if (!drag.mode) {
          if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
            drag = null;
            return;
          }
          if (Math.abs(dx) < 8) return;
          var to = cur + (dx < 0 ? 1 : -1);
          if (to < 0 || to >= pages.length) {
            drag.mode = "edge";
            return;
          }
          drag.dir = dx < 0 ? 1 : -1;
          drag.mode = "turn";
          if (!calm) drag.t = begin(to);
          try {
            spread.setPointerCapture(e.pointerId);
          } catch (err) {}
          spread.classList.add("dragging");
        }
        if (drag.mode !== "turn") return;
        var W = narrow() ? spread.clientWidth * 0.9 : spread.clientWidth * 0.6;
        drag.q = clamp((drag.dir > 0 ? -dx : dx) / W, 0, 1);
        if (drag.t) setQ(drag.t, drag.q);
        drag.pts.push([e.clientX, performance.now()]);
        if (drag.pts.length > 6) drag.pts.shift();
      });
      function endDrag(e) {
        if (!drag || e.pointerId !== drag.id) return;
        var d = drag;
        drag = null;
        spread.classList.remove("dragging");
        if (d.mode !== "turn") return;
        body.dataset.dragged = "1";
        setTimeout(function () {
          delete body.dataset.dragged;
        }, 350);
        var a = d.pts[0],
          b = d.pts[d.pts.length - 1];
        var v = ((b[0] - a[0]) / Math.max(1, b[1] - a[1])) * (d.dir > 0 ? -1 : 1);
        var complete = (d.q || 0) > 0.4 || v > 0.9;
        if (!d.t) {
          if (complete) {
            cur += d.dir;
            render(cur);
            sync();
          }
          return;
        }
        var t = d.t,
          remaining = complete ? 1 - t.q : t.q;
        if (complete) {
          cur = t.to;
          sync();
          cur = t.from;
        }
        animateTo(
          t,
          complete ? 1 : 0,
          clamp(650 * remaining, 200, 650),
          easeOut,
          function () {
            finish(t, complete);
          },
        );
      }
      spread.addEventListener("pointerup", endDrag);
      spread.addEventListener("pointercancel", endDrag);
      window.addEventListener("resize", settle);
    });
  })();

  /* ---------- Screenshot strips: arrows, mouse drag, native touch swipe ---------- */
  $$(".strip").forEach(function (strip) {
    var track = $(".strip-track", strip),
      prev = $(".strip-prev", strip),
      next = $(".strip-next", strip);
    var stepW = function () {
      var it = $(".strip-item", track);
      return it ? it.getBoundingClientRect().width + 18 : 300;
    };
    var update = function () {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    };
    prev.addEventListener("click", function () {
      track.scrollBy({ left: -stepW(), behavior: calm ? "auto" : "smooth" });
    });
    next.addEventListener("click", function () {
      track.scrollBy({ left: stepW(), behavior: calm ? "auto" : "smooth" });
    });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    var d = null;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      d = {
        x: e.clientX,
        left: track.scrollLeft,
        moved: false,
        id: e.pointerId,
      };
    });
    track.addEventListener("pointermove", function (e) {
      if (!d) return;
      var dx = e.clientX - d.x;
      if (!d.moved && Math.abs(dx) > 5) {
        d.moved = true;
        track.classList.add("dragging");
        try {
          track.setPointerCapture(d.id);
        } catch (err) {}
      }
      if (d.moved) track.scrollLeft = d.left - dx;
    });
    var end = function () {
      if (!d) return;
      if (d.moved) {
        track.dataset.dragged = "1";
        setTimeout(function () {
          delete track.dataset.dragged;
        }, 0);
      }
      d = null;
      track.classList.remove("dragging");
    };
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
    track.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });
    track.addEventListener(
      "click",
      function (e) {
        if (track.dataset.dragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true,
    );
  });

  /* ---------- Sticky sequence: the visual follows the step in view ---------- */
  $$(".seq").forEach(function (seq) {
    var steps = $$(".seq-step", seq),
      frames = $$(".seq-frame", seq);
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var i = en.target.getAttribute("data-step");
          steps.forEach(function (s) {
            s.classList.toggle("is-on", s.getAttribute("data-step") === i);
          });
          frames.forEach(function (f) {
            f.classList.toggle("is-on", f.getAttribute("data-step") === i);
          });
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    steps.forEach(function (s) {
      io.observe(s);
    });
    if (steps[0]) steps[0].classList.add("is-on");
  });

  /* ---------- Embedded video: poster first, the YouTube player loads on play ---------- */
  $$(".video[data-yt]").forEach(function (box) {
    var btn = $(".video-play", box);
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src =
        "https://www.youtube-nocookie.com/embed/" +
        box.getAttribute("data-yt") +
        "?autoplay=1&rel=0&modestbranding=1";
      f.title = "Jarvis demo video";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      box.innerHTML = "";
      box.appendChild(f);
      f.focus();
    });
  });

  /* ---------- Lightbox for every zoomable image ---------- */
  (function () {
    var lb = $("#lightbox");
    if (!lb) return;
    var lbImg = $("img", lb),
      lbCap = $("figcaption", lb),
      lbClose = $(".lightbox-close", lb),
      opener = null;
    function close() {
      if (lb.hidden) return;
      lb.hidden = true;
      document.body.style.overflow = "";
      if (opener && document.contains(opener)) opener.focus();
    }
    document.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("button.zoom");
      if (!btn || btn.closest(".book-leaf")) return;
      var b = btn.closest(".book-body");
      if (b && b.dataset.dragged) return;
      var im = $("img", btn);
      lbImg.src = im.currentSrc || im.src;
      lbImg.alt = im.alt;
      lbCap.textContent = btn.getAttribute("data-cap") || "";
      opener = btn;
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      lbClose.focus();
    });
    lbClose.addEventListener("click", close);
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.tagName === "FIGURE") close();
    });
    document.addEventListener(
      "keydown",
      function (e) {
        if (lb.hidden) return;
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
        if (e.key === "Tab") {
          e.preventDefault();
          lbClose.focus();
        }
      },
      true,
    );
  })();

  /* ---------- Reveal on scroll ---------- */
  (function () {
    var els = $$(".reveal");
    if (calm || !("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  })();

  /* ---------- Cursor ring: trails the pointer, becomes an "Open" badge over cards ---------- */
  (function () {
    var fine =
      window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || calm) return;
    var ring = document.createElement("div");
    ring.className = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    ring.innerHTML = '<span class="cursor-label">Open</span>';
    document.body.appendChild(ring);
    var x = -100,
      y = -100,
      rx = -100,
      ry = -100,
      raf = 0;
    function frame() {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(frame) : 0;
    }
    document.addEventListener(
      "mousemove",
      function (e) {
        x = e.clientX;
        y = e.clientY;
        if (!ring.classList.contains("visible")) {
          rx = x;
          ry = y;
          ring.classList.add("visible");
        }
        var t = e.target instanceof Element ? e.target : null;
        var explore =
          t &&
          t.closest('[data-cursor="explore"]') &&
          !t.closest(".notebook") &&
          !t.closest("button, .nb-tabs");
        ring.classList.toggle("explore", !!explore);
        ring.classList.toggle(
          "hover",
          !explore && !!(t && t.closest('a, button, [role="tab"], summary, label')),
        );
        if (!raf) raf = requestAnimationFrame(frame);
      },
      { passive: true },
    );
    document.addEventListener("mouseleave", function () {
      ring.classList.remove("visible");
    });
  })();
})();
