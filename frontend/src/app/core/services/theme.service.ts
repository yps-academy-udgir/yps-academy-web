/**
 * Theme Service
 * Manages application theme (light/dark mode)
 * - Persists theme preference in localStorage
 * - Provides signals for reactive theme updates
 * - Handles DOM class toggling for theme application
 */
import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'yps-academy-theme';
  private readonly DARK_CLASS = 'dark-theme';
  private readonly LIGHT_CLASS = 'light-theme';

  // Signal for reactive theme state
  readonly currentTheme = signal<Theme>(this.getStoredTheme());

  constructor() {
    // Apply theme on initialization
    this.applyTheme(this.currentTheme());

    // Auto-save theme changes
    effect(() => {
      const theme = this.currentTheme();
      this.saveTheme(theme);
      this.applyTheme(theme);
    });
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(newTheme);
  }

  /**
   * Set specific theme
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  /**
   * Check if dark mode is active
   */
  isDarkMode(): boolean {
    return this.currentTheme() === 'dark';
  }

  /**
   * Get stored theme from localStorage or default to light
   */
  private getStoredTheme(): Theme {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.THEME_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    }
    // Default theme
    return 'light';
  }

  /**
   * Save theme preference to localStorage
   */
  private saveTheme(theme: Theme): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  /**
   * Apply theme to DOM by toggling body classes
   */
  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      const body = document.body;
      
      if (theme === 'dark') {
        body.classList.remove(this.LIGHT_CLASS);
        body.classList.add(this.DARK_CLASS);
      } else {
        body.classList.remove(this.DARK_CLASS);
        body.classList.add(this.LIGHT_CLASS);
      }
    }
  }
}
