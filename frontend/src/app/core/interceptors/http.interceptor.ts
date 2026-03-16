/**
 * HTTP Interceptor
 * Handles common HTTP configurations:
 * - Add authentication headers
 * - Add content-type headers
 * - Handle errors globally
 * - Add request/response logging
 * 
 * Usage: Inject in app.config.ts
 */

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

@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
  private router = inject(Router);

  /**
   * Intercept HTTP requests and responses
   * @param req - HTTP request
   * @param next - HTTP handler for next middleware
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clone request and add common headers
    const clonedReq = this.addHeaders(req);

    // Log request in development
    console.debug('[HTTP Request]', {
      method: clonedReq.method,
      url: clonedReq.url,
      timestamp: new Date().toISOString(),
    });

    return next.handle(clonedReq).pipe(
      // Log successful response
      tap((event) => {
        if (event instanceof HttpResponse) {
          console.debug('[HTTP Response]', {
            method: event.statusText,
            status: event.status,
            url: event.url,
            timestamp: new Date().toISOString(),
          });
        }
      }),

      // Handle errors
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
      }),

      // Cleanup logging
      finalize(() => {
        console.debug('[HTTP Request Complete]', {
          timestamp: new Date().toISOString(),
        });
      })
    );
  }

  /**
   * Add common headers to request
   * @param req - Original HTTP request
   * @returns Modified request with additional headers
   */
  private addHeaders(req: HttpRequest<any>): HttpRequest<any> {
    const token = localStorage.getItem('yps_token');

    // Debug: Log token status
    if (token) {
      console.debug('[HTTP Interceptor] Token found, attaching to request:', req.url);
    } else {
      console.warn('[HTTP Interceptor] No token found in localStorage for request:', req.url);
    }

    // Always attach Authorization header when a token exists
    let clonedReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    // Only add Content-Type and other headers for non-multipart requests
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

  /**
   * Global error handler
   * @param error - HTTP error response
   * @returns Observable that throws error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.status === 0) {
      // Network error
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.status === 400) {
      // Bad request
      errorMessage = error.error?.error || 'Invalid request';
    } else if (error.status === 401) {
      // Unauthorized — clear session and redirect to public website
      errorMessage = 'Unauthorized access. Please login again.';
      localStorage.removeItem('yps_token');
      localStorage.removeItem('yps_user');
      this.router.navigate(['/website']);
    } else if (error.status === 403) {
      // Forbidden
      errorMessage = 'You do not have permission to access this resource.';
    } else if (error.status === 404) {
      // Not found
      errorMessage = 'Resource not found.';
    } else if (error.status === 500) {
      // Server error
      errorMessage = 'Server error. Please try again later.';
    } else if (error.status >= 400) {
      // Generic client error
      errorMessage = error.error?.error || `Error code: ${error.status}`;
    } else if (error.status >= 500) {
      // Generic server error
      errorMessage = 'Server error. Please try again later.';
    }

    console.error('[HTTP Error]', {
      status: error.status,
      statusText: error.statusText,
      message: errorMessage,
      url: error.url,
      timestamp: new Date().toISOString(),
    });

    // Return error observable
    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      originalError: error,
    }));
  }

  /**
   * Get authentication token (placeholder)
   * @returns Token string or empty
   */
  private getToken(): string {
    // Implement token retrieval from localStorage/sessionStorage
    // const token = localStorage.getItem('auth_token');
    // return token || '';
    return '';
  }
}
