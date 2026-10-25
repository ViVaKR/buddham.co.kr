import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IUserRoleBase, IUserRolePayload } from '@app/core/interfaces/api/models/i-user-role.model';
import { BaseCommandService } from '@app/core/services/base/base-command.service';
import { FormControlsOf } from '@app/core/services/form/generic-form.service';
import { AccountRoleService } from '@app/pages/account-role/services/account-role.service';

@Injectable({ providedIn: 'root' })
export class AccountRoleKarmaService extends BaseCommandService {

  private readonly service = inject(AccountRoleService);

  public async execute(
    form: FormGroup<FormControlsOf<IUserRoleBase>>,
    id: string | undefined | null
  ): Promise<boolean> {

    // 2. 가드 구문 (Guard Clause) 처리: 부모의 loading 시그널과 폼 유효성 검사
    if (this.loading() || form.invalid) {
      form.markAllAsTouched();
      this.alertService.openSheet([{
        title: '이미 진행중이거나, 잘못된 요청입니다.',
        content: '잠시후 다시 진행하여 주세요!'
      }]);
      return false;
    }

    // 3. 페이로드 가공 (비구조화 할당으로 깔끔하게 처리)
    const rawValue = form.getRawValue();
    const payload = id ? { id, ...rawValue } as IUserRolePayload : rawValue as IUserRolePayload;

    // 4. 비즈니스 로직 실행
    // 부모 서비스(BaseGenericService) 내부에서 이미 로더 제어 및 내부 상태 변경(mutatedTrigger)이 일어남!
    const res = await this.service.createOrUpdate(payload, id);

    if (res.isSuccess) {
      // 성공 처리
      // 부모 서비스가 mutatedTrigger 를 울렸기 때문에 리스트는 알아서 새로고침 됨!
      this.alertService.openSheet([{
        title: id ? '역할 정보가 수정되었습니다.' : '새로운 역할이 등록되었습니다.',
        content: res.message
      }]);
      return true;
    } else {
      // 실패 처리
      this.alertService.openSheet([
        {
          title: id ? '역할 정보 수정에 실패하였습니다.' : '새로운 역할 등록에 실패하였습니다.',
          content: `${res.message}, ${res.validationErrors}, ${res.traceId}`
        }
      ]);
      return false;
    }
  }
}
