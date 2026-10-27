export type ThemeName = "light" | "dark";

const STORAGE_KEY = "rv-theme";

export function currentTheme(): ThemeName {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function applyTheme(theme: ThemeName) {
  document.documentElement.classList.toggle("pf-v6-theme-dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#10100e" : "#f4f2ec");
  localStorage.setItem(STORAGE_KEY, theme);
}
