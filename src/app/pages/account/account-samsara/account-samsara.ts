import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Paths } from '@app/data/menu-data';
import { AccordionTable } from '@app/layout/accordion-table/accordion-table';
import { ACCOUNT_USER_COLUMNS } from '@app/layout/table-columns/account-user.columns';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { LoadingErrorWrapper } from '@app/layout/loading-error-wrapper/loading-error-wrapper';
import { TitleLayout } from '@app/layout/title-layout/title-layout';
import { AccountService } from '@app/pages/account/services/account.service';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';

@Component({
  selector: 'account-samsara',
  imports: [
    CommonModule,
    ...MATERIAL_COMMON,
    BodyLayout,
    TitleLayout,
    AccordionTable
  ],
  templateUrl: './account-samsara.html',
  styleUrl: './account-samsara.scss',
})
export default class AccountSamsara {

  readonly title = Paths.Account.ko;
  readonly service = inject(AccountService);
  readonly routre = inject(Router);
  readonly detailUrl = `${Paths.Account.url}`;
  readonly columns = ACCOUNT_USER_COLUMNS;

  onSearch = (keyword: string) => this.service.search(keyword);
  ngOnInit = () => this.service.reload();
  onCreate = () => this.routre.navigate([Paths.Account.url, Paths.AccountRoleKarma.url]);
}
