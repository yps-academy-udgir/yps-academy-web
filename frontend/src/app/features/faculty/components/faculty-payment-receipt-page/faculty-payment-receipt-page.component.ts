import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Faculty } from '../../models/faculty.model';
import { FacultyService } from '../../../../shared/services/faculty.service';
import { FacultyPaymentReceiptService } from '../../../../shared/services/faculty-payment-receipt.service';
import { FacultyPaymentReceiptComponent } from '../../../../shared/components/faculty-payment-receipt/faculty-payment-receipt.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { RoleService } from '../../../../shared/services/role.service';

@Component({
  selector: 'app-faculty-payment-receipt-page',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    ErrorMessageComponent,
    FacultyPaymentReceiptComponent,
  ],
  template: `
    <div class="page-shell">
      <div class="top-actions">
        <button mat-button type="button" (click)="onBack()">
          <mat-icon>arrow_back</mat-icon>
          Back
        </button>
      </div>

      @if (loading()) {
        <app-loading [message]="'Loading faculty payment receipt...'"></app-loading>
      }

      @if (error() && !loading()) {
        <app-error-message
          [title]="'Error Loading Faculty Payment Receipt'"
          [message]="error()!"
          (retry)="onRetry()"
        ></app-error-message>
      }

      @if (receiptData() && !loading() && !error()) {
        <app-faculty-payment-receipt [receipt]="receiptData()!"></app-faculty-payment-receipt>
      }
    </div>
  `,
  styles: [
    `
      .page-shell {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .top-actions {
        display: flex;
        justify-content: flex-start;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacultyPaymentReceiptPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private facultyService = inject(FacultyService);
  private facultyReceiptService = inject(FacultyPaymentReceiptService);
  private roleService = inject(RoleService);

  faculty = signal<Faculty | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  receiptData = computed(() => {
    const faculty = this.faculty();
    if (!faculty) {
      return null;
    }

    return this.facultyReceiptService.buildReceipt(faculty, {
      cashierName: 'Accounts Department',
    });
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (this.roleService.isFaculty()) {
      this.loadMyProfile();
      return;
    }

    if (!id) {
      this.error.set('Faculty record not found for receipt generation.');
      return;
    }

    this.loadFacultyById(id);
  }

  onBack(): void {
    if (this.roleService.isFaculty()) {
      this.router.navigate(['/my-faculty-profile']);
      return;
    }

    const faculty = this.faculty();
    if (faculty?._id) {
      this.router.navigate(['/faculty', faculty._id]);
      return;
    }

    this.router.navigate(['/faculty/list']);
  }

  onRetry(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (this.roleService.isFaculty()) {
      this.loadMyProfile();
      return;
    }

    if (id) {
      this.loadFacultyById(id);
    }
  }

  private loadMyProfile(): void {
    this.loading.set(true);
    this.error.set(null);

    this.facultyService.getMyProfile().subscribe({
      next: (response) => {
        if (response.data) {
          this.faculty.set(response.data);
        } else {
          this.error.set('Faculty record not found.');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load your payment receipt.');
        this.loading.set(false);
      },
    });
  }

  private loadFacultyById(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.facultyService.getFacultyById(id).subscribe({
      next: (response) => {
        if (response.data) {
          this.faculty.set(response.data);
        } else {
          this.error.set('Faculty record not found.');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load faculty payment receipt.');
        this.loading.set(false);
      },
    });
  }
}
