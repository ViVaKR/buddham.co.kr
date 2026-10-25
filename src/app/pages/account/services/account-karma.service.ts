import { Service } from "@angular/core";
import { IDataResponse, IResponse } from "@app/core/interfaces/api/i-response";
import { BaseService } from "@app/core/services/base/base.service";
import { IUserInfoPayload, IUserInfoView } from "@app/pages/user-info/interfaces/i-user-info";
import { firstValueFrom } from "rxjs";

@Service()
export class AccountKarmaService extends BaseService {

  async updateUserInfo(payload: IUserInfoPayload): Promise<IResponse> {
    return await firstValueFrom(
      this.http.put<IResponse>(`${this.apiUrl}/User/Update`, payload)
    );
  }

  async readById(id: string | number): Promise<IDataResponse<IUserInfoView>> {
    return await firstValueFrom(this.http.get<IDataResponse<IUserInfoView>>(`${this.apiUrl}/User/Read/${id}`));
  }
}
