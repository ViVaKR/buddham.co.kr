import { inject, Injectable, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IBottomSheet } from '@app/core/interfaces/ui/i-bottom-sheet';
import { BaseNavigatorService } from '@app/core/services/base/base-navigator.service';
import { FormControlsOf } from '@app/core/services/form/generic-form.service';
import { AlertService } from '@app/core/services/ui/alert.service';
import { LoaderService } from '@app/core/services/ui/loader.service';
import { EMPTY } from 'rxjs';

@Injectable()
export abstract class BaseCommandService<T extends Record<string, any> = any> {

  // ────────────────────────────────────────────────────────
  // 🛡️ [해탈의 핵심] 상속을 과감히 빼고, inject로 세련되게 주입받기!
  // ────────────────────────────────────────────────────────
  protected readonly navigator = inject(BaseNavigatorService);
  protected readonly loader = inject(LoaderService);
  protected readonly alertService = inject(AlertService);

  public readonly loading = signal(false);

  protected handleSystemError(message: string, title: string = '알 수 없는 시스템 오류가 발생했습니다.') {
    const msg: IBottomSheet[] = [{ title: title, content: message }];
    this.alertService.openSheet(msg)
    this.loading.set(false);
    return EMPTY;
  }

  protected handleError(message: string, title: string = '오류') {
    const msg: IBottomSheet[] = [{ title: title, content: message }];
    this.alertService.openSheet(msg)
    this.loading.set(false);
    return EMPTY;
  }

  protected handleSuccess(message: string, title: string = "성공") {
    const msg: IBottomSheet[] = [{ title: title, content: message }];
    this.alertService.openSheet(msg)
    this.loading.set(false);
  }

  protected handleNavigate(path: string | any[], message: string, title: string = "성공") {
    this.handleSuccess(message, title)
    this.navigator.to(path);
  }
  // ────────────────────────────────────────────────────────
  // 🎯 [화룡점정] 제네릭 T를 활용해 FormGroup의 타입을 완벽하게 구체화!
  // ────────────────────────────────────────────────────────
  /**
   * 모든 커맨드가 공통으로 지켜야 할 궁극의 규격 사양서입니다.
   * 가변 인자(...args)는 뒤에 무엇이든 더 유연하게 받을 수 있도록 문을 열어둡니다.
   */
  public abstract execute(form: FormGroup<FormControlsOf<T>>, ...args: any[]): Promise<any>;
}
