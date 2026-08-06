export type Theme = "light" | "dark" | "system";

const THEME_KEY = "ai-job-portal-theme";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
    return "system";
  } catch {
    return "system";
  }
}

export function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && systemDark);
  root.classList.toggle("dark", isDark);
}

export function setTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
  applyTheme(theme);
}

export function initializeTheme() {
  applyTheme(getTheme());
}
