import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { AcademicYearService, PromotionPreview, PromotionResult } from '../../../shared/services/academic-year.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-promote-year',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedMaterialModule],
  templateUrl: './promote-year.component.html',
  styleUrls: ['./promote-year.component.scss'],
})
export class PromoteYearComponent implements OnInit {
  private svc  = inject(AcademicYearService);
  private notif = inject(NotificationService);

  // Build list of upcoming academic years (current year through +2)
  readonly yearOptions: string[] = (() => {
    const base = new Date().getFullYear();
    return [0, 1, 2].map((i) => {
      const y = base + i;
      return `${y}-${y + 1}`;
    });
  })();

  selectedYear     = signal<string>(this.yearOptions[0]);
  preview          = signal<PromotionPreview | null>(null);
  loading          = signal(false);
  promoting        = signal(false);
  promoted         = signal(false);
  promotionResult  = signal<PromotionResult | null>(null);

  canProceed = computed(() => {
    const p = this.preview();
    return p !== null && p.canProceed && !this.promoted();
  });

  ngOnInit(): void {
    this.loadPreview();
  }

  onYearChange(year: string): void {
    this.selectedYear.set(year);
    this.preview.set(null);
    this.promoted.set(false);
    this.promotionResult.set(null);
    this.loadPreview();
  }

  loadPreview(): void {
    this.loading.set(true);
    this.svc.getPromotionPreview(this.selectedYear()).subscribe({
      next: (res) => {
        this.preview.set(res.data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.notif.error(err?.error?.message ?? 'Failed to load preview');
        this.loading.set(false);
      },
    });
  }

  promote(): void {
    if (!this.canProceed()) return;
    this.promoting.set(true);
    this.svc.promote(this.selectedYear()).subscribe({
      next: (res) => {
        this.promotionResult.set(res.data);
        this.promoted.set(true);
        this.promoting.set(false);
        this.notif.success(`Promotion complete! ${res.data.promoted} promoted, ${res.data.graduated} graduated.`);
      },
      error: (err: any) => {
        this.notif.error(err?.error?.message ?? 'Promotion failed');
        this.promoting.set(false);
      },
    });
  }
}
