import { Pipe, PipeTransform } from '@angular/core';
import { IUserInfoView } from '@app/pages/user-info/interfaces/i-user-info';
import { environment } from '@env/environment';

@Pipe({ name: 'avatarUrl' })
export class AvatarUrlPipe implements PipeTransform {
  transform(user: IUserInfoView | null): string {
    if (!user || !user.avatar) {
      return 'assets/images/boy-2.webp';
    }
    return `${environment.api.main}/Avatars/${user.id}/${user.avatar}`;
  }
}
