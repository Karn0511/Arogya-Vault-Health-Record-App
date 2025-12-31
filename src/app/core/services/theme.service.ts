import { Injectable, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

/**
 * Theme Service
 * Manages application theme (light/dark mode)
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'arogya-vault-theme';

  // Signal for reactive theme state
  theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // Apply theme when it changes
    effect(() => {
      this.applyTheme(this.theme());
    });

    // Listen to system theme changes
    if (this.theme() === 'system') {
      this.listenToSystemThemeChanges();
    }
  }

  /**
   * Set theme
   */
  setTheme(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem(this.THEME_STORAGE_KEY, theme);

    if (theme === 'system') {
      this.listenToSystemThemeChanges();
    }
  }

  /**
   * Toggle between light and dark
   */
  toggleTheme(): void {
    const current = this.getEffectiveTheme();
    this.setTheme(current === 'light' ? 'dark' : 'light');
  }

  /**
   * Get effective theme (resolves 'system' to actual theme)
   */
  getEffectiveTheme(): 'light' | 'dark' {
    const theme = this.theme();
    if (theme === 'system') {
      return this.getSystemTheme();
    }
    return theme;
  }

  /**
   * Get initial theme from storage or default to system
   */
  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(this.THEME_STORAGE_KEY);
    if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
      return stored as Theme;
    }
    return 'system';
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(theme: Theme): void {
    const effectiveTheme = theme === 'system' ? this.getSystemTheme() : theme;
    const root = document.documentElement;

    // Add transition class before theme change
    root.classList.add('theme-transitioning');

    // Apply theme
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Also update body for background transitions
    if (effectiveTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    // Remove transition class after animation
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 500);
  }

  /**
   * Get system theme preference
   */
  private getSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Listen to system theme changes
   */
  private listenToSystemThemeChanges(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.theme() === 'system') {
        this.applyTheme('system');
      }
    });
  }
}
