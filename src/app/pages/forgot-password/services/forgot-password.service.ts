import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IForgotPasswordMessage, IForgotPasswordPayload } from '../interfaces/i-forgot-password';
import { IDataResponse } from '@app/core/interfaces/api/i-response';
import { BaseService } from '@app/core/services/base/base.service';

@Injectable({ providedIn: 'root' })
export class ForgotPasswordService extends BaseService {
  async forgotPassword(
    payload: IForgotPasswordPayload,
  ): Promise<IDataResponse<IForgotPasswordMessage>> {
    return await firstValueFrom(
      this.http.post<IDataResponse<IForgotPasswordMessage>>(
        `${this.apiUrl}/Auth/ForgotPassword`,
        payload,
      ),
    );
  }
}
