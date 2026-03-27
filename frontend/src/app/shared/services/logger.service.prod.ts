import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  log(message: string, _meta?: any): void {}
  error(message: string, _meta?: any): void {}
  warn(message: string, _meta?: any): void {}
  info(message: string, _meta?: any): void {}
}
