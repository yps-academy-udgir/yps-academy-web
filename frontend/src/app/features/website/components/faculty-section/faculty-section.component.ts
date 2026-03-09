import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacultyMember } from '../../models/website.models';
import { SharedMaterialModule } from '../../../../shared/shared-material.module';

@Component({
  selector: 'app-faculty-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SharedMaterialModule],
  templateUrl: './faculty-section.component.html',
  styleUrls: ['./faculty-section.component.scss'],
})
export class FacultySectionComponent {
  activeIndex = signal(0);

  faculty: FacultyMember[] = [
    { id: 1, name: 'Prof. Rajesh Sharma', subject: 'Mathematics', qualification: 'M.Sc. Mathematics, B.Ed', experience: '18 Years', initials: 'RS', color: '#3f51b5' },
    { id: 2, name: 'Dr. Priya Mehta', subject: 'Science', qualification: 'Ph.D. Chemistry, M.Sc', experience: '14 Years', initials: 'PM', color: '#e91e63' },
    { id: 3, name: 'Mr. Amit Desai', subject: 'English', qualification: 'M.A. English Literature', experience: '12 Years', initials: 'AD', color: '#4caf50' },
    { id: 4, name: 'Mrs. Sunita Patil', subject: 'Social Studies', qualification: 'M.A. History, B.Ed', experience: '10 Years', initials: 'SP', color: '#ff9800' },
    { id: 5, name: 'Mr. Vivek Joshi', subject: 'Physics', qualification: 'M.Sc. Physics, GATE', experience: '16 Years', initials: 'VJ', color: '#9c27b0' },
    { id: 6, name: 'Ms. Kavita Rao', subject: 'Biology', qualification: 'M.Sc. Botany, B.Ed', experience: '11 Years', initials: 'KR', color: '#00bcd4' },
  ];

  prev(): void {
    this.activeIndex.update((i) => (i - 1 + this.faculty.length) % this.faculty.length);
  }

  next(): void {
    this.activeIndex.update((i) => (i + 1) % this.faculty.length);
  }

  visibleFaculty(): FacultyMember[] {
    const start = this.activeIndex();
    const result: FacultyMember[] = [];
    for (let i = 0; i < 3; i++) {
      result.push(this.faculty[(start + i) % this.faculty.length]);
    }
    return result;
  }
}
