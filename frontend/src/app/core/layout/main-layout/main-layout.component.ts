/**
 * Main Layout Component
 * Provides the main application shell with header, sidebar, and content area
 * Uses Angular Material sidenav for responsive layout
 * Follows Angular 20 standalone component pattern
 */
import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    LayoutModule,
    HeaderComponent,
    SidebarComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  // Signals for reactive state management
  sidenavOpened = signal<boolean>(true);
  isMobile = signal<boolean>(false);
  
  // Computed signal for sidenav mode
  sidenavMode = computed(() => this.isMobile() ? 'over' : 'side');

  constructor(private breakpointObserver: BreakpointObserver) {
    // Observe screen size changes
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((result) => {
        this.isMobile.set(result.matches);
        if (result.matches) {
          this.sidenavOpened.set(false);
        } else {
          this.sidenavOpened.set(true);
        }
      });
  }

  /**
   * Toggle sidenav open/close
   */
  toggleSidenav(): void {
    this.sidenavOpened.update(opened => !opened);
  }

  /**
   * Close sidenav (used on mobile when clicking a menu item)
   */
  closeSidenav(): void {
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
    }
  }
}
