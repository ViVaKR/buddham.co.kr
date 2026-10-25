import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class BaseNavigatorService {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);

  /** 단순 경로 이동 */
  to(path: string | any[]) {
    const commands = Array.isArray(path) ? path : [path];
    this.router.navigate(commands).then((isSuccess) => {
      if (!isSuccess) {
        // TODO: 이동실패 메시지
      }
    });
  }

  byUrl(url: string) {
    this.router.navigateByUrl(url).then((isSuccess) => {
      if (!isSuccess) {
        //TODO
      }
    });
  }

  /** 현재 경로 기반 상대 이동 */
  toRelative(path: string | any[]) {
    const commands = Array.isArray(path) ? path : [path];
    this.router.navigate(commands, { relativeTo: this.activatedRoute }).then((r) => {
      if (!r) {
        // TODO
      }
    });
  }

  /** 쿼리 파라미터를 포함한 유도 (필터링 등) */
  withParams(path: string[], params: object) {
    this.router.navigate(path, { queryParams: params, queryParamsHandling: 'merge' }).then((r) => {
      if (!r) {
        // TODO
      }
    });
  }

  /** 히스토리를 남기지 않고 이동 (주로 로그인 성공 후나 리다이렉트 시 사용) */
  replace(path: string | any[]) {
    const commands = Array.isArray(path) ? path : [path];
    this.router.navigate(commands, { replaceUrl: true }).then((r) => {
      if (!r) {
        // TODO
      }
    });
  }

  /** URL에 노출되지 않는 상태(State) 데이터와 함께 이동 */
  withState(path: string | any[], stateData: any) {
    const commands = Array.isArray(path) ? path : [path];
    this.router.navigate(commands, { state: stateData }).then((r) => {
      if (!r) {
        // TODO
      }
    });
  }

  /** 이전 페이지로 회항 */
  back() {
    this.location.back();
  }
}
