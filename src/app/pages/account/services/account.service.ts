import { Service } from '@angular/core';
import { BaseCursorPagedService } from '@services/base/base-cursor-paged.service';
import { IUserPayload, IUserView } from '@interfaces/api/models/i-user.model';

@Service()
export class AccountService extends BaseCursorPagedService<IUserView, IUserPayload> {
  protected override controller = 'User';
}
