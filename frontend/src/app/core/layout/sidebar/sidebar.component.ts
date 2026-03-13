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
  route?: string;
  badge?: number;
  children?: MenuItem[];
  expanded?: boolean;
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

  // Menu items using signals with hierarchical structure
  menuItems = signal<MenuItem[]>([
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
    },
    {
      label: 'Students',
      icon: 'people',
      expanded: false,
      children: [
        {
          label: 'Students Dashboard',
          icon: 'dashboard',
          route: '/students/dashboard',
        },
        {
          label: 'Students List',
          icon: 'list',
          route: '/students/management/list',
        },
        {
          label: 'Add Student',
          icon: 'person_add',
          route: '/students/management/add',
        },
      ],
    },
    {
      label: 'Faculty',
      icon: 'school',
      expanded: false,
      children: [
        {
          label: 'Faculty Dashboard',
          icon: 'dashboard',
          route: '/faculty',
        },
        {
          label: 'Faculty List',
          icon: 'list',
          route: '/faculty/list',
        },
        {
          label: 'Add Faculty',
          icon: 'person_add',
          route: '/faculty/add',
        },
      ],
    },
  ]);

  constructor(private router: Router) {}

  /**
   * Toggle expansion of parent menu item
   */
  toggleExpand(item: MenuItem): void {
    if (item.children) {
      const items = this.menuItems();
      const index = items.indexOf(item);
      if (index !== -1) {
        items[index].expanded = !items[index].expanded;
        this.menuItems.set([...items]); // Trigger change detection
      }
    }
  }

  /**
   * Check if a menu item has children
   */
  hasChildren(item: MenuItem): boolean {
    return !!item.children && item.children.length > 0;
  }

  /**
   * Handle navigation click
   */
  onNavigate(): void {
    this.navigationClick.emit();
  }
}
