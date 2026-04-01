import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard } from '@angular/cdk/clipboard';
import { NotificationService } from '../../../core/services/notification.service';

export interface CredentialsDialogData {
  name: string;
  userId: string;
  defaultPassword: string;
  role: 'student' | 'faculty';
}

@Component({
  selector: 'app-credentials-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <h2 mat-dialog-title>Account Created</h2>
    <mat-dialog-content>
      <p>Share these credentials with <strong>{{ data.name }}</strong>:</p>
      <div class="cred-row">
        <span class="cred-label">Login ID</span>
        <span class="cred-value">{{ data.userId }}</span>
        <button mat-icon-button matTooltip="Copy" (click)="copy(data.userId)">
          <mat-icon>content_copy</mat-icon>
        </button>
      </div>
      <div class="cred-row">
        <span class="cred-label">Password</span>
        <span class="cred-value">{{ data.defaultPassword }}</span>
        <button mat-icon-button matTooltip="Copy" (click)="copy(data.defaultPassword)">
          <mat-icon>content_copy</mat-icon>
        </button>
      </div>
      <p class="cred-note">The user will be prompted to change this password on first login.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="ref.close()">Done</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .cred-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--divider-color); }
    .cred-label { width: 90px; font-weight: 600; color: var(--text-secondary); font-size: 0.8rem; }
    .cred-value { flex: 1; font-family: monospace; font-size: 1rem; color: var(--text-primary); }
    .cred-note { margin-top: 16px; font-size: 0.8rem; color: var(--text-secondary); }
  `],
})
export class CredentialsDialogComponent {
  data = inject<CredentialsDialogData>(MAT_DIALOG_DATA);
  ref = inject(MatDialogRef<CredentialsDialogComponent>);
  private clipboard = inject(Clipboard);
  private notify = inject(NotificationService);

  copy(value: string): void {
    this.clipboard.copy(value);
    this.notify.success('Copied to clipboard');
  }
}
