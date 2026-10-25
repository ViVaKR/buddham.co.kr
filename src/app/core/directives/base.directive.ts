import { Directive, inject } from '@angular/core';
import { injectOutletData } from '@app/core/outlet-data/outlet-data.model';
import { MenuDataService } from '@app/core/services/menu/menu-data.service';

@Directive({ selector: '[vivBaseDirective]' })
export class BaseDirective {
  public outletData = injectOutletData();
  public menuService = inject(MenuDataService);
}
