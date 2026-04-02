import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RoleService } from '../../../../shared/services/role.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private roleService = inject(RoleService);

  isFirstLogin = this.roleService.isFirstLogin;
  loading = signal(false);
  hideCurrentPw = signal(true);
  hideNewPw = signal(true);

  form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const { currentPassword, newPassword } = this.form.value;
    this.authService.changePassword(currentPassword!, newPassword!).subscribe({
      next: () => {
        this.notify.success('Password changed successfully');
        this.navigateAfterAction();
      },
      error: (err) => {
        this.notify.error(err?.error?.message || 'Failed to change password');
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    this.navigateAfterAction();
  }

  private navigateAfterAction(): void {
    if (this.roleService.isStudent()) {
      this.router.navigate(['/my-profile']);
    } else if (this.roleService.isFaculty()) {
      this.router.navigate(['/my-faculty-profile']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
