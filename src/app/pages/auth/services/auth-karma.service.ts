import { Service } from '@angular/core';
import { IDataResponse } from '@app/core/interfaces/api/i-response';
import { BaseService } from '@app/core/services/base/base.service';
import { IUserInfoView } from '@app/pages/user-info/interfaces/i-user-info';
import { firstValueFrom } from 'rxjs';

@Service()
export class AuthKarmaService extends BaseService {


  // checkPseudonym(pseudonym: string): Observable<boolean> {
  //   return this.http.get<boolean>(`${this.apiUrl}/Auth/${pseudonym}`);
  // }
  async readById(id: string | number): Promise<IDataResponse<IUserInfoView>> {
    return await firstValueFrom(this.http.get<IDataResponse<IUserInfoView>>(`${this.apiUrl}/Auth/Read/${id}`));
  }
}
