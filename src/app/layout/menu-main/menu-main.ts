import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MenuDataService } from '@app/core/services/menu/menu-data.service';
import { UiUxService } from '@app/core/services/ui/ui-ux.service';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

@Component({
  selector: 'menu-main',
  imports: [...MATERIAL_COMMON],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './menu-main.html',
  styleUrl: './menu-main.scss',
})
export class MenuMain {
  private readonly menuData = inject(MenuDataService);
  private readonly uiuxServie = inject(UiUxService);
  navGroup = this.menuData.navGroup;
  isMobile = this.uiuxServie.isMobile;
  isTablet = this.uiuxServie.isTablet;
}
