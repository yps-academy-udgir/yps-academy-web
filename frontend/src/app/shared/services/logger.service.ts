import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/logs/client`;
  private enabled = !!environment.enableLogging;

  private send(level: string, message: string, meta?: any) {
    if (!this.enabled) return;
    try {
      // fire-and-forget
      this.http.post(this.api, { level, message, meta }).subscribe({ error: () => {} });
    } catch (e) {
      // swallow
    }
  }

  log(message: string, meta?: any): void {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
    this.send('info', message, meta);
  }

  error(message: string, meta?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
    this.send('error', message, meta);
  }

  warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
    this.send('warn', message, meta);
  }

  info(message: string, meta?: any): void {
    console.info(`[INFO] ${new Date().toISOString()}: ${message}`);
    this.send('info', message, meta);
  }
}
