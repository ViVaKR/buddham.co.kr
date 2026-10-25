import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import localeKo from '@angular/common/locales/ko';
import { routes } from './app.routes';
import { registerLocaleData } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { COMPOSITION_BUFFER_MODE } from '@angular/forms';
import { catchError, lastValueFrom, of, take, throwError, timeout } from 'rxjs';
import { TokenStorage } from '@app/core/services/auth/token.storage';
import { AuthService } from '@app/core/services/auth/auth.service';
import { UserStore } from '@app/core/services/auth/user.store';
import { SignOutService } from '@app/core/services/auth/sign-out.service';
import { TokenService } from '@app/core/services/auth/token.service';
import { tokenInterceptor } from '@app/core/interceptors/token-interceptor';
import { httpErrorInterceptor } from '@app/core/interceptors/http-error-interceptor';

import { MarkedOptions } from 'marked';
import {
  CLIPBOARD_OPTIONS, ClipboardButtonComponent,
  MarkdownModuleConfig, MARKED_OPTIONS, MarkedRenderer, provideMarkdown
} from 'ngx-markdown';

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();
  return {
    renderer: renderer,
    gfm: true,
    breaks: true,
    pedantic: false
  };
}

const markdownConfig: MarkdownModuleConfig = {
  loader: HttpClient,
  markedOptions: {
    provide: MARKED_OPTIONS,
    useFactory: markedOptionsFactory,
    deps: []
  },
  clipboardOptions: {
    provide: CLIPBOARD_OPTIONS,
    useValue: {
      buttonComponent: ClipboardButtonComponent
    }
  }
}
// ──────────────────────────────────────────────────────

registerLocaleData(localeKo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // 에러 처리
    provideZonelessChangeDetection(), // 변경감지
    provideRouter(
      routes,
      withViewTransitions({ skipInitialTransition: true }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withComponentInputBinding(),
    ),
    // ──────────────────────────────────────────────────────
    // 앱 초기화 — 새로고침 세션 복구
    // ──────────────────────────────────────────────────────
    provideAppInitializer(async () => {
      // 앱 초기화 (인증 처리)
      const tokenStorage = inject(TokenStorage);
      const authService = inject(AuthService);
      const userStore = inject(UserStore);
      const signOutService = inject(SignOutService);
      const token = tokenStorage.getAccessToken();
      const tokenService = inject(TokenService);

      if (!token) {
        userStore.setInitialized();
        return Promise.resolve();
      }
      if (tokenStorage.isAccessTokenExpired()) {
        try {
          const result = await lastValueFrom(tokenService.refreshToken());
          if (!result || !result.isSuccess) {
            await signOutService.clearAll();

            userStore.setInitialized();
            return Promise.resolve();
          }
        } catch {
          await signOutService.clearAll();

          userStore.setInitialized();
          return; //  Promise.resolve();
        }
      }

      // 갱신 후 유저 로드
      try {
        const user = await lastValueFrom(
          authService.loadCurrentUser().pipe(
            take(1),
            timeout(10_000), // 10초 타임아웃
            catchError((err) => {
              if (err.name == 'TimeoutError' || err.statusCode === 0) return of(undefined);
              return throwError(() => err);
            }),
          ),
        );

        if (user == null) await signOutService.clearAll();
      } catch (error: any) {
        if (error.status === 401) await signOutService.clearAll();
      } finally {
        userStore.setInitialized();
      }
    }),

    provideHttpClient(withInterceptors([tokenInterceptor, httpErrorInterceptor])),
    { provide: COMPOSITION_BUFFER_MODE, useValue: false },
    { provide: LOCALE_ID, useValue: 'ko-KR' },
    provideMarkdown(markdownConfig)
  ],
};
