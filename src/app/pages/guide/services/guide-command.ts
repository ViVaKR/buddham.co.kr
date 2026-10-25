import { inject, Service } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormControlsOf } from '@app/core/services/form/generic-form.service';
import { BaseCommandService } from '@services/base/base-command.service';
import { IGuidePayload } from '@interfaces/api/request/i-guide.request';
import { GuideService } from '@pages/guide/services/guide.service';

@Service()
export class GuideCommand extends BaseCommandService {
  private readonly service = inject(GuideService);
  public override async execute(
    form: FormGroup<FormControlsOf<IGuidePayload>>,
    id: number | string | null | undefined,
  ): Promise<boolean> {
    if (this.loading() || form.invalid) {
      form.markAllAsTouched();
      this.alertService.openSheet([
        {
          title: '이미 진행 중이거나 잘못된 요청입니다.',
          content: '잠시후 다시 진행하여 주세요',
        },
      ]);
      return false;
    }

    // 페이로드 가공
    const rawValue = form.getRawValue();
    const payload = id ? ({ id, ...rawValue } as IGuidePayload) : (rawValue as IGuidePayload);

    // 비즈니스 로직
    const res = await this.service.createOrUpdate(payload, id);

    if (res.isSuccess) {
      this.alertService.openSheet([
        {
          title: id ? '안내가 수정되었습니다.' : '새로운 안내가 등록되었습니다.',
          content: res.message,
        },
      ]);
      return true;
    } else {
      // 실패 처리
      this.alertService.openSheet([
        {
          title: id ? '안내 수정에 실패하였습니다.' : '새로운 안내 등록에 실패하였습니다.',
          content: `${res.message}, ${res.validationErrors}, ${res.traceId}`,
        },
      ]);
      return false;
    }
  }
}
