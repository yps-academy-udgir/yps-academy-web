import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';

@Injectable({
  providedIn: 'root',
})
export class PwaUpdateService {
  private readonly swUpdate = inject(SwUpdate);

  private initialized = false;
  private periodicCheckTimer: ReturnType<typeof setInterval> | null = null;
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

    // Check immediately, then periodically for new deploys.
    this.checkForUpdateSafe();

    this.periodicCheckTimer = setInterval(() => {
      this.checkForUpdateSafe();
    }, 60 * 1000);

    window.addEventListener('focus', () => this.checkForUpdateSafe());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkForUpdateSafe();
      }
    });
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

  private checkForUpdateSafe(): void {
    this.swUpdate.checkForUpdate().catch(() => {});
  }
}