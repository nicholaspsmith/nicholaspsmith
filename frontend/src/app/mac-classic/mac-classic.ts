import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-mac-classic',
  templateUrl: './mac-classic.html',
  styleUrl: './mac-classic.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MacClassic {
  private sanitizer = inject(DomSanitizer);

  readonly isLoading = signal(true);
  readonly emulatorUrl: SafeResourceUrl;

  constructor() {
    this.emulatorUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://jamesfriend.com.au/pce-js/pce-js-apps/'
    );
  }

  onIframeLoad(): void {
    this.isLoading.set(false);
  }
}
