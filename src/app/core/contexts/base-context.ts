import { inject, computed } from '@angular/core';
import { injectOutletData } from '@app/core/outlet-data/outlet-data.model';
import { OutletEventService } from '@app/core/outlet-data/outlet-event.service';
import { MenuDataService } from '@app/core/services/menu/menu-data.service';

export function injectBaseContext() {

  const menuService = inject(MenuDataService);
  const outletEvent = inject(OutletEventService);
  const outletData = injectOutletData(); // 기존 함수 호출

  const outletTitle = computed(() => outletData()?.title ?? '');
  const outletTextColor = computed(() => outletData()?.textColor ?? 'text-slate-600');

  return {
    menuService,
    outletEvent,
    outletData,
    outletTitle,
    outletTextColor,
  };
}
