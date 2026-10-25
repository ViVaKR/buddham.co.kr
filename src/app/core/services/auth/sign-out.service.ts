import { inject, Injectable, Service } from '@angular/core';
import { IResponse } from '@app/core/interfaces/api/i-response';
import { AuthStore } from '@app/core/services/auth/auth.store';
import { TokenStorage } from '@app/core/services/auth/token.storage';
import { UserStore } from '@app/core/services/auth/user.store';
import { BaseService } from '@app/core/services/base/base.service';
import { Paths } from '@app/data/menu-data';
import { catchError, finalize, firstValueFrom, of } from 'rxjs';

@Service()
export class SignOutService extends BaseService {
  readonly tokenStorage = inject(TokenStorage);
  readonly authStore = inject(AuthStore);
  readonly userStore = inject(UserStore);

  async signOut() {
    try {
      await firstValueFrom(
        this.http.post<IResponse>(`${this.apiUrl}/Auth/SignOut`, {})
          .pipe(catchError(() => of({} as IResponse)))
      );
    } catch (e) {
      // TODO
      console.error(e);
    } finally {
      await this.clearAll({ reload: false }); // 일반 로그아웃은 부드럽게 라우팅 이동
    }
  }
  // 2. 🌟 비밀번호 변경 등 시스템이 강제로 로그아웃 시킬 때 (컨펌창 없음!)
  async forceSignOut() {
    try {
      // 💡 HTTP 요청이 완료될 때까지 await로 꽉 잡아둡니다! (타이밍 유령 진압)
      await firstValueFrom(
        this.http
          .post<IResponse>(`${this.apiUrl}/Auth/SignOut`, {})
          .pipe(catchError(() => of({} as IResponse))),
      );
    } finally {
      // 💡 서버 응답이 성공하든 실패하든 확실하게 메모리 청소하고 전진!
      await this.clearAll({ reload: false });
    }
  }

  async clearAll(options: { reload: boolean } = { reload: false }) {
    this.tokenStorage.clear();
    this.authStore.clear();
    this.userStore.clear();

    if (options.reload) {
      // 회원탈퇴 등 앱 전체를 완전히 깨끗하게 리셋하고 싶을 때 (Warm Reload)
      window.location.href = '/';
    } else {
      // 일반적인 로그아웃은 SPA답게 부드럽게 라우터 이동
      await this.navigator.replace([Paths.Home.url]);
    }
  }
}
