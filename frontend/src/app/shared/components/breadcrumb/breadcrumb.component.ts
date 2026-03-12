import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedMaterialModule } from '../../shared-material.module';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedMaterialModule],
  template: `
    <nav class="breadcrumb-container" aria-label="breadcrumb">
      <div class="breadcrumb-wrapper">
        @for (crumb of breadcrumbs(); track crumb.url; let isLast = $last) {
          @if (crumb.isClickable) {
            <a
              [routerLink]="crumb.url"
              class="breadcrumb-link"
              [attr.aria-current]="isLast ? 'page' : null"
            >
              @if (crumb.icon) {
                <mat-icon class="breadcrumb-icon">{{ crumb.icon }}</mat-icon>
              }
              <span>{{ crumb.label }}</span>
            </a>
          } @else {
            <span class="breadcrumb-current" aria-current="page">
              @if (crumb.icon) {
                <mat-icon class="breadcrumb-icon">{{ crumb.icon }}</mat-icon>
              }
              <span>{{ crumb.label }}</span>
            </span>
          }
          @if (!isLast) {
            <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
          }
        }
      </div>
    </nav>
  `,
  styles: [
    `
      .breadcrumb-container {
        background-color: var(--background-secondary);
        border-bottom: 1px solid var(--border-color);
        padding: 8px 24px;
      }

      @media (max-width: 768px) {
        .breadcrumb-container {
          display: none;
        }
      }

      .breadcrumb-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        max-width: 1400px;
        margin: 0 auto;
      }

      .breadcrumb-link,
      .breadcrumb-current {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .breadcrumb-link {
        color: var(--text-secondary);
        cursor: pointer;
      }

      .breadcrumb-link:hover {
        color: var(--primary-color);
        text-decoration: underline;
      }

      .breadcrumb-link:hover .breadcrumb-icon {
        color: var(--primary-color);
      }

      .breadcrumb-current {
        color: var(--text-primary);
        font-weight: 500;
      }

      .breadcrumb-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: inherit;
      }

      .breadcrumb-separator {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--text-secondary);
      }
    `,
  ],
})
export class BreadcrumbComponent {
  private breadcrumbService = inject(BreadcrumbService);

  breadcrumbs = computed(() => this.breadcrumbService.getBreadcrumbs());
}
