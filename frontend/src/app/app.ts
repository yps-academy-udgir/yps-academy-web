import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { PwaUpdateService } from './core/services/pwa-update.service';
import { PwaInstallService } from './core/services/pwa-install.service';

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
  private readonly pwaInstallService = inject(PwaInstallService);

  constructor() {
    this.pwaUpdateService.initialize();
    this.pwaInstallService.initialize();
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

  protected canInstallApp(): boolean {
    return this.pwaInstallService.canInstall() && !this.pwaInstallService.isStandalone();
  }

  protected installApp(): void {
    this.pwaInstallService.promptInstall();
  }
}
