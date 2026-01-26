// script.js — full working file (typewriter + site interactions + auto-fit headline)

(() => {
  // -----------------------------
  // Helpers
  // -----------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // -----------------------------
  // ✅ Auto-fit: shrink/grow rotating headline so the whole title stays 1 line
  // -----------------------------
  function fitRotatingHeadline() {
    const strong = $("#rotatingHeadline");      // span for changing text
    const title = $(".hero-title");             // h1 container
    if (!strong || !title) return;

    // We resize the STRONG span, and ensure the WHOLE h1 fits in its column.
    const style = window.getComputedStyle(title);
    const paddingLeft = parseFloat(style.paddingLeft || "0");
    const paddingRight = parseFloat(style.paddingRight || "0");

    // Available width inside title element
    const available = title.clientWidth - paddingLeft - paddingRight;

    // Clamp font size range (tweak if you want)
    const MAX = 56; // starting size (matches CSS hero-title base)
    const MIN = 32; // smallest allowed before it looks too small

    // Start from max each time so it can grow back
    let size = MAX;
    strong.style.fontSize = size + "px";

    // Force layout calc
    const tooWide = () => title.scrollWidth > available;

    // Shrink until fits
    while (tooWide() && size > MIN) {
      size -= 1;
      strong.style.fontSize = size + "px";
    }

    // If there is space, gently try to grow back up (for shorter phrases)
    while (!tooWide() && size < MAX) {
      // try next size
      const next = size + 1;
      strong.style.fontSize = next + "px";
      if (tooWide()) {
        // revert
        strong.style.fontSize = size + "px";
        break;
      }
      size = next;
    }
  }

  // -----------------------------
  // Typewriter Headline (with fit)
  // -----------------------------
  function initTypewriter() {
    const el = $("#rotatingHeadline");
    const cursor = $("#typingCursor");
    if (!el) return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    // ✅ Your rotating headlines (typing + deleting)
    const headlines = [
      "Data Science & ML Engineering.",
      "Agentic AI & GenAI Systems.",
      "Automated Decision Analytics.",
      "Fraud Analytics and Risk Management."
    ].map(s => s.trim());

    // Reduced motion: show first line and stop
    if (prefersReduced) {
      el.textContent = headlines[0];
      if (cursor) cursor.style.display = "none";
      // ensure fit once
      fitRotatingHeadline();
      return;
    }

    let i = 0;          // which headline
    let j = 0;          // how many chars
    let deleting = false;
    let timer = null;

    const typeSpeed = 55;
    const deleteSpeed = 32;
    const pauseAfterType = 1050;
    const pauseAfterDelete = 220;

    function tick() {
      const full = headlines[i];

      if (!deleting) {
        j++;
        el.textContent = full.slice(0, j);

        // ✅ fit every tick while typing
        fitRotatingHeadline();

        if (j >= full.length) {
          deleting = true;
          timer = setTimeout(tick, pauseAfterType);
          return;
        }

        timer = setTimeout(tick, typeSpeed);
      } else {
        j--;
        el.textContent = full.slice(0, j);

        // ✅ fit every tick while deleting
        fitRotatingHeadline();

        if (j <= 0) {
          deleting = false;
          i = (i + 1) % headlines.length;
          timer = setTimeout(tick, pauseAfterDelete);
          return;
        }

        timer = setTimeout(tick, deleteSpeed);
      }
    }

    // Safety: fallback on error
    try {
      tick();
    } catch (e) {
      console.error("Typewriter error:", e);
      el.textContent = "Agentic AI & GenAI Analytics.";
      fitRotatingHeadline();
      if (cursor) cursor.style.display = "none";
      if (timer) clearTimeout(timer);
    }

    // ✅ Re-fit on resize (important)
    window.addEventListener("resize", () => {
      fitRotatingHeadline();
    }, { passive: true });
  }

  // -----------------------------
  // Mobile Nav Toggle
  // -----------------------------
  function initNav() {
    const toggle = $("#navToggle");
    const links = $("#navLinks");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close menu when clicking a link (mobile)
    $$(".nav-link", links).forEach(a => {
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!links.classList.contains("open")) return;
      const clickedInside = links.contains(e.target) || toggle.contains(e.target);
      if (!clickedInside) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // -----------------------------
  // Active Nav Link on Scroll
  // -----------------------------
  function initActiveNav() {
    const navLinks = $$(".nav-link");
    const sections = navLinks
      .map(a => $(a.getAttribute("href")))
      .filter(Boolean);

    if (!navLinks.length || !sections.length) return;

    function setActive() {
      const y = window.scrollY + 120;
      let currentId = sections[0].id;

      for (const sec of sections) {
        if (sec.offsetTop <= y) currentId = sec.id;
      }

      navLinks.forEach(a => {
        const href = a.getAttribute("href") || "";
        a.classList.toggle("active", href === `#${currentId}`);
      });
    }

    window.addEventListener("scroll", setActive, { passive: true });
    setActive();
  }

  // -----------------------------
  // Scroll Reveal Animation
  // -----------------------------
  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("in");
      });
    }, { threshold: 0.12 });

    items.forEach(el => io.observe(el));
  }

  // -----------------------------
  // Portfolio Filter
  // -----------------------------
  function initPortfolioFilter() {
    const pills = $$(".pill");
    const tiles = $$("#portfolioGrid .tile");

    if (!pills.length || !tiles.length) return;

    pills.forEach(btn => {
      btn.addEventListener("click", () => {
        pills.forEach(p => p.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter || "all";

        tiles.forEach(tile => {
          const type = tile.dataset.type || "";
          const show = filter === "all" || type === filter;
          tile.style.display = show ? "" : "none";
        });
      });
    });
  }

  // -----------------------------
  // Footer Year
  // -----------------------------
  function initYear() {
    const y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  // -----------------------------
  // Contact Form -> mailto
  // -----------------------------
  function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get("name") || "").toString().trim();
      const email = (fd.get("email") || "").toString().trim();
      const message = (fd.get("message") || "").toString().trim();

      const subject = encodeURIComponent(`Portfolio message from ${name || "Someone"}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`
      );

      window.location.href = `mailto:timothy.mandingwa@emory.edu?subject=${subject}&body=${body}`;
      form.reset();
    });
  }

  // -----------------------------
  // Boot
  // -----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initTypewriter();
    initNav();
    initActiveNav();
    initReveal();
    initPortfolioFilter();
    initYear();
    initContactForm();
  });
})();
