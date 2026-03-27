import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggerService } from '../../shared/services/logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);

  handleError(error: any): void {
    const message = error?.message || (typeof error === 'string' ? error : 'Unknown client error');
    const stack = error?.stack;
    this.logger.error(message, { stack });
    // Also log to console for visibility
    console.error(error);
  }
}
