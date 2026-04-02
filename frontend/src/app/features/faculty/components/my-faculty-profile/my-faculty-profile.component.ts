import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { FacultyService } from '../../../../shared/services/faculty.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { Faculty } from '../../models/faculty.model';

@Component({
  selector: 'app-my-faculty-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SharedMaterialModule, LoadingComponent, ErrorMessageComponent],
  templateUrl: './my-faculty-profile.component.html',
  styleUrls: ['./my-faculty-profile.component.scss'],
})
export class MyFacultyProfileComponent implements OnInit {
  private facultyService = inject(FacultyService);
  private router = inject(Router);

  faculty = signal<Faculty | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  paidTotal = computed(() =>
    (this.faculty()?.salaryPayments ?? []).reduce((s, p) => s + p.amount, 0)
  );

  remainingBalance = computed(() =>
    (this.faculty()?.annualSalary ?? 0) - this.paidTotal()
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.facultyService.getMyProfile().subscribe({
      next: (res) => {
        if (res.data) this.faculty.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load your profile. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onChangePassword(): void {
    this.router.navigate(['/auth/change-password']);
  }
}
