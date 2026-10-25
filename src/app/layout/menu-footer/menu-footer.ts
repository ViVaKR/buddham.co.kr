import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BaseNavigatorService } from '@app/core/services/base/base-navigator.service';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

@Component({
  selector: 'menu-footer',
  imports: [...MATERIAL_COMMON],
  templateUrl: './menu-footer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './menu-footer.scss',
})
export class MenuFooter {
  navigator = inject(BaseNavigatorService);
  year = new Date().getFullYear();
}
