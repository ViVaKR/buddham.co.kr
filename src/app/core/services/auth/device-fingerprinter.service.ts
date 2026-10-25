import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DeviceFingerprinterService {

  async generateFingerprint(): Promise<string> {

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency,
    ].join('|')

    const hashBuffer = await crypto.subtle.digest(
      'SHA-512',
      new TextEncoder().encode(fingerprint)
    );

    return [...new Uint8Array(hashBuffer)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  public loadFingerprint = async () => await this.generateFingerprint();

}
