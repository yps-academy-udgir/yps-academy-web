import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarksEntryComponent } from '../../../../shared/components/marks-entry/marks-entry.component';

@Component({
  selector: 'app-enter-marks',
  standalone: true,
  imports: [CommonModule, MarksEntryComponent],
  templateUrl: './enter-marks.component.html',
  styleUrls: ['./enter-marks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnterMarksComponent {}
