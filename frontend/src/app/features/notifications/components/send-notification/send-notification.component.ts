import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { AppNotificationService } from '../../../../shared/services/app-notification.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { NotificationType } from '../../../../shared/models/notification.model';

const ALL_ROLES = ['admin', 'faculty', 'student'];

@Component({
  selector: 'app-send-notification',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, SharedMaterialModule],
  templateUrl: './send-notification.component.html',
  styleUrls: ['./send-notification.component.scss'],
})
export class SendNotificationComponent {
  private fb = inject(FormBuilder);
  private appNotifService = inject(AppNotificationService);
  private toastService = inject(NotificationService);

  saving = signal(false);
  allRoles = ALL_ROLES;

  typeOptions: { value: NotificationType; label: string; icon: string }[] = [
    { value: 'announcement', label: 'Announcement',   icon: 'campaign' },
    { value: 'info',         label: 'Info',           icon: 'info' },
    { value: 'warning',      label: 'Warning',        icon: 'warning_amber' },
    { value: 'fee_due',      label: 'Fee Due Reminder', icon: 'payments' },
  ];

  form = this.fb.group({
    title:       ['', [Validators.required, Validators.maxLength(120)]],
    message:     ['', [Validators.required, Validators.maxLength(1000)]],
    type:        ['announcement' as NotificationType, Validators.required],
    targetRoles: [['student', 'faculty'] as string[], Validators.required],
  });

  toggleRole(role: string) {
    const current = this.form.value.targetRoles as string[];
    const updated = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    this.form.patchValue({ targetRoles: updated });
  }

  isRoleSelected(role: string): boolean {
    return (this.form.value.targetRoles as string[]).includes(role);
  }

  send() {
    if (this.form.invalid || !(this.form.value.targetRoles as string[]).length) {
      this.form.markAllAsTouched();
      this.toastService.warning('Please fill all fields and select at least one recipient role.');
      return;
    }

    this.saving.set(true);
    this.appNotifService.send(this.form.value as any).subscribe({
      next: () => {
        this.toastService.success('Notification sent!');
        this.form.reset({ type: 'announcement', targetRoles: ['student', 'faculty'] });
        this.saving.set(false);
      },
      error: () => {
        this.toastService.error('Failed to send notification.');
        this.saving.set(false);
      },
    });
  }
}
