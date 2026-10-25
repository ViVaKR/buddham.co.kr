import { Injectable, signal } from '@angular/core';
import { IDataResponse, IResponse } from '@app/core/interfaces/api/i-response';
import { BaseService } from '@app/core/services/base/base.service';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable()
export abstract class BaseGenericService<TView, TPayload> extends BaseService {
  protected abstract readonly controller: string;
  protected get apiBase(): string {
    return `${this.apiUrl}/${this.controller}`;
  }

  readonly mutatedTrigger = signal(0);

  /** 진행바 */
  public readonly isMutating = signal<boolean>(false);

  /** [단건 조회] */
  public getById(id: number | string): Observable<IDataResponse<TView>> {
    return this.http.get<IDataResponse<TView>>(`${this.apiBase}/Read/${id}`);
  }

  /** [생성 / 수정] */
  public async createOrUpdate<PCustom = TPayload>(payload: PCustom,
    id?: number | string | null | undefined,
  ): Promise<IResponse> {

    const url = id ? `${this.apiBase}/Update` : `${this.apiBase}/Create`;
    this.isMutating.set(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const apiRequest = id
        ? await firstValueFrom(this.http.put<IResponse>(url, payload))
        : await firstValueFrom(this.http.post<IResponse>(url, payload));

      const [res] = await Promise.all([apiRequest, minDelay]);
      if (res.isSuccess) this.notifyMutation();

      return res;
    } catch (err: any) {
      return {
        isSuccess: false,
        message: err?.error?.message || err?.message || '요청 처리 중 서버 에러가 발생했습니다.',
        code: err?.status || 500,
      } as IResponse;
    } finally {
      // 2. 성공하든 에러가 나든(Finally) 무조건 로딩 오프! (안전장치)
      this.isMutating.set(false);
    }
  }

  /** 복구 */
  public async restoreById(id: number | string): Promise<IResponse> {
    const url = `${this.apiBase}/Restore/${id}`;
    this.isMutating.set(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const apiRequest = await firstValueFrom(this.http.put<IResponse>(url, {}));
      console.log('===> ', apiRequest);
      const [res] = await Promise.all([apiRequest, minDelay]);
      if (res.isSuccess) this.notifyMutation();
      return res;
    } catch (err: any) {
      return {
        isSuccess: false,
        message: err?.error?.message || err?.message || '복구 중 에러가 발생했습니다.',
        code: err?.status || 500,
      } as IResponse;
    }

    finally {
      this.isMutating.set(false);
    }

  }

  /** [삭제] */
  public async deleteById(id: number | string): Promise<IResponse> {
    const url = `${this.apiBase}/Delete/${id}`;
    // 요청 출발 직전에 로딩 온
    this.isMutating.set(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const apiRequest = await firstValueFrom(this.http.delete<IResponse>(url));
      const [res] = await Promise.all([apiRequest, minDelay]);
      if (res.isSuccess) this.notifyMutation();
      return res;
    } catch (err: any) {
      return {
        isSuccess: false,
        message: err?.error?.message || err?.message || '삭제 중 에러가 발생했습니다.',
        code: err?.status || 500,
      } as IResponse;
    } finally {
      this.isMutating.set(false);
    }
  }

  /** [갱신 알림 내부 로직] */
  private notifyMutation(): void {
    // 1. 트리거 시그널 카운트를 올려 구독 중인 모든 연관 컴포넌트/리소스에 알림
    this.mutatedTrigger.update((v) => v + 1);
    // 2. 하위 클래스에서 커스텀 로직을 쓸 수 있도록 기존 추상 메소드 훅 실행
    this.onMutated();
  }

  /** [갱신] 자식 클래스에서 필요 시 확장 구현할 추상 메소드 */
  protected abstract onMutated(): void;
}
