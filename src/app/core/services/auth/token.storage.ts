import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStorage {

  private ACCESS_TOKEN = 'access_token';
  private REFRESH_TOKEN = 'refresh_token';

  // 🔒 XSS 방지를 위해 토큰을 sanitize
  private sanitizeToken(token: string): string {
    return token.replace(/[<>]/g, '');
  }

  // 🔹 Access Token 저장
  saveAccessToken(token: string) {
    localStorage.setItem(this.ACCESS_TOKEN, this.sanitizeToken(token));
  }

  // 🔹 Refresh Token 저장
  saveRefreshToken(token: string) {
    localStorage.setItem(this.REFRESH_TOKEN, token);
  }

  // 🔹 (선택) 두 토큰 한번에 저장
  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN, refreshToken);
  }

  // 🔹 토큰 존재 여부 체크
  hasTokens(): boolean {
    return this.getAccessToken() !== null && this.getRefreshToken() !== null;
  }

  // 🔹 Access Token 조회
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN);
  }

  // 🔹 Refresh Token 조회
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  // 🔹 토큰 만료 체크 (JWT 디코딩)
  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  clear() {
    localStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
  }
}

