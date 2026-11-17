(function () {
  "use strict";
  var $ = function (s, c) {
      return (c || document).querySelector(s);
    },
    $$ = function (s, c) {
      return Array.prototype.slice.call((c || document).querySelectorAll(s));
    };
  var calm = !!(
      window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches
    ),
    intro = $("#intro");
  if (intro) {
    try {
      sessionStorage.setItem("vh-visited", "1");
    } catch (e) {}
    if (!document.documentElement.classList.contains("intro-on")) intro.remove();
    else {
      var closeIntro = function () {
        if (!intro || intro.classList.contains("leaving")) return;
        intro.classList.add("leaving");
        setTimeout(function () {
          document.documentElement.classList.remove("intro-on");
          intro.remove();
          intro = null;
        }, 620);
      };
      intro.addEventListener("click", closeIntro);
      document.addEventListener("keydown", function (e) {
        if (intro && ["Escape", "Enter", " "].indexOf(e.key) > -1) {
          e.preventDefault();
          closeIntro();
        }
      });
      setTimeout(closeIntro, 2950);
    }
  }
  var header = $(".site-header"),
    menu = $(".menu-button"),
    nav = $("#primary-nav");
  function setMenu(open) {
    if (!menu || !nav) return;
    nav.classList.toggle("open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.querySelector("span").textContent = open ? "Close" : "Menu";
    document.body.classList.toggle("menu-open", open);
  }
  if (menu) {
    menu.addEventListener("click", function () {
      setMenu(!nav.classList.contains("open"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (innerWidth > 900) setMenu(false);
    });
  }
  function updateHeader() {
    if (header) header.classList.toggle("scrolled", scrollY > 8);
  }
  addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
  // Navigation and page-transition behavior
  var transition = $(".screen-transition"),
    busy = false;
  function goTo(hash) {
    var target = $(hash);
    if (!target) return;
    target.scrollIntoView({ block: "start", behavior: "auto" });
    history.pushState(null, "", hash);
    var h = $("h1,h2", target);
    if (h) {
      h.setAttribute("tabindex", "-1");
      h.focus({ preventScroll: true });
    }
  }
  $$("a[data-nav]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var url = new URL(a.href, location.href),
        samePage =
          url.origin === location.origin &&
          url.pathname === location.pathname &&
          url.hash;
      if (url.origin !== location.origin) return;
      e.preventDefault();
      if (busy) return;
      setMenu(false);
      if (calm || !transition) {
        if (samePage) goTo(url.hash);
        else location.href = url.href;
        return;
      }
      busy = true;
      transition.className = "screen-transition is-covering";
      setTimeout(function () {
        if (samePage) {
          goTo(url.hash);
          transition.className = "screen-transition is-uncovering";
          setTimeout(function () {
            transition.className = "screen-transition";
            busy = false;
          }, 410);
        } else {
          try {
            sessionStorage.setItem("vh-cres", "1");
          } catch (err) {}
          location.href = url.href;
        }
      }, 430);
    });
  });
  addEventListener("popstate", function () {
    if (location.hash && $(location.hash)) $(location.hash).scrollIntoView();
  });
  // Active navigation state while scrolling
  var spyLinks = $$(".nav-pill a[data-section]"),
    sections = $$(".section-spy");
  function setCurrent(id) {
    spyLinks.forEach(function (a) {
      if (a.dataset.section === id) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) setCurrent(e.target.id);
        });
      },
      { rootMargin: "-42% 0px -52%" },
    );
    sections.forEach(function (s) {
      observer.observe(s);
    });
  }
  // EDIT HERE: Homepage lens labels, featured work, and experience ordering
  var lenses = {
    product: {
      label: "Product lens",
      line: "I turn messy workflows into tools people can operate.",
      work: "CTRL Robotics",
      sub: "A clearer hospital robot map: location, battery, route history, and X-to-Y navigation.",
      cta: "Explore the project ↗",
      href: "projects/ctrl-robotics.html",
      order: ["ctrl", "streamind", "third", "ctl"],
    },
    research: {
      label: "Research lens",
      line: "I turn human questions into evidence people can act on.",
      work: "Berkeley CTL",
      sub: "Focus groups, 250+ responses, mixed-methods analysis, visualizations, and stakeholder memos.",
      cta: "Explore the research ↗",
      href: "projects/ctl-llm-research.html",
      order: ["ctl", "third", "streamind", "ctrl"],
    },
    data: {
      label: "Data lens",
      line: "I turn noisy data and model outputs into decisions.",
      work: "UCSF Radiology",
      sub: "5,000+ MRI scans, image-quality modeling, segmentation, and failure-case analysis.",
      cta: "Explore the project ↗",
      href: "projects/ucsf-radiology.html",
      order: ["third", "streamind", "ctl", "ctrl"],
    },
  };
  $$("[data-lens]").forEach(function (button) {
    button.addEventListener("click", function () {
      var key = button.dataset.lens,
        d = lenses[key];
      $$("[data-lens]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === button));
      });
      $("#lens-line").textContent = d.line;
      $("#lens-chip").textContent = d.label;
      $("#lens-work").textContent = d.work;
      $("#lens-sub").textContent = d.sub;
      var link = $("#lens-link");
      link.textContent = d.cta;
      link.href = d.href;
      applyLensOrder(key, true);
    });
  });
  // Experience identity and visuals
  var experiences = {
    ctl: {
      dates: "October 2026 – present",
      role: "Undergraduate Research Assistant",
      org: "UC Berkeley Center for Teaching & Learning",
      summary:
        "I turn student and educator feedback about AI into evidence that can shape teaching priorities, including work aligned with the California Education Learning Lab and public LinkedIn updates.",
      points: [
        "Contribution: I helped frame research questions, led 6 focus groups, and analyzed a 250+ response Qualtrics survey across 5 departments.",
        "Influence: I translated qualitative themes and quantitative patterns into 4 stakeholder memos used by 20+ educators and to inform the Center’s priorities.",
        "Public project: I contributed to work highlighted by the California Education Learning Lab on LinkedIn and in Berkeley’s public research channels.",
        "What I learned: useful research needs a traceable path from a person’s comment to a coded theme, supporting data, and a recommendation—without overstating work still in progress.",
        "What I gained: stronger mixed-methods research, stakeholder communication, and product judgment for deciding which AI tools are genuinely useful to people.",
      ],
      image: "assets/img/illustrations/ctl-feedback-themes.svg",
      alt: "Survey and focus-group feedback flowing into coded themes and recommendations for educators",
      caption:
        "Berkeley CTL · Turning feedback into themes and evidence-based recommendations",
    },
    third: {
      dates: "May 2026 – present",
      role: "Machine Learning Intern",
      org: "UCSF Radiology Department",
      summary:
        "I build and evaluate deep-learning pipelines for MRI image quality and liver segmentation.",
      points: [
        "Built a PyTorch image-quality pipeline across 5,000+ prostate MRI scans, reaching 92% accuracy.",
        "Trained a liver segmentation model end to end and achieved a 0.89 mean Dice score.",
        "Analyzed failure cases and learned MRI features to identify model limitations and prioritize future iterations.",
      ],
      image: "assets/img/illustrations/ucsf-mask-review.svg",
      alt: "Three-column illustration comparing aligned, misplaced, and missing liver segmentation masks",
      caption: "UCSF Radiology · Reviewing good, bad, and uncertain segmentation masks",
    },
    streamind: {
      dates: "October 2025 – May 2026",
      role: "Software Engineer Intern",
      org: "Streamind Health",
      summary:
        "I led the laptop-to-iOS rollout of an rPPG biofeedback product for therapists and patients.",
      points: [
        "Built iOS data capture and real-time signal visualization for mobile biofeedback.",
        "Evaluated 20+ phones and computers, achieving heart-rate accuracy within 5 BPM of an Apple Watch in validation.",
        "Balanced user needs, technical feasibility, camera performance, lighting, and signal-quality tradeoffs.",
      ],
      image: "assets/img/work/streamind-browser-and-mobile.jpg",
      alt: "Streamind Health browser biofeedback experience beside the mobile heart-rate monitor",
      caption: "Streamind Health · Browser biofeedback and mobile heart-rate capture",
    },
    ctrl: {
      dates: "January – May 2026",
      role: "Software Engineer Intern",
      org: "CTRL Robotics",
      summary:
        "I turned hospital workflow insights and clinician pain points into software requirements for an autonomous robotics platform.",
      points: [
        "Redesigned mapping and navigation tools in React and TypeScript.",
        "Improved usability by 25% and reduced navigation errors by 30% through iterative, user-centered design.",
        "Designed and shipped robot-selection and badge-registration features with engineers.",
      ],
      image: "assets/img/illustrations/ctrl-operator.svg",
      alt: "Schematic hospital robot operator map with robot status, route history, and point-to-point navigation",
      caption: "CTRL Robotics · Private-safe operator workflow illustration",
    },
  };
  var expTabs = $$("[data-exp]");
  // EDIT HERE: Final homepage experience dates, summaries, and bullet points
  experiences.ctl.dates = "July 2026 – present";
  experiences.ctl.summary =
    "Combine focus groups, surveys, quantitative analysis, and qualitative coding to turn student and faculty feedback into findings educators can act on.";
  experiences.ctl.points = [
    "Research: 6 focus groups and 250+ survey responses across 5 departments.",
    "Analysis: clean and filter data, code themes, compare patterns, and explain findings through graphics and visualizations.",
    "Influence: translate evidence into 4 stakeholder memos supporting 20+ educators and CTL priorities.",
    "Gained: stronger mixed-methods research judgment—from asking the right question to making a traceable recommendation.",
  ];
  experiences.third.summary =
    "Build and evaluate deep-learning pipelines that flag MRI quality issues earlier and make segmentation results easier to review.";
  experiences.third.points = [
    "Built: PyTorch image-quality and liver-segmentation pipelines, including data preparation, training, and evaluation.",
    "Impact: 92% accuracy across 5,000+ prostate MRI scans; 0.89 mean Dice for liver segmentation.",
    "Analysis: review failure cases and visualize masks to find label, image-quality, and model limitations.",
    "Gained: a more careful evaluation mindset—a headline score only matters when the errors are understood.",
  ];
  experiences.streamind.summary =
    "Move camera-based pulse capture from laptop toward iOS so remote health sessions can include an additional physiological signal.";
  experiences.streamind.points = [
    "Built: iOS camera capture, real-time signal visualization, facial-region sampling, and RGB processing.",
    "Validation: evaluated 20+ devices; reported heart-rate readings within 5 BPM in testing.",
    "Analysis: compared sampling regions and signal behavior across lighting, motion, and camera hardware.",
    "Gained: stronger product judgment at the boundary of mobile constraints, user needs, and noisy health data.",
  ];
  experiences.ctrl.summary =
    "Turn hospital delivery and staffing pain points into a clearer robot operator experience for nurses and hospital teams.";
  experiences.ctrl.points = [
    "Built: map navigation, robot selection, live status, battery, route history, and badge registration.",
    "Impact: 25% better usability and 30% fewer navigation errors through iterative design and testing.",
    "Problem solved: operators can understand where a robot is, what it did, and how to send it from one point to another.",
    "Gained: experience translating frontline workflow observations into focused software requirements.",
  ];
  // EDIT HERE: Experience pain points and public links
  var experienceProblems = {
    streamind:
      "Remote sessions hide physical cues that therapists would normally notice in person. Camera-based heart-rate estimation adds useful context without asking patients to wear separate hardware.",
    ctrl: "Hospitals have frequent delivery needs and limited staff. Nurses also lacked a clear map for robot location, battery, route history, and point-to-point navigation.",
    third:
      "Poor-quality MRI scans may be discovered only after radiologist review, delaying care and sometimes forcing patients to return for another scan.",
    ctl: "Professors need evidence—not hype—to decide when AI supports learning. Course teams also need to understand student motivation, format and schedule preferences, retention, and dropout.",
  };
  var experienceLinks = {
    ctl: [
      {
        label: "Explore Berkeley CTL research details →",
        href: "projects/ctl-llm-research.html",
      },
      {
        label: "California Department of Education project ↗",
        href: "https://www.linkedin.com/posts/california-education-learning-lab_aiineducation-ailiteracy-criticalthinking-activity-7508981214205120512-ao9a",
        external: true,
      },
      {
        label: "Learning Lab project page ↗",
        href: "https://calearninglab.org/project/creating-a-framework-for-valued-learning-outcomes-in-2030/",
        external: true,
      },
      {
        label: "Physics 111B public description ↗",
        href: "https://teaching.berkeley.edu/programs/presidential-chair-fellows-grant-program/pcf-fellows",
        external: true,
      },
      {
        label: "Learning Outcomes 2030 ↗",
        href: "https://teaching.berkeley.edu/research/creating-framework-valued-learning-outcomes-2030",
        external: true,
      },
    ],
    third: [
      {
        label: "Explore UCSF Radiology details →",
        href: "projects/ucsf-radiology.html",
      },
    ],
    streamind: [
      {
        label: "Explore Streamind Health details →",
        href: "projects/streamind-health.html",
      },
      {
        label: "View GitHub code and assets ↗",
        href: "https://github.com/streamind-health/streamind-rppg-demo",
        external: true,
      },
    ],
    ctrl: [
      {
        label: "Explore CTRL Robotics details →",
        href: "projects/ctrl-robotics.html",
      },
    ],
  };
  function addLabeledText(el, label, text) {
    el.innerHTML = "";
    var strong = document.createElement("strong");
    strong.className = "experience-key";
    strong.textContent = label + ":";
    el.appendChild(strong);
    el.appendChild(document.createTextNode(" " + text));
  }
  function renderExperience(tab, focus) {
    var key = tab.dataset.exp,
      d = experiences[key];
    expTabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    $("#experience-panel").setAttribute("aria-labelledby", tab.id);
    $("#exp-dates").textContent = d.dates;
    $("#exp-role").textContent = d.role;
    $("#exp-org").textContent = d.org;
    $("#exp-problem").textContent = experienceProblems[key];
    addLabeledText($("#exp-summary"), "My role", d.summary);
    var ul = $("#exp-points");
    ul.innerHTML = "";
    d.points.forEach(function (p) {
      var li = document.createElement("li"),
        parts = p.split(": "),
        strong = document.createElement("strong");
      strong.textContent = parts.shift() + ":";
      li.appendChild(strong);
      li.appendChild(document.createTextNode(" " + parts.join(": ")));
      ul.appendChild(li);
    });
    var links = $("#exp-links");
    links.innerHTML = "";
    (experienceLinks[key] || []).forEach(function (item) {
      var a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      if (item.external) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      links.appendChild(a);
    });
    var image = $("#exp-image");
    image.src = d.image;
    image.alt = d.alt;
    $("#exp-caption").textContent = d.caption;
    if (focus) tab.focus();
  }
  function applyLensOrder(lensKey, selectFirst) {
    var tabs = $(".experience-tabs"),
      order = lenses[lensKey].order;
    order.forEach(function (key) {
      var tab = $('[data-exp="' + key + '"]');
      if (tab) tabs.appendChild(tab);
    });
    expTabs = $$("[data-exp]");
    if (selectFirst && expTabs.length) renderExperience(expTabs[0], false);
  }
  expTabs.forEach(function (t) {
    t.addEventListener("click", function () {
      renderExperience(t, false);
    });
  });
  $(".experience-tabs").addEventListener("keydown", function (e) {
    var i = expTabs.indexOf(document.activeElement),
      to = null;
    if (i < 0) return;
    if (e.key === "ArrowRight") to = (i + 1) % expTabs.length;
    if (e.key === "ArrowLeft") to = (i - 1 + expTabs.length) % expTabs.length;
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = expTabs.length - 1;
    if (to !== null) {
      e.preventDefault();
      renderExperience(expTabs[to], true);
    }
  });
  applyLensOrder("product", true);
  // Project-book identity and cover metadata
  var books = {
    streamind: {
      num: "Project 01",
      title: "Streamind Health",
      tag: "Software Engineer Intern · October 2025 – May 2026",
      blurb: "Facial video to pulse signal",
      pages: [
        {
          h: "Overview",
          t: "Streamind Health builds biofeedback for therapists and patients. I worked on extracting a pulse signal from facial video and moving the workflow from laptops toward iOS.",
          media: "assets/img/work/streamind-browser-and-mobile.jpg",
          alt: "Streamind browser biofeedback experience beside its mobile heart-rate monitor",
          cap: "Browser biofeedback beside the mobile heart-rate monitor",
          links: [
            {
              label: "GitHub repository ↗",
              href: "https://github.com/streamind-health/streamind-rppg-demo",
            },
          ],
        },
        {
          h: "What I built",
          t: "I tested forehead and cheek sampling regions, tracked RGB values over time, applied CHROM and frequency analysis, and built real-time camera capture and visualization for mobile.",
          media: "assets/img/work/streamind-facial-regions.jpg",
          alt: "Face with landmarks and forehead and cheek regions highlighted for pulse-signal sampling",
          cap: "Forehead and cheek regions used for signal extraction",
          links: [
            {
              label: "GitHub repository ↗",
              href: "https://github.com/streamind-health/streamind-rppg-demo",
            },
          ],
        },
        {
          h: "What I learned",
          t: "The team evaluated more than 20 phones and computers and reported readings within 5 BPM of an Apple Watch in testing. I learned how strongly lighting, motion, camera hardware, and sampling choices affect a seemingly simple signal.",
          media: "assets/img/work/streamind-rppg-frequency.jpg",
          alt: "Frequency analysis chart used to refine the heart-rate estimate",
          cap: "Frequency analysis used to refine the signal peak",
          links: [
            {
              label: "GitHub repository ↗",
              href: "https://github.com/streamind-health/streamind-rppg-demo",
            },
          ],
        },
      ],
    },
    jarvis: {
      num: "Project 02",
      title: "Jarvis",
      tag: "Cal Hacks 13.0 · Team project",
      blurb: "Live decisions, Meet to Slack",
      pages: [
        {
          h: "Overview",
          t: "Jarvis helps a teammate who cannot join a Google Meet still participate while decisions are being made. It connects a live meeting, a decision board, and Slack in one two-way workflow.",
          media: "assets/img/work/jarvis-google-meet.jpg",
          alt: "Google Meet call with Jarvis and a live decision board",
          cap: "Jarvis inside Google Meet with the live decision board",
          links: [
            {
              label: "View on Devpost ↗",
              href: "https://devpost.com/software/jarvis-ai-9gvid0",
            },
          ],
        },
        {
          h: "What we built",
          t: "Our team built an end-to-end flow that answers by voice, tracks decisions and open questions, relays messages between Slack and Meet, and proposes memory updates after the call. I focused on product, user testing, design, and the demo.",
          media: "assets/img/work/jarvis-slack-relay-desktop.jpg",
          alt: "Slack conversation relaying a teammate message into a live meeting",
          cap: "The two-way relay from Slack into Meet and back",
          links: [
            {
              label: "View on Devpost ↗",
              href: "https://devpost.com/software/jarvis-ai-9gvid0",
            },
          ],
        },
        {
          h: "Three weeks later",
          t: "Three weeks after our team presented Jarvis at Cal Hacks 13.0, Anthropic published the linked post. I saved it as a related industry signal, not as a claim of equivalence: Jarvis was a hackathon prototype connecting Meet, Slack, live decision tracking, and team memory, and the post is useful context for the direction teams were exploring.",
          media: "assets/img/work/jarvis-video-poster.jpg",
          alt: "Jarvis hackathon demo video poster",
          cap: "The Jarvis demo presented at Cal Hacks 13.0",
          links: [
            {
              label: "View Jarvis on Devpost ↗",
              href: "https://devpost.com/software/jarvis-ai-9gvid0",
            },
            {
              label: "Related: Anthropic’s post ↗",
              href: "https://x.com/claudeai/status/2120973994191094179?a=M587ykzi32x_aruLvpk&s=46",
            },
          ],
        },
      ],
    },
    acne: {
      num: "Project 03",
      title: "Acne project",
      tag: "Early project · Freshman year",
      blurb: "Where it started",
      pages: [
        {
          h: "Overview",
          t: "I compared Faster R-CNN and YOLOv8n on ACNE04, then tested whether a separate acne patch classifier trained on one dataset could hold up on DermNet images from another source.",
          media: "assets/img/illustrations/acne-crossdataset.svg",
          alt: "Lesion patches from ACNE04 flowing into a classifier that is tested on DermNet",
          cap: "Training on one image source and testing on another",
          links: [
            {
              label: "GitHub repository ↗",
              href: "https://github.com/vincyh07-dev/acne_detection",
            },
          ],
        },
        {
          h: "What I built",
          t: "I built the pipeline end to end: converted annotations, trained and evaluated two object detectors, created lesion and background patches, trained a ResNet-18 classifier, and analyzed cross-dataset performance.",
          media: "assets/img/illustrations/acne-crossdataset.svg",
          alt: "Cross-dataset acne detection and classification pipeline",
          cap: "Detection, patch extraction, classification, and external evaluation",
          links: [
            {
              label: "Read the updated README ↗",
              href: "https://github.com/vincyh07-dev/acne_detection#readme",
            },
          ],
        },
        {
          h: "Where it sits",
          t: "This is where I started. It’s less developed than my newer work, and it’s the foundation I grew from.",
          media: "assets/img/illustrations/acne-crossdataset.svg",
          alt: "Cross-dataset acne project illustration",
          cap: "An early project that shaped how I think about model evaluation",
          links: [
            {
              label: "GitHub repository ↗",
              href: "https://github.com/vincyh07-dev/acne_detection",
            },
          ],
        },
      ],
    },
  };
  // EDIT HERE: Final homepage project-book chapters and images
  books.streamind.pages = [
    {
      h: "Overview",
      t: "Camera-based biofeedback for remote therapist and patient sessions, moved from laptop toward iOS.",
      media: "assets/img/work/streamind-browser-and-mobile.jpg",
      alt: "Streamind browser and mobile experiences",
      cap: "Browser biofeedback beside the mobile monitor",
      links: [
        { label: "Read case study →", href: "projects/streamind-health.html" },
        {
          label: "GitHub ↗",
          href: "https://github.com/streamind-health/streamind-rppg-demo",
        },
      ],
    },
    {
      h: "Pain point",
      t: "Video calls hide physical cues. A camera-derived heart-rate signal gives therapists one more piece of context without separate hardware.",
      media: "assets/img/illustrations/streamind-frames.svg",
      alt: "Camera frames captured over time",
      cap: "Subtle pulse information is hidden inside ordinary video",
      links: [{ label: "Read case study →", href: "projects/streamind-health.html" }],
    },
    {
      h: "What I built",
      t: "iOS capture and visualization, facial-region sampling, RGB signal extraction, CHROM, filtering, and frequency analysis.",
      media: "assets/img/work/streamind-facial-regions.jpg",
      alt: "Forehead and cheek regions highlighted on a face",
      cap: "Forehead and cheek regions used for signal extraction",
      links: [
        {
          label: "GitHub repository ↗",
          href: "https://github.com/streamind-health/streamind-rppg-demo",
        },
      ],
    },
    {
      h: "What I learned",
      t: "Lighting, motion, camera hardware, and sampling regions can matter as much as the algorithm.",
      media: "assets/img/work/streamind-rppg-frequency.jpg",
      alt: "Frequency analysis used to refine a heart-rate estimate",
      cap: "Frequency analysis used to refine the signal peak",
      links: [{ label: "Read case study →", href: "projects/streamind-health.html" }],
    },
    {
      h: "What I gained",
      t: "Stronger product judgment at the boundary of user needs, mobile constraints, and noisy physiological data.",
      media: "assets/img/work/streamind-mobile-app.jpg",
      alt: "Streamind mobile heart-rate monitor",
      cap: "The mobile heart-rate monitor",
      links: [
        {
          label: "Open full case study →",
          href: "projects/streamind-health.html",
        },
      ],
    },
  ];
  books.streamind.pages.push({
    h: "Future direction",
    t: "Test across a wider range of skin tones, visible skin conditions such as acne, lighting, motion, and devices; improve signal quality and tell users when a reading is unreliable.",
    media: "assets/img/work/streamind-rppg-bandpass.jpg",
    alt: "Signal filtering visualization for the Streamind heart-rate pipeline",
    cap: "More representative testing can guide a more reliable signal",
    links: [
      {
        label: "Explore Streamind details →",
        href: "projects/streamind-health.html",
      },
    ],
  });
  books.jarvis.pages = [
    {
      h: "Overview",
      t: "Meetings lose momentum when people leave the call to search another tab, manually capture every decision, or repeatedly message an absent teammate. Jarvis acts as a live AI participant that answers aloud and keeps everyone connected.",
      media: "assets/img/work/jarvis-google-meet.jpg",
      alt: "Google Meet call with Jarvis and a live decision board",
      cap: "Jarvis participating in a live meeting",
      links: [
        {
          label: "View on Devpost ↗",
          href: "https://devpost.com/software/jarvis-ai-9gvid0",
        },
      ],
    },
    {
      h: "Live responses",
      t: "Ask Jarvis a question during the meeting and it responds aloud, so the group can get an answer without leaving the conversation or opening another tab.",
      media: "assets/img/work/jarvis-meet-hand-raised.jpg",
      alt: "Jarvis raising its hand inside a Google Meet call",
      cap: "A voice-based response that respects the meeting flow",
      links: [{ label: "Explore Jarvis details →", href: "projects/jarvis.html" }],
    },
    {
      h: "Live whiteboard",
      t: "Jarvis screen-shares a whiteboard that updates decisions, open questions, and next steps as the group talks, giving everyone a shared view of what is happening.",
      media: "assets/img/work/jarvis-google-meet.jpg",
      alt: "Jarvis live whiteboard updating during a Google Meet call",
      cap: "A shared, continuously updated meeting view",
      links: [
        {
          label: "Watch the demo ↗",
          href: "https://www.youtube.com/watch?v=nSr2VdiGU2E",
        },
      ],
    },
    {
      h: "Slack connection",
      t: "An absent teammate can request a recap or send a message through Slack. Jarvis brings it into the meeting and returns the group’s spoken reply, without one attendee becoming the messenger.",
      media: "assets/img/work/jarvis-slack-relay-desktop.jpg",
      alt: "Slack conversation relayed into a live meeting by Jarvis",
      cap: "Two-way participation between Slack and Meet",
      links: [
        {
          label: "View on Devpost ↗",
          href: "https://devpost.com/software/jarvis-ai-9gvid0",
        },
      ],
    },
    {
      h: "Future direction",
      t: "Connect Jarvis to Teams and other messaging apps, add screen-share awareness, and let the agent use the browser to complete approved tasks—not only browse for information.",
      media: "assets/img/work/jarvis-dashboard-memory.jpg",
      alt: "Jarvis dashboard showing team memory and proposed updates",
      cap: "From meeting assistant toward a connected, action-taking teammate",
      links: [{ label: "Explore Jarvis details →", href: "projects/jarvis.html" }],
    },
  ];
  books.acne.pages = [
    {
      h: "Overview",
      t: "A freshman-year computer-vision project exploring acne-region detection and cross-dataset reliability.",
      media: "assets/img/illustrations/acne-crossdataset.svg",
      alt: "Cross-dataset acne detection pipeline",
      cap: "Training on one source and testing on another",
      links: [
        { label: "Read case study →", href: "projects/acne-detection.html" },
        {
          label: "GitHub ↗",
          href: "https://github.com/vincyh07-dev/acne_detection",
        },
      ],
    },
    {
      h: "Pain point",
      t: "Manual marking does not scale, but an online detector is only useful if it finds lesions without overwhelming a reviewer with mistakes.",
      media: "assets/img/illustrations/acne-crossdataset.svg",
      alt: "Acne images flowing through a detection and classification pipeline",
      cap: "The reliability question behind the project",
      links: [{ label: "Read case study →", href: "projects/acne-detection.html" }],
    },
    {
      h: "What I built",
      t: "YOLOv8n and Faster R-CNN detectors, patch extraction, a ResNet-18 classifier, and DermNet evaluation.",
      media: "assets/img/illustrations/acne-crossdataset.svg",
      alt: "Detection, patch extraction, and external evaluation pipeline",
      cap: "An end-to-end computer-vision pipeline",
      links: [
        {
          label: "Updated GitHub README ↗",
          href: "https://github.com/vincyh07-dev/acne_detection#readme",
        },
      ],
    },
    {
      h: "What I learned",
      t: "Strong validation on one dataset can hide poor generalization to images collected somewhere else.",
      media: "assets/img/illustrations/acne-crossdataset.svg",
      alt: "ACNE04 training data evaluated against DermNet",
      cap: "The cross-dataset performance gap",
      links: [
        {
          label: "Read detailed results →",
          href: "projects/acne-detection.html",
        },
      ],
    },
    {
      h: "What I gained",
      t: "A foundation in model evaluation, error analysis, and communicating limitations instead of showing only the best score.",
      media: "assets/img/illustrations/acne-crossdataset.svg",
      alt: "Cross-dataset project illustration",
      cap: "The early project that shaped my evaluation mindset",
      links: [
        {
          label: "Open full case study →",
          href: "projects/acne-detection.html",
        },
      ],
    },
  ];
  books.acne.pages.push({
    h: "Future improvement",
    t: "Train and test with larger, more varied datasets across skin tones, acne types, lighting, image quality, and data sources to improve accuracy and generalization.",
    media: "assets/img/illustrations/acne-crossdataset.svg",
    alt: "Multiple image datasets flowing into an acne detection and evaluation pipeline",
    cap: "Broader data is the next step toward more reliable performance",
    links: [
      {
        label: "Explore the project details →",
        href: "projects/acne-detection.html",
      },
      {
        label: "GitHub repository ↗",
        href: "https://github.com/vincyh07-dev/acne_detection",
      },
    ],
  });
  // Project-book links to the full case-study pages
  var bookCaseLinks = {
    streamind: "projects/streamind-health.html",
    jarvis: "projects/jarvis.html",
    acne: "projects/acne-detection.html",
  };
  var currentBook = "streamind",
    currentPage = 0;
  function renderBook() {
    var b = books[currentBook],
      p = b.pages[currentPage];
    $("#book-number").textContent = b.num;
    $("#book-title").textContent = b.title;
    $("#book-tag").textContent = b.tag;
    $("#book-blurb").textContent = b.blurb;
    $("#page-label").textContent = "Page " + (currentPage + 1) + " of " + b.pages.length;
    $("#page-heading").textContent = p.h;
    $("#page-copy").textContent = p.t;
    var media = $("#page-media"),
      image = $("#page-image");
    if (p.media) {
      media.hidden = false;
      image.src = p.media;
      image.alt = p.alt || "";
      $("#page-caption").textContent = p.cap || "";
    } else {
      media.hidden = true;
      image.removeAttribute("src");
      image.alt = "";
      $("#page-caption").textContent = "";
    }
    var links = $("#page-links");
    links.innerHTML = "";
    (p.links || []).forEach(function (item) {
      var a = document.createElement("a");
      a.className = "page-link";
      a.href = item.href;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = item.label;
      links.appendChild(a);
    });
    var list = $("#chapter-list");
    list.innerHTML = "";
    b.pages.forEach(function (page, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = i + 1 + ". " + page.h;
      btn.setAttribute("aria-pressed", String(i === currentPage));
      btn.addEventListener("click", function () {
        currentPage = i;
        renderBook();
      });
      list.appendChild(btn);
    });
  }
  var renderBookBase = renderBook;
  renderBook = function () {
    renderBookBase();
    $("#book-case-link").href = bookCaseLinks[currentBook];
  };
  $$("[data-book]").forEach(function (button) {
    button.addEventListener("click", function () {
      currentBook = button.dataset.book;
      currentPage = 0;
      $$("[data-book]").forEach(function (b) {
        var on = b === button;
        b.classList.toggle("is-selected", on);
        b.setAttribute("aria-pressed", String(on));
        $(".book-state", b).textContent = on ? "Reading now" : "Open book";
      });
      renderBook();
    });
  });
  $("#previous-page").addEventListener("click", function () {
    var n = books[currentBook].pages.length;
    currentPage = (currentPage + n - 1) % n;
    renderBook();
  });
  $("#next-page").addEventListener("click", function () {
    currentPage = (currentPage + 1) % books[currentBook].pages.length;
    renderBook();
  });
  renderBook();
})();
