const body = document.body;
const main = document.getElementById("main");
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
const header = document.getElementById("header");

window.addEventListener("DOMContentLoaded", () => {
  // Header Feature

  let lastPositionY = window.scrollY;
  let scrollTimeout;

  window.addEventListener("scroll", () => {
    const currentPositionY = window.scrollY;

    if (currentPositionY < lastPositionY && currentPositionY >= 100) {
      header.classList.add("scrollingUp");
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        header.classList.remove("scrollingUp");
      }, 3000);
    } else {
      header.classList.remove("scrollingUp");
    }

    if (currentPositionY >= 100) {
      header.classList.add("active");
    } else {
      header.classList.remove("active");
    }

    lastPositionY = currentPositionY;
  });

  // Theme
  const themeButton = document.createElement("button");
  const themeIndicator = document.createElement("span");

  themeButton.classList.add("themeBtn");
  themeIndicator.classList.add("themeIndicator");
  themeButton.appendChild(themeIndicator);
  main.appendChild(themeButton);

  const isDark = true;
  const isNight = true;
  const themeClass = isDark ? "dark-theme" : "light-theme";
  const todClass = isNight ? "night" : "day";

  body.classList.add(themeClass);
  themeIndicator.classList.add(todClass);

  themeButton.addEventListener("click", () => {
    const currentTheme = body.classList.contains("dark-theme")
      ? "dark-theme"
      : "light-theme";
    const newTheme =
      currentTheme === "dark-theme" ? "light-theme" : "dark-theme";

    const currentTOD = themeIndicator.classList.contains("night")
      ? "night"
      : "day";

    const newTOD = currentTOD === "night" ? "day" : "night";

    body.classList.remove(currentTheme);
    body.classList.add(newTheme);

    themeIndicator.classList.remove(currentTOD);
    themeIndicator.classList.add(newTOD);

    localStorage.setItem("theme", newTheme);
    localStorage.setItem("tod", newTOD);
  });

  // Menu

  menuBtn.addEventListener("click", () => {
    const isOpened = menuBtn.classList.contains("opened");

    if (!isOpened) {
      menuBtn.classList.add("opened");
      nav.classList.add("opened");
    } else {
      menuBtn.classList.remove("opened");
      nav.classList.remove("opened");
    }
  });

  // NavLinks

  fetch("/assets/data/navLinks.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Fetched JSON data:", data);

      // Access navLinks properly
      let navLinks = data.Links[0].navLinks;
      let socialLinks = data.Links[1].socialLinks;

      navLinks.forEach((link) => {
        const ul = document.getElementById("nav-ul");
        const li = document.createElement("li");
        const a = document.createElement("a");
        const icon = document.createElement("i");

        li.className = "nav-li";
        a.className = "nav-li-a";
        a.href = link.href;
        a.textContent = link.name;

        if (link.icon) {
          icon.className = link.icon;
          a.prepend(icon);
        }

        li.appendChild(a);

        ul.appendChild(li);
      });

      const links = document.querySelectorAll("nav li a");

      links.forEach((element) => {
        element.addEventListener("click", () => {
          nav.classList.remove("opened");
          menuBtn.classList.remove("opened");
        });
      });

      // Social Links

      socialLinks.forEach((link) => {
        const ul = document.getElementById("hero-social-ul");
        const li = document.createElement("li");
        const a = document.createElement("a");
        const span = document.createElement("span");
        const icon = document.createElement("i");

        li.className = "social-li";
        a.className = "social-li-a";
        span.className = `social-text`;
        a.href = link.href;
        span.textContent = link.name;

        if (link.icon) {
          icon.className = `${link.icon} social-icon `;

          a.prepend(icon);
        }

        a.appendChild(span);
        li.appendChild(a);

        ul.appendChild(li);
      });
    })
    .catch((error) => {
      console.log("Error fetching JSON:", error);
    });

  // My Experience

  fetch("/assets/data/experiences.json")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error!: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const jobs = Array.isArray(data.jobs) ? data.jobs : [];
      if (!jobs.length) return;

      const tabsUl = document.getElementById("companyTabs");
      const panel = document.getElementById("jobPanel");

      // Build tabs
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

      // Render panel
      function selectJob(index) {
        document.querySelectorAll(".company-tab").forEach((b, i) => {
          const active = i === index;
          b.classList.toggle("active", active);
          b.setAttribute("aria-selected", active ? "true" : "false");
        });
        renderJob(jobs[index]);
      }

      function renderJob(job) {
        const {
          title = "",
          company = "",
          location = "",
          duration = [],
          tasks = [],
        } = job;

        // Duration: read your structure with "stillEmployed?"
        const d0 = duration && duration[0] ? duration[0] : {};
        const start = d0.startDate || "";
        const end = d0["stillEmployed?"] ? "Present" : d0.endDate || "";
        const period = [start, end].filter(Boolean).join(" – ");

        // Tasks: your shape has an object { task1, task2, ... } inside an array
        const taskObject = tasks && tasks[0] ? tasks[0] : {};
        const taskList = Object.values(taskObject).filter(Boolean);

        panel.innerHTML = `
        <header class="job-header">
          <h3 class="job-title">${escapeHTML(
            title
          )} <span class="at">@</span> <span class="company-name">${escapeHTML(
          company
        )}</span></h3>
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

      // Simple escape for safety
      function escapeHTML(str) {
        return String(str)
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#039;");
      }

      // Initial render
      selectJob(0);
    })
    .catch((err) => console.error("Experience fetch error:", err));

  // Projects

  // /assets/js/projects.js (or inside your script.js)

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

      // Build tabs once (desktop usage)
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
          if (mq.matches) return; // no tab selection on mobile
          currentIndex = idx;
          selectProject(idx);
        });

        li.appendChild(btn);
        projectTabs.appendChild(li);
      });

      function selectProject(index) {
        // update tab states
        projectTabs.querySelectorAll(".project-tab").forEach((b, i) => {
          const active = i === index;
          b.classList.toggle("active", active);
          b.setAttribute("aria-selected", active ? "true" : "false");
        });
        renderDesktop(projects[index]);
      }

      // ----- RENDERERS -----

      function renderDesktop(project) {
        // one card view
        const {
          name = "",
          description = "",
          image = "",
          liveLink = "",
          sourceCode = "",
          techStack = [],
        } = project;

        projectContainer.innerHTML = `
        <section class="projectCard">
          <h3 class="project-title">${name}</h3>
          <article class="flip" aria-live="polite">
            <section class="flip-inner">
              <article class="flip-front">
                <img src="${image}" alt="${name}" class="project-img" />
              </article>
              <article class="flip-back">
                <section class="description-flex">
                  <p class="description">${description}</p>
                  <ul class="tech-list">
                    ${techStack
                      .map((t) => `<li class="tech-item">${t}</li>`)
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
            <a href="${sourceCode}" class="githubLink" aria-label="Source code on GitHub">
              <i class="fa-brands fa-github" aria-hidden="true"></i>
            </a>
            <a href="${liveLink}" class="siteLink" aria-label="Open live site">
              <i class="fa-solid fa-square-arrow-up-right" aria-hidden="true"></i>
            </a>
          </article>
        </section>
      `;

        // attach flip to the single card
        const infoBtn = projectContainer.querySelector(".infoBox");
        const flipInner = projectContainer.querySelector(".flip-inner");
        infoBtn.addEventListener("click", () => {
          flipInner.classList.toggle("flipped");
          infoBtn.setAttribute(
            "aria-pressed",
            flipInner.classList.contains("flipped") ? "true" : "false"
          );
        });
      }

      function renderMobileList() {
        // all projects stacked
        projectContainer.innerHTML = projects
          .map((p, idx) => {
            const {
              name = "",
              description = "",
              image = "",
              liveLink = "",
              sourceCode = "",
              techStack = [],
            } = p;

            // unique class per card to bind listeners easily
            return `
            <section class="projectCard projectCard-mobile" data-idx="${idx}">
              <h3 class="project-title">${name}</h3>
              <article class="flip" aria-live="polite">
                <section class="flip-inner">
                  <article class="flip-front">
                    <img src="${image}" alt="${name}" class="project-img" />
                  </article>
                  <article class="flip-back">
                    <section class="description-flex">
                      <p class="description">${description}</p>
                      <ul class="tech-list">
                        ${techStack
                          .map((t) => `<li class="tech-item">${t}</li>`)
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
                <a href="${sourceCode}" class="githubLink" aria-label="Source code on GitHub">
                  <i class="fa-brands fa-github" aria-hidden="true"></i>
                </a>
                <a href="${liveLink}" class="siteLink" aria-label="Open live site">
                  <i class="fa-solid fa-square-arrow-up-right" aria-hidden="true"></i>
                </a>
              </article>
            </section>
          `;
          })
          .join("");

        // delegate flip handling for all cards
        projectContainer
          .querySelectorAll(".projectCard-mobile")
          .forEach((card) => {
            const infoBtn = card.querySelector(".infoBox");
            const flipInner = card.querySelector(".flip-inner");
            infoBtn.addEventListener("click", () => {
              flipInner.classList.toggle("flipped");
              infoBtn.setAttribute(
                "aria-pressed",
                flipInner.classList.contains("flipped") ? "true" : "false"
              );
            });
          });
      }

      // ----- LAYOUT SWITCHER -----

      function applyMode() {
        const isMobile = mq.matches;

        // tabs visible only on desktop
        projectTabs.classList.toggle("hidden", isMobile);

        if (isMobile) {
          renderMobileList();
        } else {
          // ensure tab states reflect currentIndex
          projectTabs.querySelectorAll(".project-tab").forEach((b, i) => {
            const active = i === currentIndex;
            b.classList.toggle("active", active);
            b.setAttribute("aria-selected", active ? "true" : "false");
          });
          renderDesktop(projects[currentIndex]);
        }
      }

      mq.addEventListener("change", applyMode);

      // initial render
      applyMode();
    })
    .catch((err) => console.error("Project fetch error:", err));
});
