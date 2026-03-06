/**
 * Empty State Component
 * Displays empty state with icon, message, and optional action
 * Reusable across different features
 * Follows Angular 20 patterns with input/output signals
 */
import { Component, input, output } from '@angular/core';
import { SharedMaterialModule } from '../../shared-material.module';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [SharedMaterialModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon() }}</mat-icon>
      <h2 class="empty-title">{{ title() }}</h2>
      <p class="empty-message">{{ message() }}</p>
      @if (actionLabel()) {
        <button
          mat-raised-button
          color="primary"
          (click)="onAction()"
          class="empty-action"
        >
          <mat-icon>{{ actionIcon() }}</mat-icon>
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
    }

    .empty-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: rgba(0, 0, 0, 0.26);
      margin-bottom: 16px;
    }

    .empty-title {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.87);
    }

    .empty-message {
      margin: 0 0 24px 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.54);
      max-width: 400px;
    }

    .empty-action {
      margin-top: 8px;
    }
  `],
})
export class EmptyStateComponent {
  // Input signals
  icon = input<string>('inbox');
  title = input<string>('No Data Available');
  message = input<string>('There is no data to display at the moment.');
  actionLabel = input<string>('');
  actionIcon = input<string>('add');

  // Output signal
  action = output<void>();

  onAction(): void {
    this.action.emit();
  }
}
