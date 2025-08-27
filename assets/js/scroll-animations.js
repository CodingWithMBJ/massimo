(function () {
  if (window.__revealObserverSetup__) return;
  window.__revealObserverSetup__ = true;

  const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;

  // Add .reveal to common elements (idempotent)
  function tagRevealables(root = document) {
    const candidates = [
      ".sectionContainer",
      ".introCard",
      ".projectCard",
      ".contactCard",
      ".expSidebar",
      ".job-panel",
      ".projects .project-card-container > *",
      ".skillsContainer > *",
      ".blogsContainer > *",
    ];
    candidates.forEach((sel, i) => {
      root.querySelectorAll(sel).forEach((el) => {
        if (!el.classList.contains("reveal")) {
          el.classList.add("reveal");
          const idx = (i % 3) + 1; // micro stagger
          el.setAttribute("data-reveal-delay", String(idx));
        }
      });
    });
  }

  if (!motionOK) {
    tagRevealables();
    document
      .querySelectorAll(".reveal")
      .forEach((el) => el.classList.add("in-view"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
  );

  function observeAll() {
    document
      .querySelectorAll(".reveal:not(.in-view)")
      .forEach((el) => io.observe(el));
  }

  tagRevealables();
  observeAll();

  const mo = new MutationObserver(() => {
    tagRevealables(document);
    observeAll();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("orientationchange", () =>
    setTimeout(observeAll, 200)
  );
  window.addEventListener("resize", () => setTimeout(observeAll, 200));
})();
