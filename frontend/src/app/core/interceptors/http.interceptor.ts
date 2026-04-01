import { Injectable, inject } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoggerService } from '../../shared/services/logger.service';

@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private logger = inject(LoggerService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const clonedReq = this.addHeaders(req);

    // Skip logging for logger API calls to prevent infinite loop
    const isLogRequest = req.url.includes('/logs');

    if (!isLogRequest) {
      this.logger.info('HTTP Request', { method: clonedReq.method, url: clonedReq.url, timestamp: new Date().toISOString() });
    }

    return next.handle(clonedReq).pipe(
      tap((event) => {
        if (event instanceof HttpResponse && !isLogRequest) {
          this.logger.info('HTTP Response', { status: event.status, url: event.url, timestamp: new Date().toISOString() });
        }
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      finalize(() => { if (!isLogRequest) this.logger.info('HTTP Request Complete', { timestamp: new Date().toISOString() }); })
    );
  }

  private addHeaders(req: HttpRequest<any>): HttpRequest<any> {
    const token = localStorage.getItem('yps_token');

    let clonedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    if (!clonedReq.headers.has('Content-Type') && !(req.body instanceof FormData)) {
      clonedReq = clonedReq.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-App-Version': '1.0.0',
          'X-Timestamp': new Date().toISOString(),
        },
      });
    }

    return clonedReq;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.status === 400) {
      errorMessage = error.error?.error || 'Invalid request';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized access. Please login again.';
      localStorage.removeItem('yps_token');
      localStorage.removeItem('yps_user');
      this.router.navigate(['/website']);
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to access this resource.';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.status >= 400) {
      errorMessage = error.error?.error || `Error code: ${error.status}`;
    }

    this.logger.error('HTTP Error', { status: error.status, statusText: error.statusText, message: errorMessage, url: error.url, timestamp: new Date().toISOString() });

    return throwError(() => ({ status: error.status, message: errorMessage, originalError: error }));
  }

  private getToken(): string {
    return '';
  }
}
