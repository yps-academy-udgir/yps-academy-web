import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { PwaUpdateService } from './core/services/pwa-update.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
  private readonly themeService = inject(ThemeService);
  private readonly pwaUpdateService = inject(PwaUpdateService);

  constructor() {
    this.pwaUpdateService.initialize();
  }

  protected isUpdateAvailable(): boolean {
    return this.pwaUpdateService.updateAvailable();
  }

  protected applyAppUpdate(): void {
    this.pwaUpdateService.applyUpdate();
  }

  protected dismissAppUpdateBanner(): void {
    this.pwaUpdateService.dismissUpdateBanner();
  }
}
