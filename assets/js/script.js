const body = document.body;
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
const themeBtn = document.getElementById("themeBtn");
const themeIndicator = document.getElementById("themeIndicator");
const header = document.getElementById("header");

window.addEventListener("DOMContentLoaded", () => {
  const isDark = true;
  const isNight = true;
  const themeClass = isDark ? "dark-theme" : "light-theme";
  const todClass = isNight ? "night" : "day";

  body.classList.add(themeClass);
  themeIndicator.classList.add(todClass);

  themeBtn.addEventListener("click", () => {
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

  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("opened");
    nav.classList.toggle("opened");
  });

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
});
