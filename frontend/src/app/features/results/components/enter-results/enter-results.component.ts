import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MarksEntryComponent } from '../../../../shared/components/marks-entry/marks-entry.component';

@Component({
	selector: 'app-enter-results',
	imports: [MarksEntryComponent],
	templateUrl: './enter-results.component.html',
	styleUrl: './enter-results.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnterResultsComponent {}
