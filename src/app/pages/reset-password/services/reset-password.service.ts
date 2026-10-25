import { Service } from '@angular/core';
import { IResetPasswordMessage, IResetPasswordPayload } from '../interfaces/i-reset-password';
import { BaseService } from '@app/core/services/base/base.service';
import { IDataResponse } from '@interfaces/api/i-response';
import { firstValueFrom } from 'rxjs';

@Service()
export class ResetPasswordService extends BaseService {
    async resetPassword(
        payload: IResetPasswordPayload,
    ): Promise<IDataResponse<IResetPasswordMessage>> {
        return await firstValueFrom(
            this.http.post<IDataResponse<IResetPasswordMessage>>(
                `${this.apiUrl}/Auth/ResetPassword`,
                payload,
            ),
        );
    }
}
