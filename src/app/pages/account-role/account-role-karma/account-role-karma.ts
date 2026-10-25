import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { injectBaseContext } from '@app/core/contexts/base-context';
import { BaseFormDirective } from '@app/core/directives/base-form.directive';
import { IUserRoleBase } from '@app/core/interfaces/api/models/i-user-role.model';
import { FormControlsOf, GenericFormService } from '@app/core/services/form/generic-form.service';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';
import { createAccountRoleConfig } from '@app/pages/account-role/services/account-role-karma.config';
import { AccountRoleKarmaService } from '@app/pages/account-role/services/account-role-karma.service';
import { AccountRoleService } from '@app/pages/account-role/services/account-role.service';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { catchError, filter, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'account-role-karma',
  imports: [BodyLayout, TitleLayout, CommonModule, ...MATERIAL_COMMON],
  templateUrl: './account-role-karma.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './account-role-karma.scss',
})
export default class AccountRoleKarma extends BaseFormDirective {
  title = Paths.AccountRole.ko;
  color = Paths.AccountRole.color;
  protected base = injectBaseContext();

  private formDirective = viewChild<FormGroupDirective>('formDirective');
  private fbService = inject(GenericFormService);
  private command = inject(AccountRoleKarmaService);
  readonly matcher = this.fbService.matcher;
  private readonly formConfig = createAccountRoleConfig();

  form: FormGroup<FormControlsOf<IUserRoleBase>> = this.fbService.build(this.formConfig);

  readonly service = inject(AccountRoleService);

  id = signal<string | null | undefined>(this.route.snapshot.paramMap.get('id'));
  listUrl = signal<string>(
    this.route.snapshot.queryParamMap.get('returnUrl') || Paths.AccountRole.url,
  );

  checkName = signal<boolean>(false);

  readonly data = toSignal(
    toObservable(this.id).pipe(
      // id 가 존재할 때만 스트림 진행 (null, undefined 방어)
      filter((id): id is string => !!id),
      // id 가 바뀌면 이전 요청은 취소하고 새로운 API 호출
      switchMap((id) =>
        this.service.getById(id).pipe(
          // 정상응답 가공
          map((res) => (res.isSuccess ? (res.content ?? null) : null)),
          catchError((err) => {
            console.error(err);
            return of(null);
          }),
        ),
      ),
    ),
    { initialValue: null }, // 초기값 세팅
  );

  public isEditMode = signal<boolean>(false);

  constructor() {
    super();
    effect(() => {
      const userRoleData = this.data();
      if (userRoleData) {
        this.form.patchValue(userRoleData);
      }
    });
  }

  ngOnInit() {
    this.isEditMode.set(!!this.id());
  }
  hasError(field: keyof IUserRoleBase, error: string): boolean {
    return this.fbService.hasError(this.form, field as string, error, this.formDirective());
  }

  hasAnyError(field: keyof IUserRoleBase): boolean {
    return this.fbService.hasAnyError(this.form, field as string, this.formDirective());
  }

  errorMessage(field: keyof IUserRoleBase): string {
    return this.fbService.getErrorMessage(this.form, field as string);
  }

  isPending(field: string): boolean {
    return this.fbService.isPending(this.form, field);
  }

  async onDelete(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const id = this.id();
    if (!id) return;
    const result = await this.service.deleteById(id);
    if (result) {
      this.navigator.byUrl(this.listUrl());
    }
  }

  async onSubmit(event: MouseEvent): Promise<void> {
    event.preventDefault();
    this.fbService.markAllTouched(this.form);
    const result = await this.command.execute(this.form, this?.id() ?? null);
    if (result) {
      this.navigator.byUrl(this.listUrl());
    }
  }
}
