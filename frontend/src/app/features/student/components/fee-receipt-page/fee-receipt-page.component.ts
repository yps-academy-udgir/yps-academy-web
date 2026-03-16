import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Student } from '../../../../shared/models/student.model';
import { StudentService } from '../../../../shared/services/student.service';
import { FeeReceiptService } from '../../../../shared/services/fee-receipt.service';
import { FeeReceiptComponent } from '../../../../shared/components/fee-receipt/fee-receipt.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-fee-receipt-page',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    ErrorMessageComponent,
    FeeReceiptComponent,
  ],
  templateUrl: './fee-receipt-page.component.html',
  styleUrl: './fee-receipt-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeeReceiptPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  private feeReceiptService = inject(FeeReceiptService);

  student = signal<Student | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  receiptData = computed(() => {
    const student = this.student();
    if (!student) {
      return null;
    }

    return this.feeReceiptService.buildReceipt(student, {
      cashierName: 'Accounts Department',
    });
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/students', 'management', 'list']);
      return;
    }

    this.loadStudent(id);
  }

  onBack(): void {
    const student = this.student();
    if (student?._id) {
      this.router.navigate(['/students', 'management', student._id]);
      return;
    }

    this.router.navigate(['/students', 'management', 'list']);
  }

  onRetry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStudent(id);
    }
  }

  private loadStudent(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.studentService.getStudentById(id).subscribe({
      next: (response) => {
        if (response.data) {
          this.student.set(response.data);
        } else {
          this.error.set('Student record not found.');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load fee receipt.');
        this.loading.set(false);
      },
    });
  }
}