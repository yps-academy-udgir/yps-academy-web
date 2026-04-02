import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { FacultyService } from '../../../../shared/services/faculty.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CredentialsDialogComponent } from '../../../../shared/components/credentials-dialog/credentials-dialog.component';
import { AuthService } from '../../../auth/services/auth.service';
import { RoleService } from '../../../../shared/services/role.service';
import { Faculty } from '../../models/faculty.model';

@Component({
  selector: 'app-faculty-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SharedMaterialModule, LoadingComponent, ErrorMessageComponent],
  templateUrl: './faculty-detail.component.html',
  styleUrls: ['./faculty-detail.component.scss'],
})
export class FacultyDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private facultyService = inject(FacultyService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  roleService = inject(RoleService);

  faculty = signal<Faculty | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  /** True when the logged-in faculty is viewing their own profile */
  isOwnProfile = computed(() => {
    const loggedInUserId = this.authService.currentUser()?.userId;
    return !!loggedInUserId && this.faculty()?.userId === loggedInUserId;
  });

  private paramSub!: Subscription;

  ngOnInit(): void {
    this.paramSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadFaculty(id);
      } else {
        this.router.navigate(['/faculty/list']);
      }
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }

  private loadFaculty(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.facultyService.getFacultyById(id).subscribe({
      next: (res) => {
        if (res.data) this.faculty.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load faculty details.');
        this.loading.set(false);
      },
    });
  }

  paidTotal(): number {
    return (this.faculty()?.salaryPayments ?? []).reduce((s, p) => s + p.amount, 0);
  }

  remainingBalance(): number {
    return (this.faculty()?.annualSalary ?? 0) - this.paidTotal();
  }

  onEdit(): void {
    const id = this.faculty()?._id;
    if (id) this.router.navigate(['/faculty', id, 'edit']);
  }

  onDelete(): void {
    const f = this.faculty();
    if (!f?._id) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Faculty',
        message: `Are you sure you want to delete ${f.firstName} ${f.lastName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed && f._id) {
        this.facultyService.deleteFaculty(f._id).subscribe({
          next: () => {
            this.notificationService.success('Faculty member deleted successfully.');
            this.router.navigate(['/faculty/list']);
          },
          error: () => this.notificationService.error('Failed to delete faculty member.'),
        });
      }
    });
  }

  onResetPassword(): void {
    const f = this.faculty();
    if (!f?.userId) {
      this.notificationService.error('No login account found for this faculty member.');
      return;
    }
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reset Password',
        message: `Reset the password for ${f.firstName} ${f.lastName}? They will be prompted to change it on next login.`,
        confirmText: 'Reset',
        cancelText: 'Cancel',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.authService.resetPassword(f.userId!, 'faculty').subscribe({
        next: (result) => {
          this.dialog.open(CredentialsDialogComponent, {
            data: { name: `${f.firstName} ${f.lastName}`, userId: result.userId, defaultPassword: result.defaultPassword, role: 'faculty' },
            disableClose: true,
          });
        },
        error: () => this.notificationService.error('Failed to reset password.'),
      });
    });
  }

  onBack(): void {
    this.router.navigate(['/faculty/list']);
  }

  onRetry(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? this.faculty()?._id;
    if (id) this.loadFaculty(id);
  }
}
