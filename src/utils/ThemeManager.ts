/**
 * Theme Manager - Handles dark/light theme switching
 * Following DRY principles for theme management across the app
 */
export class ThemeManager {
  private static instance: ThemeManager;
  private isDarkMode: boolean = false;
  private observers: ((isDark: boolean) => void)[] = [];

  private constructor() {
    this.initializeTheme();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    this.isDarkMode = savedTheme === "dark" || (!savedTheme && prefersDark);
    this.applyTheme();

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          this.isDarkMode = e.matches;
          this.applyTheme();
        }
      });
  }

  /**
   * Toggle between dark and light themes
   */
  toggle(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    this.savePreference();
    this.notifyObservers();
  }

  /**
   * Set specific theme
   */
  setTheme(isDark: boolean): void {
    this.isDarkMode = isDark;
    this.applyTheme();
    this.savePreference();
    this.notifyObservers();
  }

  /**
   * Get current theme state
   */
  isDark(): boolean {
    return this.isDarkMode;
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(): void {
    const html = document.documentElement;

    if (this.isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }

  /**
   * Save theme preference to localStorage
   */
  private savePreference(): void {
    localStorage.setItem("theme", this.isDarkMode ? "dark" : "light");
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(callback: (isDark: boolean) => void): void {
    this.observers.push(callback);
  }

  /**
   * Unsubscribe from theme changes
   */
  unsubscribe(callback: (isDark: boolean) => void): void {
    this.observers = this.observers.filter((obs) => obs !== callback);
  }

  /**
   * Notify all observers of theme change
   */
  private notifyObservers(): void {
    this.observers.forEach((callback) => callback(this.isDarkMode));
  }

  /**
   * Update theme icons across the app
   */
  updateThemeIcons(): void {
    const themeIcons = document.querySelectorAll(
      "#theme-icon, #mobile-theme-icon"
    );

    themeIcons.forEach((icon) => {
      if (icon) {
        icon.innerHTML = this.isDarkMode
          ? this.getSunIcon()
          : this.getMoonIcon();
      }
    });
  }

  /**
   * Get sun icon for light mode
   */
  private getSunIcon(): string {
    return `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
        </svg>`;
  }

  /**
   * Get moon icon for dark mode
   */
  private getMoonIcon(): string {
    return `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>`;
  }
}
