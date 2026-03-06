/**
 * Loading Spinner Component
 * Reusable loading indicator with customizable size and message
 * Uses Angular Material spinner
 * Follows Angular 20 patterns with input signals
 */
import { Component, input } from '@angular/core';
import { SharedMaterialModule } from '../../shared-material.module';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [SharedMaterialModule],
  template: `
    <div class="loading-container">
      <mat-spinner [diameter]="diameter()" [color]="color()"></mat-spinner>
      @if (message()) {
        <p class="loading-message">{{ message() }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      min-height: 200px;
    }

    .loading-message {
      margin-top: 16px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.54);
      text-align: center;
    }
  `],
})
export class LoadingComponent {
  // Angular 20 input signals
  diameter = input<number>(50);
  color = input<'primary' | 'accent' | 'warn'>('primary');
  message = input<string>('');
}
