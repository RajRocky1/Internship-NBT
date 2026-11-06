document.addEventListener("DOMContentLoaded", () => {
  // --- Theme Toggle Logic ---
  const themeToggleBtn = document.getElementById("theme-toggle");
  const htmlElement = document.documentElement;

  themeToggleBtn.addEventListener("click", () => {
    // Check current theme
    const currentTheme = htmlElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    // Apply new theme
    htmlElement.setAttribute("data-theme", newTheme);

    // Save to localStorage
    localStorage.setItem("theme", newTheme);
  });

  // --- Set Year ---
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Reveal on scroll ---
  const revealEls = document.querySelectorAll(".case-study, .skill-row, .reflection");
  if ("IntersectionObserver" in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach((el) => revealObs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  // --- Scroll-spy & Progress fill for timeline ---
  const railItems = Array.from(document.querySelectorAll(".rail-item"));
  const caseStudies = Array.from(document.querySelectorAll(".case-study"));
  const railFill = document.querySelector(".rail-fill");
  const railList = document.querySelector(".rail-list");

  if (railItems.length && caseStudies.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = "#" + entry.target.id;
          railItems.forEach((item) => {
            item.classList.toggle("active", item.getAttribute("href") === id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

    caseStudies.forEach((cs) => spy.observe(cs));
  }

  // --- Progress fill update ---
  const updateFill = () => {
    if (!railFill || !railList || !caseStudies.length) return;

    const first = caseStudies[0].getBoundingClientRect();
    const last = caseStudies[caseStudies.length - 1].getBoundingClientRect();
    const total = last.bottom - first.top;

    if (total <= 0) return;

    const viewportMid = window.innerHeight / 2;
    let progress = (viewportMid - first.top) / total;
    progress = Math.max(0, Math.min(1, progress));

    const trackHeight = railList.clientHeight - 48;
    railFill.style.height = Math.round(progress * trackHeight) + "px";
  };

  window.addEventListener("scroll", updateFill, { passive: true });
  window.addEventListener("resize", updateFill);
  updateFill();

  /* ============================================================
     ✨ EXTRA ANIMATION HELPERS — additive only
     ============================================================ */

  // --- 1. Stagger reveal delays for skill rows ---
  const skillRows = document.querySelectorAll(".skill-row");
  skillRows.forEach((row, i) => {
    row.style.transitionDelay = `${i * 60}ms`;
    // clear delay after first reveal so hover isn't affected
    row.addEventListener("transitionend", function clearDelay() {
      row.style.transitionDelay = "0ms";
      row.removeEventListener("transitionend", clearDelay);
    }, { once: true });
  });

  // --- 2. Stagger case studies ---
  const caseEls = document.querySelectorAll(".case-study");
  caseEls.forEach((el, i) => {
    el.style.transitionDelay = `${i * 80}ms`;
    el.addEventListener("transitionend", function clearDelay() {
      el.style.transitionDelay = "0ms";
      el.removeEventListener("transitionend", clearDelay);
    }, { once: true });
  });

  // --- 3. Magnetic tilt on stat cards ---
  const statCards = document.querySelectorAll(".stat");
  statCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        `translateY(-6px) rotate(-.6deg) scale(1.015) perspective(700px) rotateX(${y * -6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  // --- 4. Ripple effect on primary buttons & case links ---
  const rippleTargets = document.querySelectorAll(".btn, .case-link, .theme-toggle");
  rippleTargets.forEach((btn) => {
    btn.style.position = btn.style.position || "relative";
    btn.style.overflow = "hidden";
    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        left:${e.clientX - rect.left - size / 2}px;
        top:${e.clientY - rect.top - size / 2}px;
        border-radius:50%;
        background:rgba(255,255,255,.35);
        transform:scale(0);
        pointer-events:none;
        animation:rippleAnim .7s ease-out forwards;
        z-index:5;
      `;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  });

  // inject ripple keyframes once
  if (!document.getElementById("ripple-keyframes")) {
    const styleTag = document.createElement("style");
    styleTag.id = "ripple-keyframes";
    styleTag.textContent = `@keyframes rippleAnim {
      to { transform: scale(2.5); opacity: 0; }
    }`;
    document.head.appendChild(styleTag);
  }

  // --- 5. Cursor-following glow on case-study cards ---
  caseEls.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // inject cursor-glow style for cards
  if (!document.getElementById("cursor-glow-style")) {
    const styleTag = document.createElement("style");
    styleTag.id = "cursor-glow-style";
    styleTag.textContent = `
      .case-study::after {
        content:"";
        position:absolute;
        inset:0;
        border-radius:20px;
        background: radial-gradient(220px circle at var(--mx,50%) var(--my,50%),
                    rgba(124,58,237,.10), transparent 60%);
        opacity:0;
        transition:opacity .35s ease;
        pointer-events:none;
      }
      .case-study:hover::after { opacity:1; }
    `;
    document.head.appendChild(styleTag);
  }

  // --- 6. Parallax drift for hero blob art ---
  const logoArt = document.querySelector(".logo-art");
  if (logoArt) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < 700) {
            logoArt.style.transform = `translateY(${y * 0.06}px) rotate(${y * 0.004}deg)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // --- 7. Active section sync for the rail (fallback polish) ---
  // already handled by existing IntersectionObserver — this just smooth-scrolls rail clicks
  document.querySelectorAll(".rail-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      const target = document.querySelector(item.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

});