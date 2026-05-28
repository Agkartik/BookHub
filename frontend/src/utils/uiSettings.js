export const applyUiSettings = (settings = {}) => {
  const root = document.documentElement;

  root.classList.remove("theme-light", "theme-dark");
  if (settings.theme === "dark") {
    root.classList.add("dark");
    root.classList.add("theme-dark");
  } else if (settings.theme === "light") {
    root.classList.remove("dark");
    root.classList.add("theme-light");
  } else {
    root.classList.remove("dark");
    root.classList.add(window.matchMedia("(prefers-color-scheme: dark)").matches ? "theme-dark" : "theme-light");
  }
  root.setAttribute("data-theme", settings.theme || "system");
  root.style.colorScheme = settings.theme === "dark" ? "dark" : "light";

  if (settings.reduceMotion) root.classList.add("reduce-motion");
  else root.classList.remove("reduce-motion");

  if (settings.glassmorphism === false) root.classList.add("no-glass");
  else root.classList.remove("no-glass");
};

