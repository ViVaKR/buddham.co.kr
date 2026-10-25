import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { BodyLayout } from '@layout/body-layout/body-layout';
import { TitleLayout } from '@layout/title-layout/title-layout';
import { UserStore } from '@services/auth/user.store';
import { FormBuilder, Validators } from '@angular/forms';
import { LoaderService } from '@services/ui/loader.service';
import { AlertService } from '@services/ui/alert.service';
import { SignOutService } from '@services/auth/sign-out.service';
import { catchError, EMPTY, exhaustMap, filter, finalize, from, Observable, Subject, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IChangePasswordRequest } from '@interfaces/api/request/i-auth.request';
import { UserService } from '@services/auth/user.service';
import { IResponse } from '@interfaces/api/i-response';
import { MATERIAL_COMMON } from '@shared/imports/material-imports';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'change-password',
  imports: [BodyLayout, TitleLayout, ...MATERIAL_COMMON, CommonModule],
  templateUrl: './change-password.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './change-password.scss',
})
export default class ChangePassword {
  private fb = inject(FormBuilder);
  private loader = inject(LoaderService);
  private alertService = inject(AlertService);

  private userService = inject(UserService);
  private logoutService = inject(SignOutService);

  private userStore = inject(UserStore);

  hidePassword = signal(true);
  isSubmiting = signal<boolean>(false);
  currentUser = this.userStore.user;

  readonly form = this.createForm();

  public changePassword$ = new Subject<void>();

  constructor() {
    this.syncUserEmail();
    this.handlePasswordChange();
  }

  // 📝 폼 생성
  private createForm() {
    return this.fb.nonNullable.group({
      email: ['', Validators.required],
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
    });
  }

  // 🔄 이메일 동기화
  private syncUserEmail(): void {
    effect(() => {
      const email = this.currentUser()?.email;
      if (email) {
        this.form.patchValue({ email }, { emitEvent: false });
      }
    });
  }

  // 🔐 비밀번호 변경 핸들러
  private handlePasswordChange(): void {
    this.changePassword$
      .pipe(
        filter(() => this.validateAndMarkForm()),
        tap(() => this.showLoader()),
        exhaustMap(() => this.changePassword()),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  // ✅ 폼 검증
  private validateAndMarkForm(): boolean {
    if (this.form.valid) return true;
    this.form.markAllAsTouched();
    return false;
  }

  // 🔄 로더 표시
  private showLoader(): void {
    this.isSubmiting.set(true);
    this.loader.show();
  }

  // 🔐 비밀번호 변경 요청
  private changePassword() {
    const formValue = this.form.getRawValue() as IChangePasswordRequest;
    const request: IChangePasswordRequest = { ...formValue };
    return from(this.userService.changePassword(request)).pipe(
      tap((res) => this.handleSuccess(res)),
      catchError((err) => this.handleError(err)),
      finalize(() => this.hideLoader()),
    );
  }

  // ✅ 성공 핸들러
  private async handleSuccess(res: IResponse): Promise<void> {
    const isSuccess = res.isSuccess;
    this.showAlert(isSuccess ? ' 비밀번호 변경 완료' : '비밀번호 변경 실패', res.message);
    if (isSuccess) {
      await this.logoutService.forceSignOut();
    }
  }

  // ❌ 에러 핸들러
  private handleError(err: any): Observable<never> {
    this.showAlert('에러 발생', err?.message ?? '비밀번호 변경 실패');
    return EMPTY;
  }

  // 🔄 로더 숨김
  private hideLoader(): void {
    this.isSubmiting.set(false);
    this.loader.hide();
  }

  // 📢 알림 표시
  private showAlert(title: string, content: string): void {
    this.alertService.openSheet([{ title, content }]);
  }

  resetForm() {
    this.form.reset({
      email: this.currentUser()?.email,
    });
  }

  hasError(control: string, state: string) {
    const ctrl = this.form.get(control);
    return !!(ctrl?.hasError(state) && (ctrl.dirty || ctrl.touched));
  }

  togglePassword(event: Event) {
    event.preventDefault();
    this.hidePassword.update((value) => !value);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.changePassword$.next();
  }
}
