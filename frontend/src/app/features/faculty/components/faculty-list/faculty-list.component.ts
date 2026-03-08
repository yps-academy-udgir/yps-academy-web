import { Component, OnInit, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SharedMaterialModule } from '../../../../shared/shared-material.module';
import { FacultyService } from '../../../../shared/services/faculty.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Faculty, Department } from '../../models/faculty.model';

@Component({
  selector: 'app-faculty-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, SharedMaterialModule],
  templateUrl: './faculty-list.component.html',
  styleUrls: ['./faculty-list.component.scss'],
})
export class FacultyListComponent implements OnInit {
  private router = inject(Router);
  private facultyService = inject(FacultyService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  searchText = signal<string>('');
  selectedDepartment = signal<string>('');
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);

  departmentOptions = Object.values(Department).map((v) => ({ value: v, label: v }));

  faculty = this.facultyService.faculty;
  loading = this.facultyService.loading;
  error = this.facultyService.error;
  totalRecords = this.facultyService.totalFaculty;

  filteredFaculty = computed(() => {
    const search = this.searchText().toLowerCase();
    const dept = this.selectedDepartment();
    return this.faculty().filter((f) => {
      const matchesSearch =
        !search ||
        f.firstName.toLowerCase().includes(search) ||
        f.lastName.toLowerCase().includes(search) ||
        f.email.toLowerCase().includes(search) ||
        f.contact.includes(search);
      const matchesDept = !dept || f.department === dept;
      return matchesSearch && matchesDept;
    });
  });

  displayedColumns: string[] = ['name','email','contact','department','speciality','experience','actions'];

  constructor() {
    effect(() => {
      if (this.error()) this.notificationService.error(this.error()!);
    });
  }

  ngOnInit(): void { this.loadFaculty(); }

  loadFaculty(): void {
    this.facultyService.getAllFaculty(1, 1000, this.selectedDepartment() || undefined).subscribe();
  }

  getFullName(f: Faculty): string { return f.firstName + ' ' + f.lastName; }

  addFaculty(): void { this.router.navigate(['/faculty/add']); }

  viewFaculty(faculty: Faculty): void { this.router.navigate(['/faculty', faculty._id]); }

  editFaculty(faculty: Faculty): void { this.router.navigate(['/faculty', faculty._id, 'edit']); }

  deleteFaculty(faculty: Faculty): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Faculty',
        message: 'Delete ' + this.getFullName(faculty) + '? This cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.facultyService.deleteFaculty(faculty._id!).subscribe({
          next: () => this.notificationService.success('Faculty member deleted successfully'),
          error: () => this.notificationService.error('Failed to delete faculty member'),
        });
      }
    });
  }
}
