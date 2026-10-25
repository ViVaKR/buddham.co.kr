import { Component, computed, effect, inject, input } from '@angular/core';
import { BaseFormDirective } from '@directives/base-form.directive';
import { Paths } from '@data/menu-data';
import { BodyLayout } from '@layout/body-layout/body-layout';
import { TitleLayout } from '@layout/title-layout/title-layout';
import { catchError, combineLatest, EMPTY, exhaustMap, filter, finalize, of, shareReplay, Subject, switchMap, tap } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { UserInfoService } from '@app/pages/user-info/services/user-info.service';
import { IUserInfoUpdateRole, IUserInfoView } from '@app/pages/user-info/interfaces/i-user-info';
import { MatChipInputEvent } from '@angular/material/chips';
import { IResponse } from '@app/core/interfaces/api/i-response';
import { environment } from '@env/environment';
import { CommonModule } from '@angular/common';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { FormControlsOf, GenericFormService } from '@app/core/services/form/generic-form.service';
import { createUserInfoConfig } from '@app/pages/user-info/services/user-info.config';
import { UserStore } from '@app/core/services/auth/user.store';

@Component({
  selector: 'user-info-karma',
  imports: [
    BodyLayout,
    TitleLayout,
    CommonModule,
    ...MATERIAL_COMMON],
  templateUrl: './user-info-karma.html',
  styleUrl: './user-info-karma.scss',
})
export default class UserInfoKarma extends BaseFormDirective {
  readonly title = Paths.UserInfo.ko;
  readonly color = Paths.UserInfo.color;
  private service = inject(UserInfoService);
  private fbService = inject(GenericFormService);
  readonly matcher = this.fbService.matcher;
  readonly id = input<string | undefined>(undefined, {});
  readonly returnUrl = input<string | undefined>(undefined, {});
  readonly listUrl = computed(() => this.returnUrl() || Paths.Home.url);

  // private formDirective = viewChild<FormGroupDirective>(FORM_TEMPLATES.DIRECTIVE_NAME);
  private readonly formConfig = createUserInfoConfig();

  public baseUrl = environment.api.main;
  private defaultAvatar = environment.assets.defaultAvatar;
  private reload$ = new Subject<void>();
  private updateRoles$ = new Subject<void>();

  // 폼 선언 (roles는 문자열 배열)
  form: FormGroup<FormControlsOf<IUserInfoUpdateRole>> = this.fbService.build(this.formConfig);

  private userDetail$ = combineLatest([
    toObservable(this.id).pipe(filter((id) => !!id)),
    toObservable(this.service.mutatedTrigger),
  ]).pipe(
    switchMap(([id]) => {
      return this.service.getById(id!).pipe(catchError(() => of(null)));
    }),
    // 데이터가 성공적으로 로드되었을 때 딱 한 번 폼에 값을 주입
    tap((res) => {
      if (res?.isSuccess && res?.content) {
        const user = res.content as IUserInfoView;
        // user.roles가 객체 배열 구조라면 string[]로 변환해서 매핑해야함.
        // 여기서는 user.roles가 문자열 배열이거나, string[] 추출이 가능하다고 가정
        const roleStrings = user.roles?.map((r: any) => (typeof r === 'object' ? r.en : r)) || [];

        this.form.patchValue({
          id: user.id.toString(),
          roles: roleStrings,
        });
      }
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  response = toSignal(this.userDetail$, { initialValue: null });

  userInfo = computed<IUserInfoView | null | undefined>(() => {
    const res = this.response();
    if (res?.isSuccess && res?.content) {
      return res.content as IUserInfoView;
    }
    return null;
  });

  readonly userStore = inject(UserStore);

  constructor() {
    super();
    effect(() => {
      if (this.service.mutatedTrigger() > 0) {
        this.service.reload();
      }
    });

    this.updateRoles$
      .pipe(
        filter(() => {
          if (this.form.invalid) {
            this.form.markAllAsDirty();
            return false;
          }
          return true;
        }),
        tap(() => this.loader.show()),
        exhaustMap(() => {
          const { id, roles } = this.form.getRawValue();
          return this.service.updateUserRoles(id, { id, roles }).pipe(
            tap((res: IResponse) => {
              if (res.isSuccess) {
                this.alertService
                  .openSheet([{ title: '권한 변경완료', content: res.message }])
                  .then((r) => console.log(r));
                this.reload$.next();
              } else {
                this.alertService
                  .openSheet([{ title: '권한 변경실패', content: res.message }])
                  .then((r) => console.log(r));

                this.reload$.next();
              }
            }),
            catchError((err) => {
              this.alertService
                .openSheet([
                  {
                    title: '에러발생',
                    content: err?.message,
                  },
                ])
                .then((r) => console.log(r));
              return EMPTY;
            }),
            finalize(() => this.loader.hide()),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  getAvatar() {
    const user = this.userInfo();
    if (!user) return `${this.baseUrl}/Avatars/buddha.png`;

    if (user.avatar?.charAt(0) !== '/') return this.defaultAvatar;
    return `${this.baseUrl}${user.avatar}`;
  }

  addRole(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const currentRoles: string[] = this.form.get('roles')?.value || [];
      // 중복 방지 로직 추가
      if (!currentRoles.includes(value)) {
        this.form.patchValue({
          roles: [...currentRoles, value],
        });
      }
    }
    event.chipInput!.clear();
  }

  removeRole(role: string): void {
    const currentRoles: string[] = this.form.get('roles')?.value || [];
    const updatedRoles = currentRoles.filter((r) => r !== role);
    this.form.patchValue({ roles: updatedRoles });
  }

  goList() {
    this.navigator.byUrl(this.listUrl());
  }

  async onRestoreUser(userId: string) {
    const ok = await this.alertService.openConfirm('복구하시겠습니까?');
    if (!ok) return;

    const result = await this.service.restoreById(userId);

    if (result.isSuccess) {
      await this.alertService.openSheetAsync([
        {
          title: '계정 복구 완료',
        },
      ]);
      // this.navigator.replace(this.listUrl());
      this.reload$.next();
    } else {
      await this.alertService.openSheetAsync([
        {
          title: '계정 복구 실패',
        },
      ]);
    }
  }

  async onDeleteUser(userId: string): Promise<void> {
    const ok = await this.alertService.openConfirm('삭제 하시겠습니까?');
    if (!ok) return;
    const result = await this.service.deleteById(userId);
    if (result.isSuccess) {
      await this.alertService.openSheet([
        {
          title: '계정 삭제 완료',
          content: `ID ${userId.toUpperCase()} 회원 삭제완료`,
        },
      ]);
      // this.navigator.replace(this.listUrl());
      this.reload$.next();
    } else {
      await this.alertService.openSheet([
        {
          title: '계정 삭제 불가회원 또는 삭제 실패',
          content: `ID ${result.message} 회원 삭제실패`,
        },
      ]);
    }
  }

  /** 회원정보 수정 */
  async goToVipassana(userId: string) {
    await this.router.navigate([`${Paths.Account.url}/karma`, userId], {
      queryParams: { returnUrl: this.listUrl() },
    });
  }
  override async onSubmit(event: MouseEvent): Promise<void> {
    event.preventDefault();
    this.updateRoles$.next();
  }
}
