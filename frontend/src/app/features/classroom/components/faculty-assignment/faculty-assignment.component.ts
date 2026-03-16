import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-faculty-assignment',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './faculty-assignment.component.html',
  styleUrls: ['./faculty-assignment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacultyAssignmentComponent {}
