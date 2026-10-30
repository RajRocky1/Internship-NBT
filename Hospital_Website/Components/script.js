
/* =========================================================
   MEDICARE HOSPITAL
   Main JavaScript
   Features:
   - Mobile navigation
   - Active navigation highlighting
   - Light/dark theme toggle
   - Scroll reveal animations
   - Reading progress indicator
   - Sticky header effects
   - Department and doctor selection
   - Appointment form validation
   - Demo-only appointment confirmation
   - Back-to-top button
   - Reduced-motion accessibility
   - Hero background video and cursor movement
   ========================================================= */

(() => {
  "use strict";

  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  ready(() => {
    const $ = (selector, parent = document) =>
      parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
      Array.from(parent.querySelectorAll(selector));

    const root = document.documentElement;
    const body = document.body;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    /* ---------------------------------------------------------
       1. FOOTER YEAR
       --------------------------------------------------------- */

    const yearElement = $("#current-year");

    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }

    /* ---------------------------------------------------------
       2. MOBILE NAVIGATION
       --------------------------------------------------------- */

    const navToggle = $("#nav-toggle");
    const primaryNavigation = $("#primary-navigation");
    const siteHeader = $(".site-header");

    const closeNavigation = () => {
      if (!navToggle || !primaryNavigation) return;

      primaryNavigation.classList.remove("is-open");
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation menu");
      body.classList.remove("nav-open");
    };

    const openNavigation = () => {
      if (!navToggle || !primaryNavigation) return;

      primaryNavigation.classList.add("is-open");
      navToggle.classList.add("is-active");
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close navigation menu");
      body.classList.add("nav-open");
    };

    if (navToggle && primaryNavigation) {
      navToggle.addEventListener("click", () => {
        const isOpen =
          navToggle.getAttribute("aria-expanded") === "true";

        if (isOpen) {
          closeNavigation();
        } else {
          openNavigation();
        }
      });

      $$('a[href^="#"]', primaryNavigation).forEach((link) => {
        link.addEventListener("click", closeNavigation);
      });

      document.addEventListener("click", (event) => {
        if (
          primaryNavigation.classList.contains("is-open") &&
          siteHeader &&
          !siteHeader.contains(event.target)
        ) {
          closeNavigation();
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeNavigation();
        }
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
          closeNavigation();
        }
      });
    }

    /* ---------------------------------------------------------
       3. THEME TOGGLE
       --------------------------------------------------------- */

    const themeToggle = $("#theme-toggle");

    const getSavedTheme = () => {
      try {
        const savedTheme = localStorage.getItem("medicare-theme");

        if (savedTheme === "light" || savedTheme === "dark") {
          return savedTheme;
        }
      } catch (error) {
        // Storage may be disabled by the browser.
      }

      return "light";
    };

    const updateThemeButton = (theme) => {
      if (!themeToggle) return;

      const isDark = theme === "dark";

      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );

      themeToggle.setAttribute("aria-pressed", String(isDark));

      const icon = $("[data-theme-icon]", themeToggle);

      if (icon) {
        icon.textContent = isDark ? "☀" : "☾";
      }
    };

    const applyTheme = (theme, save = false) => {
      const validTheme = theme === "dark" ? "dark" : "light";

      root.setAttribute("data-theme", validTheme);
      updateThemeButton(validTheme);

      if (save) {
        try {
          localStorage.setItem("medicare-theme", validTheme);
        } catch (error) {
          // The theme still works when storage is unavailable.
        }
      }
    };

    applyTheme(getSavedTheme());

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const currentTheme = root.getAttribute("data-theme");
        const nextTheme = currentTheme === "dark" ? "light" : "dark";

        applyTheme(nextTheme, true);
      });
    }

    /* ---------------------------------------------------------
       4. STICKY HEADER AND SCROLL PROGRESS
       --------------------------------------------------------- */

    const progressBar = $("#reading-progress");
    const progressFill = progressBar
      ? $("span", progressBar)
      : null;

    const backToTop = $(".back-to-top");

    let scrollTicking = false;

    const updateScrollUI = () => {
      const scrollTop =
        window.scrollY || root.scrollTop || 0;

      const scrollableHeight =
        root.scrollHeight - window.innerHeight;

      const progress =
        scrollableHeight > 0
          ? Math.min(100, Math.max(0, (scrollTop / scrollableHeight) * 100))
          : 0;

      if (progressFill) {
        progressFill.style.width = `${progress}%`;
      }

      if (progressBar) {
        progressBar.setAttribute(
          "aria-valuenow",
          String(Math.round(progress))
        );
      }

      if (siteHeader) {
        siteHeader.classList.toggle("is-scrolled", scrollTop > 20);
      }

      if (backToTop) {
        backToTop.classList.toggle("is-visible", scrollTop > 450);
      }

      updateActiveNavigation();

      scrollTicking = false;
    };

    const requestScrollUpdate = () => {
      if (scrollTicking) return;

      scrollTicking = true;
      window.requestAnimationFrame(updateScrollUI);
    };

    window.addEventListener("scroll", requestScrollUpdate, {
      passive: true
    });

    window.addEventListener("resize", requestScrollUpdate);

    if (backToTop) {
      backToTop.addEventListener("click", (event) => {
        event.preventDefault();

        window.scrollTo({
          top: 0,
          behavior: reducedMotion.matches ? "auto" : "smooth"
        });
      });
    }

    /* ---------------------------------------------------------
       5. ACTIVE NAVIGATION
       --------------------------------------------------------- */

    const navLinks = $$(".primary-nav a[href^='#']");

    const getLinkedSections = () => {
      return navLinks
        .map((link) => {
          const href = link.getAttribute("href");

          if (!href || href === "#") return null;

          const id = href.slice(1);
          const section = document.getElementById(id);

          if (!section) return null;

          return { link, section, id };
        })
        .filter(Boolean);
    };

    const linkedSections = getLinkedSections();

    const setActiveNavigation = (activeLink) => {
      navLinks.forEach((link) => {
        const isActive = link === activeLink;

        link.classList.toggle("active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    function updateActiveNavigation() {
      if (linkedSections.length === 0) return;

      const scrollPosition =
        (window.scrollY || root.scrollTop || 0) + 150;

      let currentEntry = linkedSections[0];

      /*
       * Keep the last relevant navigation item active while
       * scrolling through sections without navigation links.
       */
      for (const entry of linkedSections) {
        const sectionTop =
          entry.section.getBoundingClientRect().top +
          (window.scrollY || root.scrollTop || 0);

        if (sectionTop <= scrollPosition) {
          currentEntry = entry;
        } else {
          break;
        }
      }

      if (
        window.innerHeight + window.scrollY >=
        root.scrollHeight - 5
      ) {
        const lastEntry = linkedSections[linkedSections.length - 1];

        if (lastEntry) {
          currentEntry = lastEntry;
        }
      }

      if (currentEntry) {
        setActiveNavigation(currentEntry.link);
      }
    }

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const href = link.getAttribute("href");

        if (href && href.startsWith("#")) {
          const target = document.getElementById(href.slice(1));

          if (target) {
            setActiveNavigation(link);
          }
        }
      });
    });

    /* ---------------------------------------------------------
       6. SCROLL REVEAL ANIMATIONS
       --------------------------------------------------------- */

    const revealElements = $$(".reveal");

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      revealElements.forEach((element) => {
        element.classList.add("is-visible");
      });
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -35px 0px"
        }
      );

      revealElements.forEach((element) => {
        revealObserver.observe(element);
      });

      window.setTimeout(() => {
        revealElements.forEach((element) => {
          const rect = element.getBoundingClientRect();

          if (rect.top < window.innerHeight + 100) {
            element.classList.add("is-visible");
          }
        });
      }, 1200);
    }

    /* ---------------------------------------------------------
       7. DEPARTMENT AND DOCTOR DATA
       --------------------------------------------------------- */

    const doctorsByDepartment = {
      cardiology: ["Dr. Meera Anand"],
      orthopedics: ["Dr. Arjun Mehta"],
      neurology: ["Dr. Rohan Kapoor"],
      pediatrics: ["Dr. Elena Park"],
      general: ["Dr. Sara Thomas"]
    };

    const appointmentForm = $("#appointment-form");

    const departmentSelect = appointmentForm
      ? $('select[name="department"]', appointmentForm)
      : null;

    const doctorSelect = appointmentForm
      ? $('select[name="doctor"]', appointmentForm)
      : null;

    const doctorPlaceholder = "Select a doctor";

    const populateDoctors = (department, preferredDoctor = "") => {
      if (!doctorSelect) return;

      const doctors = doctorsByDepartment[department] || [];

      doctorSelect.replaceChildren();

      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = doctorPlaceholder;

      doctorSelect.appendChild(placeholderOption);

      doctors.forEach((doctorName) => {
        const option = document.createElement("option");

        option.value = doctorName;
        option.textContent = doctorName;

        doctorSelect.appendChild(option);
      });

      if (preferredDoctor && doctors.includes(preferredDoctor)) {
        doctorSelect.value = preferredDoctor;
      } else {
        doctorSelect.value = "";
      }

      doctorSelect.disabled = doctors.length === 0;
    };

    if (departmentSelect && doctorSelect) {
      populateDoctors(departmentSelect.value);

      departmentSelect.addEventListener("change", () => {
        populateDoctors(departmentSelect.value);
        clearFieldError("doctor");
      });

      doctorSelect.addEventListener("change", () => {
        clearFieldError("doctor");
      });
    }

    const setDepartmentAndDoctor = (department, doctor = "") => {
      if (!departmentSelect || !doctorSelect) return;

      const hasDepartment = Array.from(departmentSelect.options).some(
        (option) => option.value === department
      );

      if (!hasDepartment) return;

      departmentSelect.value = department;
      populateDoctors(department, doctor);

      clearFieldError("department");
      clearFieldError("doctor");
    };

    /* ---------------------------------------------------------
       8. DEPARTMENT SHORTCUTS
       --------------------------------------------------------- */

    $$(".dept-link").forEach((link) => {
      link.addEventListener("click", (event) => {
        const department = link.dataset.department;

        if (!department) return;

        event.preventDefault();

        setDepartmentAndDoctor(department);

        const appointmentSection =
          $("#appointment") || appointmentForm;

        if (appointmentSection) {
          appointmentSection.scrollIntoView({
            behavior: reducedMotion.matches ? "auto" : "smooth",
            block: "start"
          });

          window.setTimeout(() => {
            if (departmentSelect) {
              departmentSelect.focus({ preventScroll: true });
            }
          }, reducedMotion.matches ? 0 : 450);
        }
      });
    });

    /* ---------------------------------------------------------
       9. BOOK-DOCTOR SHORTCUTS
       --------------------------------------------------------- */

    $$(".book-doctor").forEach((button) => {
      button.addEventListener("click", (event) => {
        const department = button.dataset.department;
        const doctor = button.dataset.doctor || "";

        if (!department) return;

        event.preventDefault();

        setDepartmentAndDoctor(department, doctor);

        const appointmentSection =
          $("#appointment") || appointmentForm;

        if (appointmentSection) {
          appointmentSection.scrollIntoView({
            behavior: reducedMotion.matches ? "auto" : "smooth",
            block: "start"
          });

          window.setTimeout(() => {
            if (appointmentForm) {
              const firstField = $(
                'input[name="fullname"]',
                appointmentForm
              );

              if (firstField) {
                firstField.focus({ preventScroll: true });
              }
            }
          }, reducedMotion.matches ? 0 : 450);
        }
      });
    });

    /* ---------------------------------------------------------
       10. APPOINTMENT DATE MINIMUM
       --------------------------------------------------------- */

    const appointmentDate = appointmentForm
      ? $('input[name="date"]', appointmentForm)
      : null;

    const getLocalDateString = (date = new Date()) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    if (appointmentDate) {
      appointmentDate.min = getLocalDateString();

      appointmentDate.addEventListener("change", () => {
        clearFieldError("date");
      });
    }

    /* ---------------------------------------------------------
       11. APPOINTMENT FORM VALIDATION
       --------------------------------------------------------- */

    const formStatus = appointmentForm
      ? $(".form-status", appointmentForm)
      : null;

    const requestSummary = $("#request-summary");

    const validationRules = {
      fullname: {
        errorId: "error-fullname",
        message: "Please enter your full name."
      },
      phone: {
        errorId: "error-phone",
        message: "Please enter a valid phone number."
      },
      email: {
        errorId: "error-email",
        message: "Please enter a valid email address."
      },
      department: {
        errorId: "error-department",
        message: "Please select a department."
      },
      doctor: {
        errorId: "error-doctor",
        message: "Please select a doctor."
      },
      date: {
        errorId: "error-date",
        message: "Please choose today or a future date."
      },
      time: {
        errorId: "error-time",
        message: "Please select a preferred time."
      },
      consent: {
        errorId: "error-consent",
        message: "Please confirm your consent before continuing."
      }
    };

    const getFormField = (name) => {
      if (!appointmentForm) return null;

      return appointmentForm.elements.namedItem(name);
    };

    function clearFieldError(fieldName) {
      if (!appointmentForm) return;

      const field = getFormField(fieldName);
      const rule = validationRules[fieldName];

      if (field && "setAttribute" in field) {
        field.removeAttribute("aria-invalid");
      }

      if (rule) {
        const errorElement = document.getElementById(rule.errorId);

        if (errorElement) {
          errorElement.textContent = "";
          errorElement.classList.remove("is-visible");
        }
      }

      if (formStatus) {
        formStatus.classList.remove("is-visible", "is-error");
        formStatus.textContent = "";
      }
    }

    const showFieldError = (fieldName, message) => {
      if (!appointmentForm) return;

      const field = getFormField(fieldName);
      const rule = validationRules[fieldName];

      if (field && "setAttribute" in field) {
        field.setAttribute("aria-invalid", "true");
      }

      if (rule) {
        const errorElement = document.getElementById(rule.errorId);

        if (errorElement) {
          errorElement.textContent = message;
          errorElement.classList.add("is-visible");
        }
      }
    };

    const validateAppointmentForm = () => {
      if (!appointmentForm) return false;

      let isValid = true;
      let firstInvalidField = null;

      Object.keys(validationRules).forEach((fieldName) => {
        clearFieldError(fieldName);
      });

      const fullname = getFormField("fullname");
      const phone = getFormField("phone");
      const email = getFormField("email");
      const department = getFormField("department");
      const doctor = getFormField("doctor");
      const date = getFormField("date");
      const time = getFormField("time");
      const consent = getFormField("consent");

      const fullNameValue = fullname ? fullname.value.trim() : "";
      const phoneValue = phone ? phone.value.trim() : "";
      const emailValue = email ? email.value.trim() : "";
      const departmentValue = department ? department.value : "";
      const doctorValue = doctor ? doctor.value : "";
      const dateValue = date ? date.value : "";
      const timeValue = time ? time.value : "";
      const consentChecked = consent ? consent.checked : false;

      const phoneDigits = phoneValue.replace(/\D/g, "");
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      const checks = [
        {
          field: "fullname",
          valid: fullNameValue.length >= 2,
          message: "Please enter your name (at least 2 characters)."
        },
        {
          field: "phone",
          valid: phoneDigits.length >= 7 && phoneDigits.length <= 15,
          message: "Enter a valid phone number with 7–15 digits."
        },
        {
          field: "email",
          valid: emailPattern.test(emailValue),
          message: "Please enter a valid email address."
        },
        {
          field: "department",
          valid: Boolean(departmentValue),
          message: "Please select a department."
        },
        {
          field: "doctor",
          valid:
            Boolean(doctorValue) &&
            Boolean(departmentValue) &&
            (doctorsByDepartment[departmentValue] || []).includes(
              doctorValue
            ),
          message: "Please select a doctor from the chosen department."
        },
        {
          field: "date",
          valid:
            Boolean(dateValue) &&
            dateValue >= getLocalDateString(),
          message: "Please choose today or a future date."
        },
        {
          field: "time",
          valid: Boolean(timeValue),
          message: "Please select a preferred time."
        },
        {
          field: "consent",
          valid: consentChecked,
          message: "Please confirm your consent before continuing."
        }
      ];

      checks.forEach((check) => {
        if (!check.valid) {
          isValid = false;
          showFieldError(check.field, check.message);

          if (!firstInvalidField) {
            firstInvalidField = getFormField(check.field);
          }
        }
      });

      if (
        firstInvalidField &&
        typeof firstInvalidField.focus === "function"
      ) {
        firstInvalidField.focus({ preventScroll: true });

        firstInvalidField.scrollIntoView({
          behavior: reducedMotion.matches ? "auto" : "smooth",
          block: "center"
        });
      }

      return isValid;
    };

    if (appointmentForm) {
      Object.keys(validationRules).forEach((fieldName) => {
        const field = getFormField(fieldName);

        if (!field || !("addEventListener" in field)) return;

        const eventName =
          fieldName === "consent" ||
          fieldName === "department" ||
          fieldName === "doctor" ||
          fieldName === "time"
            ? "change"
            : "input";

        field.addEventListener(eventName, () => {
          clearFieldError(fieldName);
        });
      });

      appointmentForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!validateAppointmentForm()) {
          if (formStatus) {
            formStatus.textContent =
              "Please review the highlighted fields and try again.";
            formStatus.classList.add("is-visible", "is-error");
          }

          return;
        }

        const fullname = getFormField("fullname").value.trim();
        const department = getFormField("department").value;
        const doctor = getFormField("doctor").value;
        const date = getFormField("date").value;
        const time = getFormField("time").value;

        const formattedDate = new Date(
          `${date}T12:00:00`
        ).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        /*
         * DEMO ONLY:
         * This form does not contact a hospital, store data, or
         * send an appointment request to a server.
         */

        if (requestSummary) {
          requestSummary.textContent =
            `${fullname}, your demo form is valid. ` +
            `Selected department: ${department}. ` +
            `Selected doctor: ${doctor}. ` +
            `Preferred date: ${formattedDate} at ${time}.`;
        }

        if (formStatus) {
          formStatus.textContent =
            "Demo confirmation only: your details have not been sent " +
            "to a hospital. Connect a secure backend before using this " +
            "form for real appointments.";

          formStatus.classList.remove("is-error");
          formStatus.classList.add("is-visible");
        }

        if (requestSummary) {
          requestSummary.scrollIntoView({
            behavior: reducedMotion.matches ? "auto" : "smooth",
            block: "nearest"
          });
        }
      });
    }

    /* ---------------------------------------------------------
       12. OPTIONAL TILT EFFECT
       --------------------------------------------------------- */

    if (
      !reducedMotion.matches &&
      window.matchMedia("(hover: hover)").matches
    ) {
      $$(".tilt-card").forEach((card) => {
        card.addEventListener("pointermove", (event) => {
          const rect = card.getBoundingClientRect();

          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;

          const rotateY = (x - 0.5) * 5;
          const rotateX = (0.5 - y) * 5;

          card.style.transform =
            `perspective(900px) rotateX(${rotateX}deg) ` +
            `rotateY(${rotateY}deg)`;
        });

        card.addEventListener("pointerleave", () => {
          card.style.transform = "";
        });
      });
    }

    /* ---------------------------------------------------------
       13. HERO VIDEO AND CURSOR MOVEMENT
       --------------------------------------------------------- */

    const heroVideoSection = $(".hero-video");
    const heroBackgroundVideo = $("#hero-background-video");

    if (heroVideoSection && heroBackgroundVideo) {
      const desktopPointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      );

      /*
       * The background video follows cursor movement slightly,
       * creating a subtle parallax/depth effect.
       * Disabled for touch devices and reduced-motion settings.
       */
      if (!reducedMotion.matches && desktopPointer.matches) {
        heroVideoSection.addEventListener("pointermove", (event) => {
          const bounds = heroVideoSection.getBoundingClientRect();

          if (!bounds.width || !bounds.height) return;

          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;

          heroVideoSection.style.setProperty(
            "--cursor-x",
            `${x * -12}px`
          );

          heroVideoSection.style.setProperty(
            "--cursor-y",
            `${y * -9}px`
          );
        });

        heroVideoSection.addEventListener("pointerleave", () => {
          heroVideoSection.style.setProperty("--cursor-x", "0px");
          heroVideoSection.style.setProperty("--cursor-y", "0px");
        });
      }

      /* Muted autoplay works in most browsers; handle blocked playback. */
      heroBackgroundVideo.muted = true;
      heroBackgroundVideo.playsInline = true;

      const playbackAttempt = heroBackgroundVideo.play();

      if (
        playbackAttempt &&
        typeof playbackAttempt.catch === "function"
      ) {
        playbackAttempt.catch(() => {
          // Browser autoplay settings may prevent playback.
        });
      }
    }

    /* ---------------------------------------------------------
       14. INITIAL UI STATE
       --------------------------------------------------------- */

    updateScrollUI();

    if (revealElements.length === 0) {
      root.classList.remove("js");
    }
  });
})();
