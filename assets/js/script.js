// =========================
// Utilities
// =========================
function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// =========================
// Flip wiring (Projects only — Hero wired separately)
// =========================
function wireFlip(container) {
  const flipInner = container.querySelector(".flip-inner, .flip-card-inner");
  if (!flipInner) return;

  // Always start on the front
  flipInner.classList.remove("flipped");

  // Skip hero; it uses its own single toggle button
  const isHero =
    container.id === "heroCard" || container.closest?.("#heroCard");
  if (isHero) return;

  // Projects: allow image, surface, or info icon to toggle
  const triggers = container.querySelectorAll(".infoBox, .project-img, .flip");
  triggers.forEach((el) => {
    if (el.__flipBound) return;
    el.__flipBound = true;

    el.addEventListener("click", (e) => {
      if (e.target.closest("a")) return; // ignore real links
      const flipped = flipInner.classList.toggle("flipped");
      container
        .querySelectorAll(".infoBox,.flipToggleBtn")
        .forEach((btn) =>
          btn.setAttribute("aria-pressed", flipped ? "true" : "false")
        );
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Grab common nodes
  // =========================
  const body = document.body;
  const main = document.getElementById("main");
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const menuBtn = document.getElementById("menuBtn");

  // =========================
  // Header: hide-on-up + active bg
  // =========================
  let lastY = window.scrollY;
  let scrollTimeout;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;

    if (y < lastY && y >= 100) {
      header.classList.add("scrollingUp");
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(
        () => header.classList.remove("scrollingUp"),
        3000
      );
    } else {
      header.classList.remove("scrollingUp");
    }

    if (y >= 100) header.classList.add("active");
    else header.classList.remove("active");

    lastY = y;
  });

  // =========================
  // Theme toggle
  // =========================
  const themeButton = document.createElement("button");
  const themeIndicator = document.createElement("span");
  themeButton.classList.add("themeBtn");
  themeIndicator.classList.add("themeIndicator");
  themeButton.appendChild(themeIndicator);

  if (window.innerWidth < 768) header.appendChild(themeButton);
  else main.appendChild(themeButton);

  body.classList.add("dark-theme");
  themeIndicator.classList.add("night");

  themeButton.addEventListener("click", () => {
    const dark = body.classList.contains("dark-theme");
    body.classList.toggle("dark-theme", !dark);
    body.classList.toggle("light-theme", dark);

    const night = themeIndicator.classList.contains("night");
    themeIndicator.classList.toggle("night", !night);
    themeIndicator.classList.toggle("day", night);

    localStorage.setItem("theme", dark ? "light-theme" : "dark-theme");
    localStorage.setItem("tod", night ? "day" : "night");
  });

  // =========================
  // Mobile menu (your original animations preserved)
  // =========================
  menuBtn.addEventListener("click", () => {
    const isOpened = menuBtn.classList.contains("opened");
    menuBtn.classList.toggle("opened", !isOpened);
    nav.classList.toggle("opened", !isOpened);
    menuBtn.setAttribute("aria-expanded", String(!isOpened));
  });

  // =========================
  // Nav & Social (JSON)
  // =========================
  fetch("/assets/data/navLinks.json")
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP error: ${r.status}`);
      return r.json();
    })
    .then((data) => {
      const navLinks = data?.Links?.[0]?.navLinks ?? [];
      const socialLinks = data?.Links?.[1]?.socialLinks ?? [];

      const navUl = document.getElementById("nav-ul");
      const heroSocialUl = document.getElementById("hero-social-ul");

      // nav
      navLinks.forEach((link) => {
        const li = document.createElement("li");
        li.className = "nav-li";

        const a = document.createElement("a");
        a.className = "nav-li-a";
        a.href = link.href;
        a.textContent = link.name;

        if (link.icon) {
          const icon = document.createElement("i");
          icon.className = link.icon;
          a.prepend(icon);
        }

        li.appendChild(a);
        navUl.appendChild(li);
      });

      // close menu on click
      navUl.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => {
          nav.classList.remove("opened");
          menuBtn.classList.remove("opened");
          menuBtn.setAttribute("aria-expanded", "false");
        });
      });

      // social
      socialLinks.forEach((link) => {
        const li = document.createElement("li");
        li.className = "social-li";

        const a = document.createElement("a");
        a.className = "social-li-a";
        a.href = link.href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";

        const icon = document.createElement("i");
        if (link.icon) icon.className = `${link.icon} social-icon`;

        const span = document.createElement("span");
        span.className = "social-text";
        span.textContent = link.name;

        a.append(icon, span);
        li.appendChild(a);
        heroSocialUl.appendChild(li);
      });
    })
    .catch((err) => console.error("Nav fetch error:", err));

  // =========================
  // Experiences
  // =========================
  fetch("/assets/data/experiences.json")
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP error: ${r.status}`);
      return r.json();
    })
    .then((data) => {
      const jobs = Array.isArray(data.jobs) ? data.jobs : [];
      if (!jobs.length) return;

      const tabsUl = document.getElementById("companyTabs");
      const panel = document.getElementById("jobPanel");

      jobs.forEach((job, idx) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "company-tab" + (idx === 0 ? " active" : "");
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", idx === 0 ? "true" : "false");
        btn.setAttribute("data-index", String(idx));
        btn.textContent =
          job.companyAlias || job.company || `Company ${idx + 1}`;
        btn.addEventListener("click", () => selectJob(idx));
        li.appendChild(btn);
        tabsUl.appendChild(li);
      });

      function renderJob(job) {
        const {
          title = "",
          company = "",
          location = "",
          duration = [],
          tasks = [],
        } = job;
        const d0 = duration?.[0] ?? {};
        const start = d0.startDate || "";
        const end = d0["stillEmployed?"] ? "Present" : d0.endDate || "";
        const period = [start, end].filter(Boolean).join(" – ");

        const taskObject = tasks?.[0] ?? {};
        const taskList = Object.values(taskObject).filter(Boolean);

        panel.innerHTML = `
          <header class="job-header">
            <h3 class="job-title">${escapeHTML(title)} <span class="at">@</span>
              <span class="company-name">${escapeHTML(company)}</span></h3>
            <p class="job-meta">
              ${
                location
                  ? `<span class="job-location">${escapeHTML(location)}</span>`
                  : ""
              }
              ${
                period
                  ? `${
                      location ? " · " : ""
                    }<time class="job-duration">${escapeHTML(period)}</time>`
                  : ""
              }
            </p>
          </header>
          <ul class="task-list">
            ${taskList
              .map((t) => `<li class="task-item">${escapeHTML(t)}</li>`)
              .join("")}
          </ul>
        `;
      }

      function selectJob(index) {
        document.querySelectorAll(".company-tab").forEach((b, i) => {
          const active = i === index;
          b.classList.toggle("active", active);
          b.setAttribute("aria-selected", active ? "true" : "false");
        });
        renderJob(jobs[index]);
      }

      selectJob(0);
    })
    .catch((err) => console.error("Experience fetch error:", err));

  // =========================
  // Projects (tabs + flip)
  // =========================
  fetch("/assets/data/projects.json")
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP error: ${r.status}`);
      return r.json();
    })
    .then((data) => {
      const projects = Array.isArray(data.projects) ? data.projects : [];
      if (!projects.length) return;

      const projectTabs = document.getElementById("projectTabs");
      const projectContainer = document.getElementById(
        "project-card-container"
      );
      if (!projectTabs || !projectContainer) return;

      const mq = window.matchMedia("(max-width: 767px)");
      let currentIndex = 0;

      const projectCardHTML = (p) => {
        const {
          name = "",
          description = "",
          image = "",
          liveLink = "",
          sourceCode = "",
          techStack = [],
        } = p;
        return `
          <section class="projectCard">
            <h3 class="project-title">${escapeHTML(name)}</h3>
            <article class="flip" aria-live="polite">
              <section class="flip-inner">
                <article class="flip-front">
                  <img src="${escapeHTML(image)}" alt="${escapeHTML(
          name
        )}" class="project-img" />
                </article>
                <article class="flip-back">
                  <section class="description-flex">
                    <p class="description">${escapeHTML(description)}</p>
                    <ul class="tech-list">
                      ${techStack
                        .map(
                          (t) => `<li class="tech-item">${escapeHTML(t)}</li>`
                        )
                        .join("")}
                    </ul>
                  </section>
                </article>
              </section>
            </article>
            <article class="links-flex">
              <button class="infoBox" type="button" aria-pressed="false" title="More info">
                <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
                <span class="sr-only">Toggle details</span>
              </button>
              <a href="${escapeHTML(
                sourceCode
              )}" class="githubLink" aria-label="Source code on GitHub" target="_blank" rel="noopener noreferrer">
                <i class="fa-brands fa-github" aria-hidden="true"></i>
              </a>
              <a href="${escapeHTML(
                liveLink
              )}" class="siteLink" aria-label="Open live site" target="_blank" rel="noopener noreferrer">
                <i class="fa-solid fa-square-arrow-up-right" aria-hidden="true"></i>
              </a>
            </article>
          </section>
        `;
      };

      // Build tabs
      projectTabs.innerHTML = "";
      projects.forEach((project, idx) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "project-tab" + (idx === 0 ? " active" : "");
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", idx === 0 ? "true" : "false");
        btn.setAttribute("data-index", String(idx));
        btn.textContent = project.name || `Project ${idx + 1}`;

        btn.addEventListener("click", () => {
          if (mq.matches) return; // stacked on mobile; no tab switch UX
          currentIndex = idx;
          selectProject(idx);
        });

        li.appendChild(btn);
        projectTabs.appendChild(li);
      });

      function selectProject(index) {
        projectTabs.querySelectorAll(".project-tab").forEach((b, i) => {
          const active = i === index;
          b.classList.toggle("active", active);
          b.setAttribute("aria-selected", active ? "true" : "false");
        });
        renderDesktop(projects[index]);
      }

      function renderDesktop(project) {
        projectContainer.innerHTML = projectCardHTML(project);
        wireFlip(projectContainer);
      }

      function renderMobileList() {
        projectContainer.innerHTML = projects.map(projectCardHTML).join("");
        projectContainer
          .querySelectorAll(".projectCard")
          .forEach((card) => wireFlip(card));
      }

      function applyMode() {
        const isMobile = mq.matches;
        projectTabs.classList.toggle("hidden", isMobile);
        if (isMobile) {
          renderMobileList();
        } else {
          projectTabs.querySelectorAll(".project-tab").forEach((b, i) => {
            const active = i === currentIndex;
            b.classList.toggle("active", active);
            b.setAttribute("aria-selected", active ? "true" : "false");
          });
          renderDesktop(projects[currentIndex]);
        }
      }

      mq.addEventListener("change", applyMode);
      applyMode();
    })
    .catch((err) => console.error("Project fetch error:", err));

  // =========================
  // Skills (render from /assets/data/skills.json)
  // =========================
  fetch("/assets/data/skills.json")
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP error: ${r.status}`);
      return r.json();
    })
    .then((data) => {
      const skillsContainer = document.getElementById("skillsContainer");
      const techBtn = document.getElementById("toggleTechnical");
      const softBtn = document.getElementById("toggleSoft");
      if (!skillsContainer || !techBtn || !softBtn) return;

      const techBlock = (data?.Skills || []).find((g) => g["Technical Skills"]);
      const softBlock = (data?.Skills || []).find((g) => g["Soft Skills"]);
      const technical = Array.isArray(techBlock?.["Technical Skills"])
        ? techBlock["Technical Skills"]
        : [];
      const soft = Array.isArray(softBlock?.["Soft Skills"])
        ? softBlock["Soft Skills"]
        : [];

      function normalizeTechnical(arr) {
        // [{ "Languages": [..] }, { "Database": [..] }, ...] -> [{category, items}]
        return arr.map((obj) => {
          const category = Object.keys(obj)[0] || "Other";
          const items = Array.isArray(obj[category]) ? obj[category] : [];
          return { category, items };
        });
      }

      const technicalGroups = normalizeTechnical(technical);

      function initials(name) {
        const s = (name || "")
          .replace(/[^A-Za-z0-9]/g, "")
          .slice(0, 2)
          .toUpperCase();
        return s || "?";
      }

      function skillCardHTML(item) {
        const name = item?.name || "";
        const logo = item?.logo || "";
        const visual = logo
          ? `<img src="${escapeHTML(logo)}" alt="${escapeHTML(
              name
            )} logo" class="skill-logo" />`
          : `<div class="skill-logo-fallback" aria-hidden="true">${escapeHTML(
              initials(name)
            )}</div>`;
        return `
          <figure class="skill-item">
            ${visual}
            <figcaption class="skill-name">${escapeHTML(name)}</figcaption>
          </figure>
        `;
      }

      function renderTechnical() {
        skillsContainer.innerHTML = technicalGroups
          .map(
            (g) => `
            <section class="skill-group">
              <h3 class="skill-group-title">${escapeHTML(g.category)}</h3>
              <div class="skill-list">
                ${g.items.map((it) => skillCardHTML(it)).join("")}
              </div>
            </section>
          `
          )
          .join("");
      }

      function renderSoft() {
        skillsContainer.innerHTML = `
          <section class="skill-group">
            <div class="soft-grid">
              ${soft.map((it) => skillCardHTML(it)).join("")}
            </div>
          </section>
        `;
      }

      function setActive(which) {
        const isTech = which === "tech";
        techBtn.classList.toggle("active", isTech);
        softBtn.classList.toggle("active", !isTech);
        if (isTech) renderTechnical();
        else renderSoft();
      }

      techBtn.addEventListener("click", () => setActive("tech"));
      softBtn.addEventListener("click", () => setActive("soft"));

      // initial
      setActive("tech");
    })
    .catch((err) => console.error("Skills fetch error:", err));

  // =========================
  // HERO <-> ABOUT (single toggle button inside #heroCard, bottom-right)
  // <1024px: About = back face
  // ≥1024px: About is a separate section (no button)
  // =========================
  (function heroAboutFlip() {
    if (window.__heroFlipWired__) return;
    window.__heroFlipWired__ = true;

    const expSection = document.getElementById("experience");
    const heroCard = document.getElementById("heroCard");
    const heroFlipInner = heroCard?.querySelector(".flip-card-inner");
    if (!main || !expSection || !heroCard || !heroFlipInner) return;

    // Default to FRONT
    heroFlipInner.classList.remove("flipped");

    // Build (or find) About section
    let aboutSection = document.getElementById("about");
    if (!aboutSection) {
      aboutSection = document.createElement("section");
      aboutSection.id = "about";
      aboutSection.innerHTML = `
        <article class="sectionContainer">
          <h2 class="sectionTitle">About Me</h2>
          <section class="subContainer aboutContainer">
            <article class="about-text">
              <p>
                I am a <strong>self-taught Full-Stack Developer</strong> with a strong foundation across frontend & backend.
                I build responsive interfaces with <strong>HTML, CSS, JS, React/Next.js</strong>, and backends with
                <strong>Node.js, Express, MongoDB</strong>.
              </p>
              <p>Always learning, shipping, and refining UI/UX and performance.</p>
            </article>
          </section>
        </article>
      `;
    }

    // Single shared toggle (inside #heroCard, outside inner)
    let toggleBtn = heroCard.querySelector(".flipToggleBtn");
    if (!toggleBtn) {
      toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "flipToggleBtn";
      toggleBtn.setAttribute("aria-pressed", "false");
      toggleBtn.innerHTML = `
        <i class="fa-solid fa-circle-info flipIcon" aria-hidden="true"></i>
        <span class="sr-only">Show About</span>
      `;
    }

    const bp = window.matchMedia("(max-width: 1023.98px)");

    function setHeroFlipped(flipped) {
      heroFlipInner.classList.toggle("flipped", flipped);
      toggleBtn.setAttribute("aria-pressed", flipped ? "true" : "false");
      const sr = toggleBtn.querySelector(".sr-only");
      if (sr) sr.textContent = flipped ? "Back to Intro" : "Show About";
    }

    function unmountAboutFromHero() {
      const backFace = heroFlipInner.querySelector(".flip-card-back.aboutBack");
      if (backFace) {
        setHeroFlipped(false);
        heroFlipInner.removeChild(backFace);
      }
      if (toggleBtn.isConnected) toggleBtn.remove();
    }

    function mountAboutAsBack() {
      aboutSection.className = "flip-card-back about aboutBack";
      if (
        aboutSection.parentNode &&
        aboutSection.parentNode !== heroFlipInner
      ) {
        aboutSection.parentNode.removeChild(aboutSection);
      }
      setHeroFlipped(false);
      heroFlipInner.appendChild(aboutSection);

      if (!toggleBtn.isConnected) heroCard.appendChild(toggleBtn);
      if (!toggleBtn.__heroBound) {
        toggleBtn.__heroBound = true;
        toggleBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          setHeroFlipped(!heroFlipInner.classList.contains("flipped"));
        });
      }
    }

    function mountAboutBeforeExperience() {
      unmountAboutFromHero();
      aboutSection.className = "about";
      main.insertBefore(aboutSection, expSection);
    }

    function applyHeroMode() {
      if (bp.matches) mountAboutAsBack();
      else mountAboutBeforeExperience();
    }

    bp.addEventListener("change", applyHeroMode);
    applyHeroMode();

    // If an About nav link exists: on mobile flip instead of scrolling
    const aboutNavLink = document.querySelector('a[href="#about"]');
    if (aboutNavLink) {
      aboutNavLink.addEventListener("click", (e) => {
        if (!bp.matches) return; // desktop: normal scroll
        e.preventDefault();
        setHeroFlipped(true);
        nav?.classList.remove("opened");
        menuBtn?.classList.remove("opened");
        menuBtn?.setAttribute("aria-expanded", "false");
      });
    }
  })();
});
