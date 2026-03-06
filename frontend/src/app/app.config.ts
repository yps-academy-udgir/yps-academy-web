import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


import { routes } from './app.routes';
import { AppHttpInterceptor } from './core/interceptors/http.interceptor';

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
    // Provide HTTP client for API calls
    provideHttpClient(),
    // Register custom HTTP interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppHttpInterceptor,
      multi: true,
    },
    // Provide application routes
    provideRouter(routes),
  ],
};
