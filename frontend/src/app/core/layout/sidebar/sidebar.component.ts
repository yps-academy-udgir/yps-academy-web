/**
 * Sidebar Component
 * Navigation sidebar with menu items
 * Uses Angular Material navigation list
 * Follows Angular 20 patterns with signals
 */
import { Component, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatListModule,
    MatIconModule,
    MatDividerModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './sidebar.component.html',  
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  // Output event when navigation item is clicked
  navigationClick = output<void>();

  // Menu items using signals
  menuItems = signal<MenuItem[]>([
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
    },
    {
      label: 'Students',
      icon: 'people',
      route: '/students',
    },
    {
      label: 'Add Student',
      icon: 'person_add',
      route: '/students/add',
    },
  ]);

  constructor(private router: Router) {}

  /**
   * Handle navigation click
   */
  onNavigate(): void {
    this.navigationClick.emit();
  }
}
