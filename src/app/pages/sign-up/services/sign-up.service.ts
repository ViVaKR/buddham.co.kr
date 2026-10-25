import { Injectable } from '@angular/core';
import { IResponse } from '@app/core/interfaces/api/i-response';
import { ISignUpRequest } from '@app/core/interfaces/api/request/i-auth.request';

import { BaseService } from '@app/core/services/base/base.service';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class SignUpService extends BaseService {
  signUp(data: ISignUpRequest): Observable<IResponse> {
    return this.http.post<IResponse>(`${this.apiUrl}/Auth/SignUp`, data);
  }
}
