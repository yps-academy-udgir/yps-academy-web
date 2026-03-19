import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  log(message: string): void { }
  error(message: string): void { }
  warn(message: string): void { }
  info(message: string): void { }
}
