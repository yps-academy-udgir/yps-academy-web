import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';

@Injectable({
  providedIn: 'root',
})
export class PwaUpdateService {
  private readonly swUpdate = inject(SwUpdate);

  private initialized = false;
  readonly updateAvailable = signal(false);

  initialize(): void {
    if (this.initialized || !this.swUpdate.isEnabled) {
      return;
    }

    this.initialized = true;

    this.swUpdate.versionUpdates.subscribe((event) => {
      if (event.type === 'VERSION_READY') {
        this.markUpdateAvailable(event);
      }
    });

    // Check soon after startup, then periodically for new deploys.
    setTimeout(() => {
      this.swUpdate.checkForUpdate().catch(() => {});
    }, 60000);

    setInterval(() => {
      this.swUpdate.checkForUpdate().catch(() => {});
    }, 5 * 60 * 1000);
  }

  applyUpdate(): void {
    // Reload to activate the latest cached app version.
    window.location.reload();
  }

  dismissUpdateBanner(): void {
    this.updateAvailable.set(false);
  }

  private markUpdateAvailable(event: VersionReadyEvent): void {
    this.updateAvailable.set(true);
  }
}