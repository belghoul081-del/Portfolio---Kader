/* ============================================================
   Portfolio interactions
   - smooth "explore" / "contact" scrolling
   - scroll-triggered reveal for the floating tech icons
   - category selection + project list + project detail routing
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 0. fixed header: hide on scroll down, show on scroll up ---------- */

  const header = document.querySelector(".top-bar");

  function setHeaderHeightVar() {
    if (header) {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight}px`,
      );
    }
  }
  setHeaderHeightVar();
  window.addEventListener("resize", setHeaderHeightVar);

  if (header) {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const SHOW_NEAR_TOP = 60; // always visible near the very top
    const DIRECTION_THRESHOLD = 6; // ignores tiny/jittery scroll deltas

    function onScroll() {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;

      if (currentY <= SHOW_NEAR_TOP) {
        header.classList.remove("header-hidden");
      } else if (delta > DIRECTION_THRESHOLD) {
        // scrolling down → hide
        header.classList.add("header-hidden");
      } else if (delta < -DIRECTION_THRESHOLD) {
        // scrolling up → reveal
        header.classList.remove("header-hidden");
      }

      lastScrollY = currentY;
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true },
    );
  }

  /* ---------- 1. scroll-to buttons (hero) ---------- */

  document.querySelectorAll("[data-scroll-to]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.scrollTo);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- 1b. hero choice buttons: icon entrance + shrink-to-icon selection ---------- */

  const choiceContainer = document.getElementById("choiceContainer");

  if (choiceContainer) {
    // icon entrance animation, once the hero has painted
    requestAnimationFrame(() => choiceContainer.classList.add("is-ready"));

    const choiceButtons = [...choiceContainer.querySelectorAll(".btn")];

    choiceButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        // only the clicked button changes — the other stays exactly as it was
        btn.classList.add("is-selected");

        const target = document.querySelector(btn.dataset.scrollTo);
        window.setTimeout(() => {
          if (target)
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 380); // let the shrink animation play first
      });
    });

    // coming back to the top of the page resets the choice
    const homeSection = document.getElementById("home");
    if (homeSection && "IntersectionObserver" in window) {
      const resetObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              choiceButtons.forEach((btn) =>
                btn.classList.remove("is-selected"),
              );
            }
          });
        },
        { threshold: 0.6 },
      );
      resetObserver.observe(homeSection);
    }
  }

  /* ---------- 2. explorer: reveal tech icons once in view, then let
     them roam randomly across the whole viewport ---------- */

  const explorerSection = document.getElementById("explorer");
  const techIcons = [...document.querySelectorAll(".tech-icon")];

  function startIconRoaming() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    techIcons.forEach((icon) => {
      icon.classList.add("is-visible");

      // respect reduced-motion: reveal the icons in place, skip the
      // continuous wandering
      if (reduceMotion) return;

      const wander = () => {
        // pick a fresh random spot anywhere in the current viewport,
        // each time this runs, so the icon roams the full page rather
        // than a fixed frame
        const w = icon.offsetWidth || 110;
        const h = icon.offsetHeight || 110;
        const margin = 12;
        const maxX = Math.max(0, window.innerWidth - w - margin * 2);
        const maxY = Math.max(0, window.innerHeight - h - margin * 2);
        const x = margin + Math.random() * maxX;
        const y = margin + Math.random() * maxY;

        // vary how long the glide to the next spot takes, so the icons
        // don't all drift in lockstep
        const duration = 5 + Math.random() * 6; // 5s – 11s
        icon.style.transitionDuration = `${duration}s`;
        icon.style.transform = `translate(${x}px, ${y}px)`;

        window.setTimeout(wander, duration * 1000);
      };

      // stagger each icon's first move so they don't all start together
      window.setTimeout(wander, Math.random() * 2500);
    });
  }

  if (explorerSection && techIcons.length) {
    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              explorerSection.classList.add("in-view");
              startIconRoaming();
              revealObserver.unobserve(explorerSection);
            }
          });
        },
        { threshold: 0.35 },
      );

      revealObserver.observe(explorerSection);
    } else {
      // fallback: browsers without IntersectionObserver just show the icons
      explorerSection.classList.add("in-view");
      startIconRoaming();
    }
  }

  /* ---------- 3. "Project" button jumps to the projects section ---------- */

  document.querySelectorAll('[data-nav="project"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById("projects");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- 3b. "Skills" button jumps to the skills section ---------- */

  document.querySelectorAll('[data-nav="skills"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById("skills");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- 3c. "Cyber S" button opens the cyber security modal ---------- */

  const cyberBtn = document.getElementById("cyberBtn");
  const cyberModal = document.getElementById("cyberModal");

  if (cyberBtn && cyberModal) {
    const cyberPanel = cyberModal.querySelector(".cyber-modal-panel");
    let lastFocused = null;

    function openCyberModal() {
      lastFocused = document.activeElement;
      cyberModal.hidden = false;
      cyberBtn.classList.add("is-open");
      cyberBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      const closeBtn = cyberModal.querySelector(".cyber-modal-close");
      if (closeBtn) closeBtn.focus();
    }

    function closeCyberModal() {
      cyberModal.hidden = true;
      cyberBtn.classList.remove("is-open");
      cyberBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    cyberBtn.addEventListener("click", openCyberModal);

    cyberModal.querySelectorAll("[data-cyber-close]").forEach((el) => {
      el.addEventListener("click", closeCyberModal);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !cyberModal.hidden) closeCyberModal();
    });

    // keep clicks inside the panel from bubbling to the backdrop
    if (cyberPanel) {
      cyberPanel.addEventListener("click", (e) => e.stopPropagation());
    }

    // simple focus trap: keep Tab cycling inside the panel while open
    cyberModal.addEventListener("keydown", (e) => {
      if (e.key !== "Tab" || cyberModal.hidden) return;
      const focusable = cyberModal.querySelectorAll(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- 4. projects data ---------- */

  const projectsData = {
    mobile: {
      label: "Mobile Applications",
      projects: [
        {
          id: "pizza-infinity",
          name: "Infinity Pizza App",
          icon: "assets/images/app/logo_owner_native_screen.png",
          overview: [
            "A comprehensive system with two apps designed specifically for local pizza restaurants.",
            "Includes a dedicated customer app and a dedicated owner control panel.",
            "The system is designed to streamline the entire ordering process.",
          ],
          features: [
            "Interactive maps and location tracking",
            "Instant chat and photo sharing",
            "Block annoying customers",
            "Closing and opening the store",
          ],
          stack: ["Flutter", "Firebase", "provider", "Cloudinary", "Render"],
          sourceUrl: "https://github.com/belghoul081-del/App_pizza", // TODO: replace with the real repository URL
          screens: [
            {
              label: "Home feed",
              src: "assets/images/app/pizza_infinity/homepage.webp",
            },
            {
              label: "Menu & cart",
              src: "assets/images/app/pizza_infinity/order.webp",
            },
            {
              label: "Owner panel",
              src: "assets/images/app/pizza_infinity/product.webp",
            },
            {
              label: "map",
              src: "assets/images/app/pizza_infinity/map.webp",
            },
            {
              label: "chat ",
              src: "assets/images/app/pizza_infinity/chat.webp",
            },
          ],
        },
      ],
    },
    web: {
      label: "Web Projects",
      projects: [],
    },
    other: {
      label: "Other Projects",
      projects: [],
    },
  };

  /* ---------- 5. panel view switching ---------- */

  const panelIntro = document.getElementById("panelIntro");
  const panelList = document.getElementById("panelList");
  const panelDetail = document.getElementById("panelDetail");
  const categoryColumn = document.getElementById("categoryColumn");
  const categoryButtons = categoryColumn
    ? [...categoryColumn.querySelectorAll(".category-btn")]
    : [];

  function showPanel(view) {
    [panelIntro, panelList, panelDetail].forEach(
      (v) => v && v.classList.remove("is-visible"),
    );
    if (view) view.classList.add("is-visible");
  }

  /* ---------- 6. render the project list for a category ---------- */

  function renderCategory(key) {
    const data = projectsData[key];
    if (!data) return;

    categoryButtons.forEach((b) =>
      b.classList.toggle("is-active", b.dataset.category === key),
    );
    if (categoryColumn) categoryColumn.classList.add("has-active");
    // leaving the detail view means the category column should no
    // longer be in the extra-collapsed "viewing a project" state
    if (categoryColumn) categoryColumn.classList.remove("is-detail");

    if (data.projects.length === 0) {
      panelList.innerHTML = `
                <h3 class="panel-category-title">${data.label}</h3>
                <div class="empty-state">
                    <strong>Nothing here yet.</strong>
                    More ${data.label.toLowerCase()} are on the way — check back soon.
                </div>
            `;
    } else {
      const cards = data.projects
        .map(
          (p) => `
                <button class="project-card" type="button" data-project-id="${p.id}" data-category="${key}">
                    <span class="project-card-icon">${
                      p.icon
                        ? `<img src="${p.icon}" alt="${p.name} icon">`
                        : `<!-- ICON: ${p.name} thumbnail -->`
                    }</span>
                    ${p.name}
                </button>
            `,
        )
        .join("");

      panelList.innerHTML = `
                <h3 class="panel-category-title">${data.label}</h3>
                <div class="project-list">${cards}</div>
            `;
    }

    showPanel(panelList);

    // wire up any project cards just rendered
    panelList.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("click", () => {
        renderDetail(card.dataset.category, card.dataset.projectId);
      });
    });
  }

  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => renderCategory(btn.dataset.category));
  });

  /* ---------- 7. render a single project's detail view ---------- */

  function renderDetail(categoryKey, projectId) {
    const data = projectsData[categoryKey];
    const project = data && data.projects.find((p) => p.id === projectId);
    if (!project) return;

    // once a project is open, the whole category rail collapses to
    // icons only (including the still-active category) to free up
    // room for the taller phone frame
    if (categoryColumn) categoryColumn.classList.add("is-detail");

    // a screen is either a real screenshot ({label, src}) or a
    // placeholder ({label}) waiting for an image to be dropped in
    function screenMarkup(screen) {
      return screen.src
        ? `<img src="${screen.src}" alt="${project.name} — ${screen.label}">`
        : `<!-- IMAGE: ${screen.label} -->[ ${screen.label} ]`;
    }

    const overviewHtml = project.overview
      .map((line) => `<p>${line}</p>`)
      .join("");
    const featuresHtml = project.features.map((f) => `<li>${f}</li>`).join("");
    const stackHtml = project.stack
      .map((s) => `<span class="tag">${s}</span>`)
      .join("");

    panelDetail.innerHTML = `
            <button class="detail-back" type="button">&larr; back to ${data.label}</button>
            <div class="detail-layout">
                <div class="detail-main">
                    <h3 class="detail-title">Project : <span class="detail-project-name">${project.name}</span></h3>

                    <div class="detail-block detail-overview">
                        <h4 class="detail-heading">Overview</h4>
                        ${overviewHtml}
                    </div>

                    <div class="detail-block">
                        <h4 class="detail-heading">Key Features</h4>
                        <ul class="detail-features">${featuresHtml}</ul>
                    </div>

                    <div class="detail-block">
                        <h4 class="detail-heading">Tech Stack</h4>
                        <div class="detail-stack">${stackHtml}</div>
                    </div>

                    <a class="source-btn" href="${project.sourceUrl}" target="_blank" rel="noopener">
                        <span class="icon-slot-git">
                        <img src="assets/images/element/github-dark.svg" alt="${"giticon"} — ${"s"}">
                        </span>
                        Source Code
                    </a>
                </div>

                <div class="detail-gallery">
                    <div class="gallery-frame">
                        <div class="gallery-viewport">
                            <div class="gallery-slot" id="gallerySlot">
                                ${screenMarkup(project.screens[0])}
                            </div>
                        </div>
                    </div>
                    <div class="gallery-nav">
                        <button class="gallery-arrow" type="button" id="galleryPrev" aria-label="Previous screenshot">&lsaquo;</button>
                        <span class="gallery-dots" id="galleryDots">1 / ${project.screens.length}</span>
                        <button class="gallery-arrow" type="button" id="galleryNext" aria-label="Next screenshot">&rsaquo;</button>
                    </div>
                </div>
            </div>
        `;

    showPanel(panelDetail);

    // gallery cycling
    let screenIndex = 0;
    const slot = panelDetail.querySelector("#gallerySlot");
    const dots = panelDetail.querySelector("#galleryDots");

    function updateScreen() {
      const screen = project.screens[screenIndex];
      slot.innerHTML = screenMarkup(screen);
      dots.textContent = `${screenIndex + 1} / ${project.screens.length}`;
    }

    panelDetail.querySelector("#galleryPrev").addEventListener("click", () => {
      screenIndex =
        (screenIndex - 1 + project.screens.length) % project.screens.length;
      updateScreen();
    });
    panelDetail.querySelector("#galleryNext").addEventListener("click", () => {
      screenIndex = (screenIndex + 1) % project.screens.length;
      updateScreen();
    });

    // back button returns to the category list
    panelDetail.querySelector(".detail-back").addEventListener("click", () => {
      renderCategory(categoryKey);
    });
  }
  /* ---------- 8. Skills section: animate progress bars on scroll ---------- */
  const skillsSection = document.querySelector(".skills-section");

  if (skillsSection && "IntersectionObserver" in window) {
    const skillsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            skillsSection.classList.add("in-view");
            skillsObserver.unobserve(skillsSection);
          }
        });
      },
      { threshold: 0.25 },
    );
    skillsObserver.observe(skillsSection);
  } else if (skillsSection) {
    // fallback: show bars immediately
    skillsSection.classList.add("in-view");
  }

  /* ---------- 9. footer: auto-fill the current year ---------- */

  const footerYear = document.getElementById("footerYear");
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
});