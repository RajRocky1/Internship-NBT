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
});