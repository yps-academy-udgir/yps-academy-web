import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FeeService, BackendFeeSummary, FeeSummaryClass } from '../../../../shared/services/fee.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-fee-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './fee-dashboard.component.html',
  styleUrls: ['./fee-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeeDashboardComponent implements OnInit {
  private feeService = inject(FeeService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  loading = signal(false);
  summary = signal<BackendFeeSummary | null>(null);

  classRows = computed((): FeeSummaryClass[] => {
    const s = this.summary();
    if (!s) return [];

    return Object.entries(s.byClass)
      .map(([className, row]) => ({ class: className, ...row }))
      .sort((a, b) => a.class.localeCompare(b.class, undefined, { numeric: true }));
  });

  totals = computed(() => this.summary()?.totals ?? null);
  hasClassData = computed(() => this.classRows().length > 0);

  collectionRate = computed(() => {
    const t = this.totals();
    if (!t || !t.totalFees) return 0;
    return Math.round((t.collected / t.totalFees) * 100);
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.feeService.getFeesSummary().subscribe({
      next: (res) => { this.summary.set(res.data); this.loading.set(false); },
      error: () => { this.notification.error('Failed to load fee summary'); this.loading.set(false); },
    });
  }

  goToDefaulters(): void {
    this.router.navigate(['/students/fees/defaulters']);
  }
}
