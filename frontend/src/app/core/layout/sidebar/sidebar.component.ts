/**
 * Sidebar Component
 * Navigation sidebar with menu items
 * Uses Angular Material navigation list
 * Follows Angular 20 patterns with signals
 */
import { Component, inject, output, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { RoleService } from '../../../shared/services/role.service';
import { ClassroomService } from '../../../shared/services/classroom.service';
import { ChatService } from '../../../shared/services/chat.service';
import { Classroom } from '../../../features/classroom/models/classroom.model';

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
    MatBadgeModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './sidebar.component.html',  
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  // Output event when navigation item is clicked
  navigationClick = output<void>();
  private roleService = inject(RoleService);
  private classroomService = inject(ClassroomService);
  private chatService = inject(ChatService);

  // Chat room classroom list for role-based direct access
  chatClassrooms = signal<Classroom[]>([]);
  chatRoomsExpanded = signal<boolean>(true);
  unreadCounts = this.chatService.unreadCountsMap;
  chatLoading = signal<boolean>(false);
  chatError = signal<string | null>(null);
  hasChatAccess = computed(() =>
    this.roleService.isStudent() || this.roleService.isFaculty() || this.roleService.isAdmin()
  );

  // Student portal — items visible only to students
  private readonly studentMenuItems: MenuItem[] = [
    { label: 'My Profile',       icon: 'person',        route: '/my-profile' },
    { label: 'My Fees',          icon: 'payments',      route: '/my-fees' },
    { label: 'My Marks',         icon: 'grade',         route: '/my-marks' },
    { label: 'Change Password',  icon: 'lock_reset',    route: '/auth/change-password' },
  ];

  // Computed: returns role-appropriate menu
  visibleMenuItems = computed(() => {
    if (this.roleService.isStudent()) return this.studentMenuItems;
    if (this.roleService.isFaculty()) {
      return [
        { label: 'My Profile', icon: 'person', route: '/my-faculty-profile' },
        ...this.menuItems(),
      ];
    }
    return this.menuItems();
  });

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

  ngOnInit(): void {
    if (this.roleService.isStudent() || this.roleService.isFaculty()) {
      this.chatLoading.set(true);
      this.chatError.set(null);
      this.classroomService.getMyClassrooms().subscribe({
        next: (response) => this.chatClassrooms.set(response.data),
        error: (err) => {
          console.error('[Sidebar] Failed to load chat classrooms:', err);
          this.chatError.set(err?.error?.message || 'Could not load classrooms');
          this.chatLoading.set(false);
        },
        complete: () => this.chatLoading.set(false),
      });
      this.chatService.loadUnreadCounts();
      return;
    }

    if (this.roleService.isAdmin()) {
      this.chatLoading.set(true);
      this.chatError.set(null);
      this.classroomService.getAllClassrooms(1, 50).subscribe({
        next: (response) => this.chatClassrooms.set(response.data),
        error: (err) => {
          console.error('[Sidebar] Failed to load chat classrooms:', err);
          this.chatError.set(err?.error?.message || 'Could not load classrooms');
          this.chatLoading.set(false);
        },
        complete: () => this.chatLoading.set(false),
      });
    }
  }

  getUnreadCount(classroomId: string): number {
    return this.unreadCounts().get(classroomId) ?? 0;
  }

  getClassroomLabel(classroom: Classroom): string {
    return `${classroom.class} ${classroom.section}`;
  }

  toggleChatRooms(): void {
    this.chatRoomsExpanded.set(!this.chatRoomsExpanded());
  }

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
