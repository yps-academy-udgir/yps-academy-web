import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserRole } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  readonly roleOptions = [
    { value: UserRole.ADMIN, label: 'Admin', icon: 'admin_panel_settings' },
    { value: UserRole.FACULTY, label: 'Faculty', icon: 'school' },
    { value: UserRole.STUDENT, label: 'Student', icon: 'person' },
  ];

  hidePassword = signal(true);
  loading = this.authService.loading;

  loginForm = this.fb.group({
    userId: ['', Validators.required],
    password: ['', Validators.required],
    role: [UserRole.ADMIN, Validators.required],
  });

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (!control?.errors) return '';
    if (control.errors['required']) return field.charAt(0).toUpperCase() + field.slice(1) + ' is required';
    return 'Invalid input';
  }

  onCancel(): void {
    // this.loginForm.reset({ role: UserRole.ADMIN });
    this.router.navigate(['/website']);

  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { userId, password, role } = this.loginForm.value;
    this.authService.login({ userId: userId!, password: password!, role: role as UserRole }).subscribe({
      next: () => {
        this.notificationService.success('Login successful! Welcome back.');
        const userRole = this.authService.role();
        if (userRole === UserRole.FACULTY) {
          this.router.navigate(['/faculty']);
        } else if (userRole === UserRole.STUDENT) {
          this.router.navigate(['/my-profile']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.notificationService.error(this.authService.error() ?? 'Login failed.');
      },
    });
  }
}
