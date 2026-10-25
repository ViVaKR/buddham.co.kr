import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@app/core/services/auth/auth.store';
import { UserStore } from '@app/core/services/auth/user.store';
import { MenuDataService } from '@app/core/services/menu/menu-data.service';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

@Component({
  selector: 'menu-account',
  imports: [...MATERIAL_COMMON],
  templateUrl: './menu-account.html',
  styleUrl: './menu-account.scss',
})
export default class MenuAccount {
  readonly router = inject(Router);
  readonly authStore = inject(AuthStore);
  readonly userStore = inject(UserStore);
  private readonly menuService = inject(MenuDataService);
  readonly accountGroup = this.menuService.accountGroup;

  currentUser = computed(() => this.userStore.user());
  avatar = computed(() => this.userStore.avatar());
  isAdmin = computed(() => this.userStore.isAdmin());

  isLoggedIn = this.authStore.isLoggedIn;
  readonly char = '❈';

  async goTo(url?: string) {
    await this.router.navigate([url]);
  }
}
