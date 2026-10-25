import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AuthStore } from '@app/core/services/auth/auth.store';
import { UserStore } from '@app/core/services/auth/user.store';
import { BaseNavigatorService } from '@app/core/services/base/base-navigator.service';
import { MenuDataService } from '@app/core/services/menu/menu-data.service';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

@Component({
  selector: 'menu-auth',
  imports: [...MATERIAL_COMMON],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './menu-auth.html',
  styleUrl: './menu-auth.scss',
})
export default class MenuAuth extends BaseNavigatorService {
  readonly authStore = inject(AuthStore);
  readonly userStore = inject(UserStore);
  private readonly menuData = inject(MenuDataService);
  readonly authGroup = this.menuData.authGroup;
}
