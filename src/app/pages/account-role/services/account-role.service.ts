import { Service } from '@angular/core';
import { IUserRolePayload, IUserRoleView } from '@app/core/interfaces/api/models/i-user-role.model';
import { BaseOffsetPagedService } from '@app/core/services/base/base-offset-paged.service';
import { Observable } from 'rxjs';

@Service()
export class AccountRoleService extends BaseOffsetPagedService<IUserRoleView, IUserRolePayload> {
  protected override controller = 'UserRole';
  checkName(name: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiBase}/CheckName/${name}`)
  }
}
