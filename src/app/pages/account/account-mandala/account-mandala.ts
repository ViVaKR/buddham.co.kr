import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { BaseDirective } from '@app/core/directives/base.directive';
import { IDataResponse } from '@app/core/interfaces/api/i-response';
import { IFileRequest } from '@app/core/interfaces/api/request/i-file.request';
import { TruncatePipe } from '@app/core/pipes/truncate-pipe';
import { UserStore } from '@app/core/services/auth/user.store';
import { BaseNavigatorService } from '@app/core/services/base/base-navigator.service';
import { FileUploadService } from '@app/core/services/file/file-upload-service';
import { AlertService } from '@app/core/services/ui/alert.service';
import { LoaderService } from '@app/core/services/ui/loader.service';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { catchError, finalize, Observable, of } from 'rxjs';
import { ScrollTo } from '@app/layout/scroll-to/scroll-to';
import { Router } from '@angular/router';

@Component({
  selector: 'account-mandala',
  imports: [
    BodyLayout,
    TitleLayout,
    ...MATERIAL_COMMON,
    CommonModule,
    TruncatePipe, ScrollTo],
  templateUrl: './account-mandala.html',
  styleUrl: './account-mandala.scss',
  hostDirectives: [BaseDirective],
})
export default class AccountMandala {

  title = Paths.Account.title;
  color = Paths.Account.color;
  private readonly userStore = inject(UserStore);
  readonly fileService = inject(FileUploadService);
  readonly alert = inject(AlertService);
  protected loader = inject(LoaderService);
  readonly navigator = inject(BaseNavigatorService);
  public readonly loading = signal(false);
  isShow = signal<boolean>(false);

  dailySutra = `모든 존재는 무상하다. 정진하여 해탈을 이루라.
 諸行無常 — 제행무상, 시생멸법 (是生滅法)`;

  errorMessage = signal('');
  fileSize = signal({ formatedSize: '0 Bytes', size: 0 });
  selectedFile = signal<File | null>(null);
  readonly allowed = ['.jpg', '.jpeg', '.png', '.webp'];

  currentUser = computed(() => this.userStore.user());
  avatar = computed(() => this.userStore.avatar());

  previewUrl = signal<string | null>(null);

  readonly hasPreview = computed(() => !!this.previewUrl());

  toggleEdit() {
    this.isShow.update((v) => !v);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const result = this.fileService.validateFile(file, 50);

    if (!result.valid) {
      this.errorMessage.set(result.error ?? '아바타 파일 검증 실패');
      return;
    }
    const preUrl = this.previewUrl();
    if (preUrl) URL.revokeObjectURL(preUrl);

    this.selectedFile.set(file);

    const newUrl = URL.createObjectURL(file);
    this.previewUrl.set(newUrl);

    this.fileSize.set({
      formatedSize: this.fileService.formatFileSize(file.size),
      size: file.size,
    });
  }

  // ── 업로드 액션 ──────────────────────────────────────────────────────────
  uploadAvatar(): void {
    this.doUpload();
  }

  // ── 업로드 처리 ─────────────────────────────────────────────────────
  private doUpload(): void {

    if (this.loading()) return;
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('파일을 먼저 선택해 주세요.');
      return;
    }
    this.errorMessage.set('');

    this.loading.set(true);
    this.loader.show();

    const upload$: Observable<IDataResponse<IFileRequest> | null> = this.fileService.uploadAvatar(file);

    upload$
      .pipe(
        catchError((err) => {
          this.errorMessage.set(err.message ?? '업로드 실패');
          return of(null);
        }),
        finalize(() => {
          this.reset();
          this.loading.set(false);
          this.loader.hide();
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.errorMessage.set('업로드 완료! 잠시 후 초기화 됩니다.');
          this.alert.openSheet([
            {
              title: '업로드 완료',
              content: res.message,
            },
          ]);
          setTimeout(() => {
            this.reset();
          }, 1_000);
        } else {
          this.reset();
        }
      });
  }

  reset() {
    const url = this.previewUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.previewUrl.set(null);
    this.selectedFile.set(null);
    this.errorMessage.set('');
    this.fileSize.set({ formatedSize: '0 Bytes', size: 0 });
  }

  readonly router = inject(Router);

  async onWithdraw(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const confirmed = await this.alert.openConfirm("가입해제 하시겠습니까?");
    if (!confirmed) return;
    // this.userService.widraw('');
  }

  goToVipassana(id: string) {
    this.router.navigate([`${Paths.Account.url}/karma`, id]).then(r => {
      console.log(r);
    });
  }

  ngOnDestroy() {
    this.reset();
  }
}
