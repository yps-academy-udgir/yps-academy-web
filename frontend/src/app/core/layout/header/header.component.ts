/**
 * Header Component
 * Application header with menu toggle, branding, theme toggle, and user actions
 * Uses Angular Material toolbar
 * Follows Angular 20 patterns with signals
 */
import { Component, output, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  // Angular 20 output() function for event emission
  menuToggle = output<void>();

  // Inject services
  private router = inject(Router);
  private themeService = inject(ThemeService);

  // Computed signal for theme icon
  protected themeIcon = computed(() => 
    this.themeService.isDarkMode() ? 'light_mode' : 'dark_mode'
  );

  // Computed signal for theme tooltip
  protected themeTooltip = computed(() => 
    this.themeService.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'
  );

  /**
   * Emit menu toggle event
   */
  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  /**
   * Navigate to dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/students']);
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Open notifications (placeholder)
   */
  openNotifications(): void {
    // TODO: Implement notifications
    console.log('Notifications clicked');
  }

  /**
   * Open user menu (placeholder)
   */
  openUserMenu(): void {
    // TODO: Implement user menu
    console.log('User menu clicked');
  }
}
