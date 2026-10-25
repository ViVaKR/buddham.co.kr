import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { IBottomSheet } from '@app/core/interfaces/ui/i-bottom-sheet';
import { AlertService } from '@app/core/services/ui/alert.service';
import { catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
export const SKIP_ERROR_POPUP = new HttpContextToken<boolean>(() => false);

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const alertService = inject(AlertService);
  return next(req).pipe(

    map(event => {
      if (event instanceof HttpResponse) {
        const body = event.body;
        if (isNginxHtmlResponse(body)) {
          throw new HttpErrorResponse({
            error: 'Nginx 또는 서버가 JSON 대신 HTML 에러 페이지를 반환했습니다.',
            status: 404, // 적당한 에러 코드로 위장
            statusText: 'Not Found (HTML Fallback)',
            url: event.url || ''
          });
        }
      }
      return event;
    }),

    catchError((error: HttpErrorResponse) => {
      if (req.url.includes('/Auth/RefreshToken')) {
        return throwError(() => error);
      }

      if (req.context.get(SKIP_ERROR_POPUP)) {
        return throwError(() => error);
      }

      // ✅ msg를 바로 할당
      let msg: IBottomSheet[] = [{ title: '오류', content: '알 수 없는 오류가 발생했습니다.', success: false }];

      switch (error.status) {
        // ========== 🌐 네트워크 오류 ==========
        case 0:
          {
            msg = [{ title: '(0) 네트워크 오류', content: '인터넷 연결을 확인해주세요', success: false }];
          }
          break;

        // ========== 🔒 인증 오류 ==========
        case 401: {
          return throwError(() => error);
        }

        // ========== 🚫 권한 오류 ==========
        case 403:
          {
            msg = [{ title: '(403) 접근 거부', content: `접근할 권한이 없습니다: ${error.message}`, success: false }];
          }
          break;

        // ========== ❌ 요청 오류 (400번대) ==========
        case 400:
          {
            // 🎯 ASP.NET Core Validation 에러 파싱
            msg = parseValidationError(error);
          }
          break;

        case 404:
          {
            msg = [
              {
                title: '(404) 찾을 수 없음',
                content: '요청한 리소스를 찾을 수 없습니다.',
                success: false,
              },
            ];
          }
          break;

        case 409:
          {
            msg = [
              {
                title: '(409) 중복 오류',
                content: error.error?.message || '이미 존재하는 데이터 입니다.',
                success: false,
              },
            ];
          }
          break;

        // ========== 💥 서버 오류 (500번대) ==========
        case 500:
          {
            msg = [
              {
                title: `(500) 서버 오류 (${error.status})`,
                content: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도하여 주세요.',
                success: false,
              },
            ];
          }
          break;
        default:
          {
            const errorBody = error.error;
            if (isNginxHtmlResponse(errorBody)) {
              console.warn('⚠️ Nginx가 API 응답 대신 HTML(index.html)을 반환했습니다. 주소를 확인하세요.');
              return throwError(() => error);
            }

            // 진짜 찐 대포 에러일 때만 팝업 띄우기
            const message = `== ${parseErrorMessage(error)} ==`;
            msg = [{ title: `Default 오류 (${error.status})`, content: message, success: false }];
          }
          break;
      }

      alertService.openSheet(msg);

      // ❗ 에러 다시 던지기 (중요!)
      return throwError(() => error);
    }),
  );
};

// ========== 🛠️ 헬퍼 함수 ==========

/** ASP.NET Core ValidationProblem 파싱 */
function parseValidationError(error: HttpErrorResponse): IBottomSheet[] {
  const errorBody = error.error; // .NET 의 Result 객체
  if (errorBody?.errors && typeof errorBody.errors === 'object') {
    const errors = errorBody.errors;
    const messages = Object.keys(errors)
      .map((key) => {
        const errorMessages = errors[key];
        return Array.isArray(errorMessages) ? errorMessages.join('\n') : errorMessages;
      })
      .join('\n');

    return [
      {
        title: errorBody.title || '입력 오류',
        content: messages || '입력 데이터를 확인해주세요.',
        success: false,
      },
    ];
  }

  // 2️⃣ 커스텀 메시지
  if (errorBody?.message) {
    return [{ title: '요청 오류', content: errorBody.message, success: false, },];
  }

  // 3️⃣ 단순 문자열
  if (typeof errorBody === 'string') {
    return [{ title: '요청 오류', content: errorBody, success: false },];
  }

  // 4️⃣ 기본 메시지
  return [{ title: '요청 오류', content: '잘못된 요청입니다.', success: false },];
}

/**
 * 일반 에러 메시지 파싱
 */
function parseErrorMessage(error: HttpErrorResponse): string {
  const errorBody = error.error;
  // 🎯 .NET 미들웨어가 던진 Result<T> 내부의 메시지 최우선 파싱
  if (errorBody && typeof errorBody === 'object') {
    if (errorBody.message) return errorBody.message;
    if (errorBody.Message) return errorBody.Message; // 대소문자 방어벽
  }

  // 1️⃣ error.error가 문자열
  if (typeof error.error === 'string') {
    return error.error;
  }

  // 2️⃣ error.error.message 존재
  if (error.error?.message) {
    return error.error.message;
  }

  // 3️⃣ error.error.title 존재 (ASP.NET ProblemDetails)
  if (error.error?.title) {
    return error.error.title;
  }

  // 4️⃣ error.message (HttpErrorResponse 자체)
  if (error.message) {
    return error.message;
  }

  // 5️⃣ 기본 메시지
  return '요청 처리 중 오류가 발생했습니다.';
}
// 헬퍼 함수로 통합
function isNginxHtmlResponse(body: unknown): boolean {
  return typeof body === 'string'
    && (body.includes('<!DOCTYPE') || body.includes('<html'));
}
