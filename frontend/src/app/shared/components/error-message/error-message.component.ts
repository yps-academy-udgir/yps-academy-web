/**
 * Error Message Component
 * Displays error messages with retry action
 * Reusable across different features
 * Follows Angular 20 patterns with input/output signals
 */
import { Component, input, output } from '@angular/core';
import { SharedMaterialModule } from '../../shared-material.module';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [SharedMaterialModule],
  template: `
    <mat-card class="error-card">
      <mat-card-content>
        <div class="error-content">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <div class="error-text">
            <h3 class="error-title">{{ title() }}</h3>
            <p class="error-message">{{ message() }}</p>
          </div>
        </div>
        @if (showRetry()) {
          <div class="error-actions">
            <button
              mat-raised-button
              color="primary"
              (click)="onRetry()"
            >
              <mat-icon>refresh</mat-icon>
              Try Again
            </button>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .error-card {
      background-color: #ffebee;
      border-left: 4px solid #f44336;
    }

    .error-content {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .error-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
      flex-shrink: 0;
    }

    .error-text {
      flex: 1;
    }

    .error-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
      color: #c62828;
    }

    .error-message {
      margin: 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.87);
    }

    .error-actions {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  `],
})
export class ErrorMessageComponent {
  // Input signals
  title = input<string>('Error Occurred');
  message = input<string>('An unexpected error occurred. Please try again.');
  showRetry = input<boolean>(true);

  // Output signal
  retry = output<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
