import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthStore } from '@app/core/services/auth/auth.store';
import { MenuMain } from '../menu-main/menu-main';
import { UiUxService } from '@app/core/services/ui/ui-ux.service';
import MenuAccount from '@app/layout/menu-account/menu-account';
import MenuMainHamburger from '../menu-main-hamburger/menu-main-hamburger';
import MenuAuth from '@app/layout/menu-auth/menu-auth';
@Component({
  selector: 'menu-bar',
  imports: [MatIcon, RouterLink, MenuMain, MenuAccount, MenuAuth, MenuMainHamburger],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './menu-bar.html',
  styleUrl: './menu-bar.scss',
})
export class MenuBar {
  private readonly authStore = inject(AuthStore);
  private readonly uiuxService = inject(UiUxService);
  isLoggedIn = this.authStore.isLoggedIn;
  isMobile = this.uiuxService.isMobile;
}
