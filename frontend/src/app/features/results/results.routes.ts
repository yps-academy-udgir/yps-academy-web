import { Routes } from '@angular/router';

export const RESULTS_ROUTES: Routes = [
	{
		path: '',
		redirectTo: 'list',
		pathMatch: 'full',
	},
	{
		path: 'enter',
		loadComponent: () =>
			import('./components/enter-results/enter-results.component').then(
				(m) => m.EnterResultsComponent
			),
		data: { title: 'Enter Results' },
	},
	{
		path: 'list',
		loadComponent: () =>
			import('./components/results-list/results-list.component').then(
				(m) => m.ResultsListComponent
			),
		data: { title: 'Results List' },
	},
];
