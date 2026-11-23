(function initializeTheme() {
  const storageKey = "technocrats-theme";
  const root = document.documentElement;
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  function getStoredTheme() {
    try {
      const storedTheme = window.localStorage.getItem(storageKey);
      return storedTheme === "light" || storedTheme === "dark" ? storedTheme : null;
    } catch {
      return null;
    }
  }

  function getPreferredTheme() {
    return getStoredTheme() || (systemTheme.matches ? "dark" : "light");
  }

  function updateThemeColor(theme) {
    let themeColor = document.querySelector('meta[name="theme-color"]');

    if (!themeColor) {
      themeColor = document.createElement("meta");
      themeColor.name = "theme-color";
      document.head.append(themeColor);
    }

    themeColor.content = theme === "dark" ? "#08050c" : "#f7f2e8";
  }

  function updateToggle(toggle, theme) {
    if (!toggle) return;

    const isDark = theme === "dark";
    const label = toggle.querySelector(".theme-toggle__label");
    toggle.dataset.activeTheme = theme;
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
    toggle.title = `Switch to ${isDark ? "light" : "dark"} mode`;
    if (label) label.textContent = isDark ? "Dark" : "Light";
  }

  function applyTheme(theme, persist = false) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    updateThemeColor(theme);
    updateToggle(document.querySelector("[data-theme-toggle]"), theme);

    if (persist) {
      try {
        window.localStorage.setItem(storageKey, theme);
      } catch {
        // The selected theme still applies for the current page view.
      }
    }

    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }

  function createIcon(path) {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="${path}"></path>
      </svg>
    `;
  }

  function createToggle() {
    if (document.querySelector("[data-theme-toggle]")) return;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "theme-toggle";
    toggle.dataset.themeToggle = "true";
    toggle.innerHTML = `
      <span class="theme-toggle__icon theme-toggle__icon--sun">
        ${createIcon("M12 4V2m0 20v-2M4 12H2m20 0h-2M6.34 6.34 4.93 4.93m11.46 11.46-1.41-1.41M17.66 6.34l1.41-1.41M4.93 19.07l1.41-1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z")}
      </span>
      <span class="theme-toggle__label"></span>
      <span class="theme-toggle__icon theme-toggle__icon--moon">
        ${createIcon("M20.25 15.28A8.5 8.5 0 0 1 8.72 3.75 8.5 8.5 0 1 0 20.25 15.28Z")}
      </span>
    `;
    toggle.addEventListener("click", () => {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
    });
    document.body.append(toggle);
    updateToggle(toggle, root.dataset.theme);
    requestAnimationFrame(() => root.classList.add("theme-ready"));
  }

  applyTheme(getPreferredTheme());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createToggle, { once: true });
  } else {
    createToggle();
  }

  const handleSystemThemeChange = (event) => {
    if (!getStoredTheme()) applyTheme(event.matches ? "dark" : "light");
  };

  if (typeof systemTheme.addEventListener === "function") {
    systemTheme.addEventListener("change", handleSystemThemeChange);
  } else {
    systemTheme.addListener(handleSystemThemeChange);
  }
})();
