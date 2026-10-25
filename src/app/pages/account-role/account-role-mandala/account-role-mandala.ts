import { Component, ChangeDetectionStrategy } from '@angular/core';
import { injectBaseContext } from '@app/core/contexts/base-context';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';

@Component({
  selector: 'account-role-mandala',
  imports: [BodyLayout, TitleLayout],
  templateUrl: './account-role-mandala.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './account-role-mandala.scss',
})
export default class AccountRoleMandala {
  title = Paths.AccountRole.ko;
  color = Paths.AccountRole.color;
  protected base = injectBaseContext();
}
