import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BreadcrumbItem } from '../models/breadcrumb.model';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  breadcrumbs = signal<BreadcrumbItem[]>([]);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs.set(this.createBreadcrumbs(this.activatedRoute.root));
      });
  }

  private createBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: BreadcrumbItem[] = []
  ): BreadcrumbItem[] {
    // Add home/dashboard as first item if we're not already there
    if (breadcrumbs.length === 0 && url !== '/dashboard') {
      breadcrumbs.push({
        label: 'Home',
        url: '/dashboard',
        isClickable: true,
        icon: 'home',
      });
    }

    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url
        .map((segment) => segment.path)
        .join('/');

      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['title'];

      if (label && !breadcrumbs.some((crumb) => crumb.label === label)) {
        breadcrumbs.push({
          label,
          url,
          isClickable: true,
        });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  /**
   * Mark the last breadcrumb as not clickable (current page)
   */
  getBreadcrumbs(): BreadcrumbItem[] {
    const crumbs = this.breadcrumbs();
    if (crumbs.length > 0) {
      return crumbs.map((crumb, index) => ({
        ...crumb,
        isClickable: index < crumbs.length - 1,
      }));
    }
    return crumbs;
  }
}
