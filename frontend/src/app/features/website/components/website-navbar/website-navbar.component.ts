import { Component, ChangeDetectionStrategy, signal, inject, HostListener, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-website-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './website-navbar.component.html',
  styleUrls: ['./website-navbar.component.scss'],
})
export class WebsiteNavbarComponent {
  private router = inject(Router);
  private themeService = inject(ThemeService);

  menuOpen = signal(false);
  scrolled = signal(false);

  themeIcon = computed(() => this.themeService.isDarkMode() ? 'light_mode' : 'dark_mode');
  themeTooltip = computed(() => this.themeService.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode');

  navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#achievements' },
    { label: 'Courses', href: '#courses' },
    { label: 'Faculty', href: '#faculty' },
    { label: 'Results', href: '#achievements' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    // Only add scrolled state if truly scrolled past the top
    this.scrolled.set(window.scrollY > 100);
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  scrollTo(event: Event, href: string): void {
    event.preventDefault();
    this.closeMenu();
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToSection(href: string): void {
    this.closeMenu();
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  goToAdmin(): void {
    this.router.navigate(['/auth/login']);
  }
}
