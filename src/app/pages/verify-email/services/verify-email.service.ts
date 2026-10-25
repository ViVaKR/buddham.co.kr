import { Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IVerifyEmailPayload } from '../interfaces/i-verify-email';
import { IResponse } from '@app/core/interfaces/api/i-response';
import { BaseService } from '@app/core/services/base/base.service';

@Service()
export class VerifyEmailService extends BaseService {
  /** 이메일 인증 요청 메일 발송 */
  async verifySendEmail(payload: IVerifyEmailPayload): Promise<IResponse> {
    return await firstValueFrom(this.http.post<IResponse>(`${this.apiUrl}/Auth/VerifySendEmail`, payload));
  }
}
