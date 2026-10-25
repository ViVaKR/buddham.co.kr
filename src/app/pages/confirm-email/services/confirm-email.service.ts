import { Service } from '@angular/core';
import { BaseService } from '@services/base/base.service';
import { IConfirmEmailPayload } from '@pages/confirm-email/interfaces/i-confirm-email';
import { IResponse } from '@interfaces/api/i-response';
import { firstValueFrom } from 'rxjs';

@Service()
export class ConfirmEmailService extends BaseService {
  async confirmSendEmail(payload: IConfirmEmailPayload): Promise<IResponse> {
    return await firstValueFrom(this.http.post<IResponse>(`${this.apiUrl}/Auth/ConfirmEmail`, payload));
  }
}
