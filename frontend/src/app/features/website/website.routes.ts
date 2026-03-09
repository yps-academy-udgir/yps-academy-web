import { Routes } from '@angular/router';

export const WEBSITE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/website-shell/website-shell.component').then(
        (m) => m.WebsiteShellComponent
      ),
  },
];
