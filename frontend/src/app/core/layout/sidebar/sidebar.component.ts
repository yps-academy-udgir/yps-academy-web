/**
 * Sidebar Component
 * Navigation sidebar with menu items
 * Uses Angular Material navigation list
 * Follows Angular 20 patterns with signals
 */
import { Component, inject, output, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RoleService } from '../../../shared/services/role.service';

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
  private roleService = inject(RoleService);

  // Student portal — items visible only to students
  private readonly studentMenuItems: MenuItem[] = [
    { label: 'My Profile',       icon: 'person',        route: '/my-profile' },
    { label: 'My Fees',          icon: 'payments',      route: '/my-fees' },
    { label: 'My Marks',         icon: 'grade',         route: '/my-marks' },
    { label: 'Change Password',  icon: 'lock_reset',    route: '/auth/change-password' },
  ];

  // Computed: returns student menu or full admin/faculty menu based on role
  visibleMenuItems = computed(() =>
    this.roleService.isStudent() ? this.studentMenuItems : this.menuItems()
  );

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
        {
          label: 'Fee Dashboard',
          icon: 'payments',
          route: '/students/fees/dashboard',
        },
        {
          label: 'Fee Defaulters',
          icon: 'warning',
          route: '/students/fees/defaulters',
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
    {
      label: 'Classrooms',
      icon: 'meeting_room',
      expanded: false,
      children: [
        {
          label: 'Classroom Dashboard',
          icon: 'dashboard',
          route: '/classrooms/dashboard',
        },
        {
          label: 'Classrooms List',
          icon: 'list',
          route: '/classrooms/management/list',
        },
        {
          label: 'Add Classroom',
          icon: 'add',
          route: '/classrooms/management/add',
        },
        {
          label: 'Mark Attendance',
          icon: 'how_to_reg',
          route: '/classrooms/attendance/mark',
        },
        {
          label: 'Enter Marks',
          icon: 'grading',
          route: '/classrooms/marks/enter',
        },
        {
          label: 'Attendance Report',
          icon: 'bar_chart',
          route: '/classrooms/attendance/report',
        },
      ],
    },
    {
      label: 'Results',
      icon: 'grading',
      expanded: false,
      children: [
        {
          label: 'Results List',
          icon: 'table_view',
          route: '/results/list',
        },
        {
          label: 'Enter Results',
          icon: 'edit_note',
          route: '/results/enter',
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
