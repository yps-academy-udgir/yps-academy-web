import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeeService, FeeDefaulter } from '../../../../shared/services/fee.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-fee-defaulters',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './fee-defaulters.component.html',
  styleUrls: ['./fee-defaulters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeeDefaultersComponent implements OnInit {
  private feeService = inject(FeeService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  loading = signal(false);
  allDefaulters = signal<FeeDefaulter[]>([]);
  classFilter = signal('');

  displayedColumns = ['name', 'class', 'contact', 'totalFees', 'paid', 'pending', 'actions'];
  classOptions = ['5th', '6th', '7th', '8th', '9th', '10th'];

  filtered = computed((): FeeDefaulter[] => {
    const cls = this.classFilter();
    return cls
      ? this.allDefaulters().filter((d) => d.academicDetails?.class === cls)
      : this.allDefaulters();
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.feeService.getFeeDefaulters().subscribe({
      next: (res) => { this.allDefaulters.set(res.data); this.loading.set(false); },
      error: () => { this.notification.error('Failed to load defaulters'); this.loading.set(false); },
    });
  }

  viewStudent(id: string): void {
    this.router.navigate(['/students/management', id]);
  }

  back(): void {
    this.router.navigate(['/students/fees/dashboard']);
  }
}
