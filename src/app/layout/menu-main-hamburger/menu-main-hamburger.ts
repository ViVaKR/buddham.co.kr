import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MenuDataService } from '@app/core/services/menu/menu-data.service';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

@Component({
  selector: 'menu-main-hamburger',
  imports: [...MATERIAL_COMMON],
  templateUrl: './menu-main-hamburger.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './menu-main-hamburger.scss',
})
export default class MenuMainHamburger {
  private readonly menuData = inject(MenuDataService);
  navGroup = this.menuData.navGroup;
}
