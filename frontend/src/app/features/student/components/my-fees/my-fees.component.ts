import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StudentService } from '../../../../shared/services/student.service';
import { FeeReceiptService } from '../../../../shared/services/fee-receipt.service';
import { FeeReceiptComponent } from '../../../../shared/components/fee-receipt/fee-receipt.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { Student } from '../../../../shared/models/student.model';

@Component({
  selector: 'app-my-fees',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatIconModule, LoadingComponent, ErrorMessageComponent, FeeReceiptComponent],
  templateUrl: './my-fees.component.html',
  styleUrls: ['./my-fees.component.scss'],
})
export class MyFeesComponent implements OnInit {
  private studentService = inject(StudentService);
  private feeReceiptService = inject(FeeReceiptService);
  private router = inject(Router);

  student = signal<Student | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  receiptData = computed(() => {
    const s = this.student();
    return s ? this.feeReceiptService.buildReceipt(s, { cashierName: 'Accounts Department' }) : null;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.studentService.getMe().subscribe({
      next: (res) => {
        this.student.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load fee details. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/my-profile']);
  }
}
