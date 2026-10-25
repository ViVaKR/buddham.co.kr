import { inject, Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class IconService {
  private matIconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  registerIcons() {
    this.matIconRegistry.addSvgIcon(
      'logo-64',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/logos/logo-64.svg')
    );
  }
}
