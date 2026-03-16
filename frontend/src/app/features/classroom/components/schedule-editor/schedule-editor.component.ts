import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-schedule-editor',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './schedule-editor.component.html',
  styleUrls: ['./schedule-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleEditorComponent {}
