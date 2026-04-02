import {
  ApplicationConfig,
  ErrorHandler,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { AppHttpInterceptor } from './core/interceptors/http.interceptor';
import { GlobalErrorHandler } from './core/handlers/global-error.handler';

/**
 * Application Configuration
 * Configures Angular providers and features
 * - Zone change detection (optional, for better performance)
 * - HTTP client with custom interceptor
 * - Material animations
 * - Router with application routes
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Enable optional zone change detection for performance optimization
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Provide animations for Material components
      provideAnimationsAsync(),
    // Provide HTTP client for API calls with interceptor support
    provideHttpClient(withInterceptorsFromDi()),
    // Register custom HTTP interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppHttpInterceptor,
      multi: true,
    },
    // Provide application routes
    provideRouter(routes),
    // Global client-side error handler
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
