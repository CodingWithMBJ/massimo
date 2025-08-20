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
    let isOpened = false;
    if (!isOpened) {
      menuBtn.classList.toggle("opened");
      isOpened = true;
    } else {
      menuBtn.classList.remove("opened");
      isOpened = false;
    }
  });

  let currentScreenPosition = 0;
  let isScrolling = false;

  function scrolling() {
    console.log(currentScreenPosition);
  }

  const scrollingPage = isScrolling ? "scrolling" : "notScrolled";

  body.classList.add(scrollingPage);

  window.addEventListener("scroll", () => {});
});
