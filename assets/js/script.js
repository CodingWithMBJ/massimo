window.addEventListener("load", () => {
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("nav");
  const themeBtn = document.getElementById("themeBtn");
  const themeIndicator = document.getElementById("themeIndicator");
  const header = document.getElementById("header");
  const navUl = document.getElementById("nav-ul");

  /* ---------- Header on scroll ---------- */
  window.addEventListener("scroll", () => {
    if (window.scrollY > 70) {
      header.classList.add("active");
    } else {
      header.classList.remove("active");
    }
  });

  /* ---------- Menu toggle ---------- */
  let isOpen = false;
  const openMenu = () => {
    menuBtn.classList.add("opened");
    nav.classList.add("opened");
    menuBtn.setAttribute("aria-expanded", "true");
    isOpen = true;
  };
  const closeMenu = () => {
    menuBtn.classList.remove("opened");
    nav.classList.remove("opened");
    menuBtn.setAttribute("aria-expanded", "false");
    isOpen = false;
  };
  menuBtn.addEventListener("click", () => (isOpen ? closeMenu() : openMenu()));

  /* ---------- Theme (with persistence) ---------- */
  const applyTheme = (mode) => {
    const isDark = mode === "dark";
    document.body.classList.toggle("dark-theme", isDark);
    document.body.classList.toggle("light-theme", !isDark);
    themeBtn.classList.toggle("altered", !isDark);
    themeIndicator.classList.toggle("altered", !isDark);
    themeBtn.setAttribute("aria-pressed", String(!isDark));
    localStorage.setItem("theme", mode);
  };

  // Initialize theme: localStorage -> prefers-color-scheme -> default dark
  (() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      applyTheme("light");
    } else {
      applyTheme("dark");
    }
  })();

  themeBtn.addEventListener("click", () => {
    const next = document.body.classList.contains("dark-theme")
      ? "light"
      : "dark";
    applyTheme(next);
  });

  /* ---------- Build nav from JSON ---------- */
  async function loadNavList() {
    try {
      const res = await fetch("/assets/data/navLinks.json", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data.navLinks) ? data.navLinks : [];

      renderNavList(items);
    } catch (err) {
      console.error("Error loading navLinks:", err);
    }
  }

  function renderNavList(items) {
    if (!navUl) return;
    navUl.innerHTML = "";

    items.forEach(({ name, href, icon }) => {
      const li = document.createElement("li");
      li.className = "nav-li";

      const a = document.createElement("a");
      a.className = "nav-li-a";
      a.href = href || "#";
      a.setAttribute("role", "link");

      const span = document.createElement("span");
      span.className = "nav-text";

      if (icon) {
        const i = document.createElement("i");
        i.className = `${icon} nav-icon`; // e.g., "fa-solid fa-code"
        i.setAttribute("aria-hidden", "true");
        a.appendChild(span);
        a.appendChild(i);
        // spacing between icon and text
        // a.appendChild(document.createTextNode(" "));
      }
      a.appendChild(span);
      span.appendChild(document.createTextNode(name || "Link"));
      li.appendChild(a);
      navUl.appendChild(li);
    });

    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".nav-li-a");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("id");
          const navLink = document.querySelector(`.nav-li-a[href="#${id}"]`);

          if (entry.isIntersecting) {
            // Remove current from all
            navLinks.forEach((link) => link.classList.remove("current"));
            // Add to the active one
            if (navLink) navLink.classList.add("current");
          }
        });
      },
      {
        root: null, // viewport
        threshold: 0.6, // section must be at least 60% visible
      }
    );

    sections.forEach((section) => observer.observe(section));

    // Add close-menu handlers after links exist
    navUl.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        if (isOpen) closeMenu();
      })
    );
  }

  let experienceDataStore = [];
  async function loadExperienceData() {
    try {
      const res = await fetch("/assets/data/experiences.json");
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      experienceDataStore = Array.isArray(data.jobs) ? data.jobs : [];
      renderExperienceTabsAndPanel();
    } catch (err) {
      console.error("Error loading experiences:", err);
    }
  }

  function renderExperienceTabsAndPanel() {
    const tabs = document.getElementById("expTabs");
    const panel = document.getElementById("expPanel");
    if (!tabs || !panel) return;

    tabs.innerHTML = "";
    panel.innerHTML = "";

    const validJobs = experienceDataStore.filter(
      (j) => j && j.company && j.company.trim() !== ""
    );
    if (!validJobs.length) {
      panel.innerHTML = "<p>No experience yet.</p>";
      return;
    }

    validJobs.forEach((job, i) => {
      const label = job["company-alias"] || job.company;
      const btn = document.createElement("button");
      btn.className = "expTab";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.setAttribute("aria-controls", `exp-panel-${i}`);
      btn.id = `exp-tab-${i}`;
      btn.textContent = label;
      btn.addEventListener("click", () => selectExperience(i));
      tabs.appendChild(btn);
    });

    renderExperiencePanel(0);
  }

  function selectExperience(index) {
    const tabs = Array.from(document.querySelectorAll(".expTab"));
    tabs.forEach((t, i) =>
      t.setAttribute("aria-selected", i === index ? "true" : "false")
    );
    renderExperiencePanel(index);
  }

  function renderExperiencePanel(index) {
    const job = experienceDataStore[index];
    const panel = document.getElementById("expPanel");
    if (!job || !panel) return;

    const d = (job.duration && job.duration[0]) || {};
    const start = d["start-date"] || "";
    const end = d["stillEmployed?"] ? "Present" : d["end-date"] || "";
    const location = job.location ? ` · ${job.location}` : "";

    const tasks =
      job.tasks && job.tasks[0]
        ? Object.values(job.tasks[0]).filter((t) => t && t.trim() !== "")
        : [];

    panel.innerHTML = `
      <h3 id="exp-panel-${index}" class="expCompany">${job.title} @ ${
      job.company
    }</h3>
      <p class="expMeta">${start} – ${end}${location}</p>
      ${
        tasks.length
          ? `<ul class="expTasks">${tasks
              .map((t) => `<li>${t}</li>`)
              .join("")}</ul>`
          : "<p>No tasks listed.</p>"
      }
    `;
  }

  async function socialData() {
    try {
      const res = await fetch("/assets/data/socials.json");
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      const ul = document.getElementById("social-ul");
      ul.innerHTML = "";

      (data.socialLinks || []).forEach(({ name, icon, link }) => {
        if (!name || !icon || !link) return;
        const li = document.createElement("li");
        const a = document.createElement("a");
        const span = document.createElement("span");
        const i = document.createElement("i");

        li.className = "social-li";
        a.className = "social-li-a";
        span.className = "social-text-sm";
        i.className = `${icon} social-icon-sm`;

        a.href =
          link.includes("@") && !link.startsWith("mailto:")
            ? `mailto:${link}`
            : link;
        if (!link.includes("@")) a.target = "_blank";
        a.title = name;

        span.textContent = name;

        a.appendChild(span);
        a.appendChild(i);
        li.appendChild(a);
        ul.appendChild(li);
      });
    } catch (err) {
      console.error("Failed to fetch social data:", err);
    }
  }

  async function populateIntroSocials() {
    try {
      const res = await fetch("/assets/data/socials.json");
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      const list = data.socialLinks || [];
      const ul = document.getElementById("intro-socials");

      if (!ul) return;
      ul.innerHTML = "";

      list.forEach(({ name, icon, link }) => {
        if (!link) return;
        const li = document.createElement("li");
        const a = document.createElement("a");
        const span = document.createElement("span");
        span.className = "social-text";
        a.href =
          link.includes("@") && !link.startsWith("mailto:")
            ? `mailto:${link}`
            : link;
        if (!link.includes("@")) a.target = "_blank";
        if (icon) {
          const i = document.createElement("i");
          i.className = `${icon} social-icon`;
          a.appendChild(i);
        } else {
          a.textContent = name || "Link";
        }
        a.appendChild(span);
        li.appendChild(a);
        ul.appendChild(li);
      });
    } catch (err) {
      console.error("Failed to populate intro socials:", err);
    }
  }

  let skillsJSON = null;
  async function skillsData() {
    try {
      const res = await fetch("/assets/data/skills.json");
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      skillsJSON = await res.json();
      renderSkills("Technical Skills");
      initSkillsToggle();
    } catch (err) {
      console.error("Failed to fetch skills data:", err);
    }
  }

  function createSkillCard({ name, logo }) {
    const card = document.createElement("div");
    card.className = "skill-card";
    card.tabIndex = 0;

    const iconWrap = document.createElement("div");
    iconWrap.className = "skill-icon";

    if (logo && logo.trim() !== "") {
      const img = document.createElement("img");
      img.src = logo;
      img.alt = `${name} logo`;
      iconWrap.appendChild(img);
    } else {
      const span = document.createElement("span");
      span.className = "skill-initial";
      span.textContent = (name?.trim()?.[0] || "?").toUpperCase();
      iconWrap.appendChild(span);
    }

    const label = document.createElement("div");
    label.className = "skill-name";
    label.textContent = name || "Unknown";

    card.appendChild(iconWrap);
    card.appendChild(label);
    return card;
  }

  function renderSkills(type) {
    const container = document.getElementById("skillsContainer");
    container.innerHTML = "";
    if (!skillsJSON) return;

    const category = skillsJSON.Skills.find((obj) => obj[type]);
    if (!category) return;

    if (type === "Technical Skills") {
      category[type].forEach((group) => {
        Object.entries(group).forEach(([groupName, items]) => {
          const wrap = document.createElement("div");
          wrap.className = "skill-group";
          wrap.innerHTML = `<h4>${groupName}</h4>`;

          const grid = document.createElement("div");
          grid.className = "skill-grid";

          items.forEach(({ name, logo }) => {
            if (!name) return;
            const card = createSkillCard({ name, logo });
            grid.appendChild(card);
          });

          wrap.appendChild(grid);
          container.appendChild(wrap);
        });
      });
    } else if (type === "Soft Skills") {
      const wrap = document.createElement("div");
      wrap.className = "skill-group";
      wrap.innerHTML = `<h4>Soft Skills</h4>`;

      const grid = document.createElement("div");
      grid.className = "skill-grid";

      category[type].forEach(({ name, logo }) => {
        if (!name) return;
        const card = createSkillCard({ name, logo });
        grid.appendChild(card);
      });

      wrap.appendChild(grid);
      container.appendChild(wrap);
    }
  }

  function initSkillsToggle() {
    const btnTech = document.getElementById("toggleTechnical");
    const btnSoft = document.getElementById("toggleSoft");
    if (!btnTech || !btnSoft) return;

    btnTech.addEventListener("click", () => {
      btnTech.classList.add("active");
      btnSoft.classList.remove("active");
      renderSkills("Technical Skills");
    });
    btnSoft.addEventListener("click", () => {
      btnSoft.classList.add("active");
      btnTech.classList.remove("active");
      renderSkills("Soft Skills");
    });
  }

  const isTabletUp = () => window.matchMedia("(min-width: 600px)").matches;

  async function projectsData() {
    try {
      const res = await fetch("/assets/data/projects.json");
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      renderProjects(data.projects || []);
      window.addEventListener(
        "resize",
        () => renderProjects(data.projects || []),
        { passive: true }
      );
    } catch (err) {
      console.error("Failed to fetch projects data:", err);
    }
  }

  function renderProjects(projects) {
    const container = document.getElementById("projectsContainer");
    if (!container) return;
    container.innerHTML = "";

    const tablet = isTabletUp();

    projects.forEach((proj) => {
      const name = proj.name;
      const description = proj.description;
      const techStack = Array.isArray(proj.techStack) ? proj.techStack : [];
      const image = proj.image || "";
      const link = proj.link || proj.liveLink || "";
      const source = proj.source || proj.sourceCode || "";

      if (tablet) {
        const card = document.createElement("article");
        card.className = "project-card";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `${name || "Project"} — open details`);

        card.innerHTML = `
          <img class="project-img" src="${image}" alt="${name || "Project"}">
          <div class="project-content">
            <h3>${name || "Untitled Project"}</h3>
            ${description ? `<p class="project-desc">${description}</p>` : ""}
            ${
              techStack.length
                ? `<p class="project-tech">${techStack.join(", ")}</p>`
                : ""
            }
          </div>
        `;

        const open = () =>
          openProjectModal({
            name,
            description,
            techStack,
            image,
            link,
            source,
          });
        card.addEventListener("click", open);
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        });

        container.appendChild(card);
      } else {
        const card = document.createElement("article");
        card.className = "project-card";
        card.innerHTML = `
          <img class="project-img" src="${image}" alt="${name || "Project"}">
          <div class="project-content">
            <h3>${name || "Untitled Project"}</h3>
            <div class="project-links">
              ${
                link
                  ? `<a href="${link}" target="_blank" rel="noopener">Live</a>`
                  : ""
              }
              ${
                source
                  ? `<a href="${source}" target="_blank" rel="noopener">GitHub</a>`
                  : ""
              }
            </div>
          </div>
        `;
        container.appendChild(card);
      }
    });
  }

  function openProjectModal({
    name,
    description,
    techStack = [],
    image,
    link,
    source,
  }) {
    document.querySelectorAll(".project-modal").forEach((m) => m.remove());

    const modal = document.createElement("div");
    modal.className = "project-modal";
    modal.innerHTML = `
      <div class="project-modal-content" role="dialog" aria-modal="true" aria-label="${
        name || "Project details"
      }">
        <div class="project-modal-header">
          <img class="project-modal-img" src="${image || ""}" alt="${
      name || "Project"
    }">
          <button class="project-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="project-modal-body">
          <h3>${name || "Untitled Project"}</h3>
          ${
            description
              ? `<p class="project-modal-desc">${description}</p>`
              : ""
          }
          ${
            techStack.length
              ? `<p class="project-modal-tech"><strong>Tech:</strong> ${techStack.join(
                  ", "
                )}</p>`
              : ""
          }
          <div class="project-modal-actions">
            ${
              link
                ? `<a href="${link}" target="_blank" rel="noopener">Live Site</a>`
                : ""
            }
            ${
              source
                ? `<a href="${source}" target="_blank" rel="noopener">GitHub</a>`
                : ""
            }
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector(".project-modal-close");
    const content = modal.querySelector(".project-modal-content");

    const close = () => {
      modal.remove();
      window.removeEventListener("keydown", onKey);
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };

    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (!content.contains(e.target)) close();
    });
    window.addEventListener("keydown", onKey);
  }

  loadExperienceData();
  socialData();
  populateIntroSocials();
  skillsData();
  projectsData();
  loadNavList();
});
