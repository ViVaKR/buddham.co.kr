import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';
import { AccountRoleService } from '@app/pages/account-role/services/account-role.service';
import { AccordionTable } from '@app/layout/accordion-table/accordion-table';
import { ACCOUNT_ROLE_COLUMNS } from '@app/layout/table-columns/account-role.columns';
import { ScrollTo } from '@app/layout/scroll-to/scroll-to';
import { LoadingErrorWrapper } from '@app/layout/loading-error-wrapper/loading-error-wrapper';
import { Router } from '@angular/router';
import { MATERIAL_COMMON } from '@shared/imports/material-imports';

@Component({
  selector: 'account-role',
  imports: [
    CommonModule,
    ...MATERIAL_COMMON,
    BodyLayout,
    TitleLayout,
    AccordionTable,
    ScrollTo,
  ],
  templateUrl: './account-role.html',
  styleUrl: './account-role.scss',
})
export default class AccountRole implements OnInit {
  readonly title = Paths.AccountRole.ko;
  readonly service = inject(AccountRoleService);
  readonly routre = inject(Router);
  readonly detailUrl = `${Paths.Account.url}/${Paths.AccountRoleKarma.url}`;
  readonly columns = ACCOUNT_ROLE_COLUMNS;

  onSearch = (keyword: string) => this.service.search(keyword);
  loadMore = () => this.service.loadMore();
  nextPage = () => this.loadMore();
  prePage = () => this.service.prevPage();
  ngOnInit = () => this.service.reload();
  goCreateRole = () => this.routre.navigate([Paths.Account.url, Paths.AccountRoleKarma.url]);
}
