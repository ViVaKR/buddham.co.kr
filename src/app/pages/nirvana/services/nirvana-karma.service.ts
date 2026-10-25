import { inject, Service } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { BaseCommandService } from "@app/core/services/base/base-command.service";
import { FormControlsOf } from "@app/core/services/form/generic-form.service";
import { Paths } from "@app/data/menu-data";
import { INirvanaPayload } from "@app/pages/nirvana/interfaces/i-nirvana";
import { NirvanaService } from "@app/pages/nirvana/services/nirvana.service";

@Service()
export class NirvanaKarmaService extends BaseCommandService {
  private readonly service = inject(NirvanaService);
  public override async execute(form: FormGroup<FormControlsOf<INirvanaPayload>>): Promise<boolean> {
    if (this.loading() || form.invalid) {
      form.markAllAsTouched();
      return false;
    }
    this.loading.set(true);
    this.loader.show();

    try {
      const rawValue = form.getRawValue() as INirvanaPayload;
      const res = await this.service.withdraw(rawValue);
      if (res.isSuccess) {
        this.alertService.openSheet([{
          title: '가입이 정상적으로 해제 되었습니다.',
          content: '활동시 작성하신 모든 데이터는 압축하여 가입하신 메일로 전송되었습니다. 재 가입시 필요하오니 소중히 보관하세요'
        }]);
        return true;
      }
      throw new Error(res.message || '가입해제 실패');
    } catch (err: unknown) {

      if (err instanceof Error) {
        this.handleError(err.message);
      } else {
        this.handleSystemError(String(err));
      }
      return false;
    }
    finally {
      this.loading.set(false);
      this.loader.hide();
    }
  }
}
