import { Service } from '@angular/core';
import { IResponse } from '@app/core/interfaces/api/i-response';
import { BaseService } from '@app/core/services/base/base.service';
import { INirvanaPayload } from '@app/pages/nirvana/interfaces/i-nirvana';
import { firstValueFrom } from 'rxjs';

@Service()
export class NirvanaService extends BaseService {
  async withdraw(payload: INirvanaPayload): Promise<IResponse> {
    const res = await firstValueFrom(this.http.post<IResponse>(`${this.apiUrl}/Auth/Withdraw`, payload));
    return res;
  }
}
