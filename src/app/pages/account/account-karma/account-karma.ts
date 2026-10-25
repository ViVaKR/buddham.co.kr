import { CommonModule } from '@angular/common';
import { Component, inject, viewChild, computed, input, signal, effect, untracked } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { AsyncFormDirective } from '@app/core/directives/async-form.directive';
import { IDataResponse } from '@app/core/interfaces/api/i-response';
import { IFormConfig } from '@app/core/interfaces/form/i-form.config';
import { UserStore } from '@app/core/services/auth/user.store';
import { FormControlsOf, GenericFormService } from '@app/core/services/form/generic-form.service';
import { Paths } from '@app/data/menu-data';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { TitleLayout } from '@app/layout/title-layout/title-layout';
import { AccountCommandService } from '@app/pages/account/services/account-command.service';
import { createAccountConfig } from '@app/pages/account/services/account-karma.config';
import { AccountKarmaService } from '@app/pages/account/services/account-karma.service';
import { IUserInfoPayload, IUserInfoView } from '@app/pages/user-info/interfaces/i-user-info';
import { FORM_TEMPLATES } from '@app/shared/constants/form.constants';
import { MATERIAL_COMMON } from '@app/shared/imports/material-imports';
import { environment } from '@env/environment';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { TextStyleConfig, TextStyleSelector } from "@app/layout/text-style-selector/text-style-selector";
import { ScrollTo } from "@app/layout/scroll-to/scroll-to";
import { getBrowserLocale, getBrowserTimeZone, LOCALES } from '@app/shared/utility/utility';
import { MatIconModule } from '@angular/material/icon';
import { catchError, exhaustMap, finalize, Observable, of, Subject } from 'rxjs';
import { IFileRequest } from '@app/core/interfaces/api/request/i-file.request';
import { AlertService } from '@app/core/services/ui/alert.service';
import { TruncatePipe } from "../../../core/pipes/truncate-pipe";
import { FileManagerService } from '@app/core/services/file/file-manager.service';
import { UniqueValidators } from '@app/core/classes/unique-validators';
import { UserService } from '@app/core/services/auth/user.service';
import { IUpdateFullNameRequest, IUpdatePsedonymRequest } from '@app/core/interfaces/api/request/i-auth.request';
import { BaseDirective } from '@app/core/directives/base.directive';

@Component({
  selector: 'account-karma',
  imports: [BodyLayout, TitleLayout, CommonModule,
    ...MATERIAL_COMMON,
    MatIconModule,
    TextStyleSelector, ScrollTo, TruncatePipe],
  templateUrl: './account-karma.html',
  styleUrl: './account-karma.scss',
  hostDirectives: [BaseDirective],
})
export default class AccountKarma extends AsyncFormDirective<
  IDataResponse<IUserInfoView>,
  IUserInfoPayload
> {
  readonly API_BASE = environment.api.main;
  readonly id = input<string | undefined>(undefined, {});
  readonly returnUrl = input<string | undefined>(undefined);
  readonly listUrl = computed(() => { return this.returnUrl() || Paths.Home.url })
  readonly userService = inject(UserService);
  readonly userStore = inject(UserStore);
  readonly service = inject(AccountKarmaService);
  private fbService = inject(GenericFormService);
  private command = inject(AccountCommandService);
  readonly fileManagerService = inject(FileManagerService);
  readonly alert = inject(AlertService);
  userPseudonym = signal<string>('');

  isHide = signal<boolean>(true);

  public readonly loading = signal(false);

  title = computed(() => { return `회원 ${this.userPseudonym()} 관리` });

  submitLabel = computed(() => this.id() ? '수정' : '신규');

  readonly hasPreview = computed(() => !!this.previewUrl());
  readonly matcher = this.fbService.matcher;
  private formDirective = viewChild<FormGroupDirective>(FORM_TEMPLATES.DIRECTIVE_NAME);
  autosize = viewChild<CdkTextareaAutosize>('autosize');
  readonly currentUser = computed(() => this.userStore.currentUser());
  avatarPath = signal<string | null>(null);
  getAvatar = computed(() => {
    const path = this.avatarPath();

    return path && path.startsWith('/')
      ? `${this.API_BASE}${path}`
      : `${this.API_BASE}/Avatars/buddham.png`;
  });
  readonly isAdmin = computed(() => this.userStore.isAdmin());

  readonly isEditMode = signal<boolean>(false);
  minRows = signal<number>(10);
  currentFont = signal('font-ibm');
  currentFontSize = signal<string>('16px');
  lineSpace = signal<number>(1.8);

  color = Paths.Account.color;
  form = signal<FormGroup<FormControlsOf<IUserInfoPayload>> | null>(null);

  timeZone = computed(() => getBrowserTimeZone());
  locale = computed(() => getBrowserLocale());

  timeZones: string[] = Intl.supportedValuesOf('timeZone');
  locales = LOCALES;

  fileErrorMessage = signal<string | null>(null);
  previewUrl = signal<string | null>(null);
  fileSize = signal({ formatedSize: '0 Bytes', size: 0 });
  selectedFile = signal<File | null>(null);

  readonly allowed = ['.jpg', '.jpeg', '.png', '.webp'];

  // 1. 컴포넌트 클래스 필드에 선언 (신호등 역할)
  private updatePseudonymAction$ = new Subject<IUpdatePsedonymRequest>();
  private updateFullNameAction$ = new Subject<IUpdateFullNameRequest>();

  // 1. 필명 수정용 독립형 컨트롤 선언 (기본 검사기 + 비동기 중복 검사기 장착!)
  editPseudonymCtrl = new FormControl('', {
    validators: [Validators.minLength(2), Validators.maxLength(50)],
    asyncValidators: [
      UniqueValidators.createDuplicateValidator((v: string): Observable<boolean> => {
        // 💡 [핵심 함정 방어] 입력한 값이 '현재 내 필명'과 같다면 
        // 서버에 굳이 쿼리 날리지 않고 바로 중복 없음(null)으로 통과시킴!
        const currentPseudonym = this.form()?.get('pseudonym')?.value;
        if (v === currentPseudonym) {
          return of(false); // 에러 없음 (RxJS의 of 사용)
        }
        // 내 필명이 아닐 때만 기존 서비스로 중복 체크!
        return this.userService.checkPseudonym(v);
      }, 'pseudonymTaken')
    ],
    updateOn: 'change' // 혹은 키보드 칠 때마다 서버 터지는 걸 막으려면 'blur'도 조치!
  });

  editFullNameCtrl = new FormControl('', {
    validators: [Validators.minLength(2), Validators.maxLength(50)]
  });

  // [방어벽] - 이컴포넌트에 진입할 권한이 있는가?
  readonly canAccess = computed(() => {
    const targetid = this.id();
    const currentUser = this.currentUser();

    if (!currentUser || !targetid) return false;

    // 🔥 1. 전지전능한 신(Admin)인가? 묻지도 따지지도 말고 프리패스!
    if (this.userStore.isAdmin()) return true;
    return currentUser()?.id === targetid;
  });

  constructor() {
    super();
    // 👁️ 생성자 시그널 감시 부대에서 권한 체크!
    effect(() => {
      // 💡 만약 권한이 없다면 무식하게 튕겨내거나 홈으로 쫓아내기!
      if (!this.canAccess()) {
        this.router.navigate([Paths.Home.url]);
      }
    });
    this.initActionPipelines();
    this.initSignalEffects();
  }

  // * [필명] 수정 파이프라인
  private initActionPipelines(): void {
    // 필명 수정 파이프라인
    this.updatePseudonymAction$.pipe(
      exhaustMap(payload => this.userService.updatePseudonym(this.id()!, payload))
    ).subscribe({
      next: () => this.handleUpdateSuccess('필명')
    });

    // * [법명] 수정 파이프라인
    this.updateFullNameAction$.pipe(
      exhaustMap(payload => this.userService.updateFullName(this.id()!, payload))
    ).subscribe({
      next: () => this.handleUpdateSuccess('법명')
    });
  }

  // 👁️ [메서드 분리 2] 시그널 감시 이펙트 부대
  private initSignalEffects(): void {
    effect(() => {
      this.currentFontSize();
      this.currentFont();
      this.lineSpace();
      untracked(() => this.autosize()?.resizeToFitContent(true));
    });
  }

  async ngOnInit(): Promise<void> {
    const { data, isEdit } = await this.loadAndInit<IDataResponse<IUserInfoView>>(this.id(), (id) => this.service.readById(id));
    this.isEditMode.set(isEdit);
    this.userPseudonym.set(data?.content?.pseudonym ?? '');
    const builtForm = this.fbService.build(this.buildConfig(data));
    this.form.set(builtForm);
    this.avatarPath.set(builtForm.get('avatar')?.value ?? null);
  }

  // 2. 필명 업데이트 저장 메서드
  updatePseudonymOnly() {
    // 컨트롤이 유효하지 않거나 검사 중(pending)이면 리턴!
    if (this.editPseudonymCtrl.invalid || this.editPseudonymCtrl.pending) return;
    const newPsedonym = this.editPseudonymCtrl.value?.trim();
    const id = this.id();
    if (!newPsedonym || !id) return;
    this.updatePseudonymAction$.next({ id: id, pseudonym: newPsedonym });
  }

  updateFullNameOnly() {
    if (this.editFullNameCtrl.invalid || this.editFullNameCtrl.pending) return;
    const newFullName = this.editFullNameCtrl.value?.trim();
    const id = this.id();
    if (!newFullName || !id) return;
    this.updateFullNameAction$.next({ id: id, fullName: newFullName });
  }

  // ✨ [공통 뒷정리 쇼] 이것도 메서드로 빼두면 중복 코드가 사라집니다!
  private handleUpdateSuccess(type: '필명' | '법명'): void {
    const isPseudonym = type === '필명';
    const ctrl = isPseudonym ? this.editPseudonymCtrl : this.editFullNameCtrl;
    const formKey = isPseudonym ? 'pseudonym' : 'fullName';
    const currentNewValue = ctrl.value?.trim();
    this.form()?.get(formKey)?.setValue(currentNewValue!);
    this.isHide.set(true);
    ctrl.reset();
    // ctrl.markAsTouched();
    this.alertService.openSheet([{ title: `${type}수정완료` }]);
  }

  ngAfterViewInit() {
    this.triggerResize();
  }

  getRawValue() {
    return this.form()?.getRawValue();
  }

  triggerResize() {
    setTimeout(() => {
      this.autosize()?.resizeToFitContent(true);
    }, 0);
  }

  protected override buildConfig(data: IDataResponse<IUserInfoView> | null): IFormConfig<IUserInfoPayload> {
    return createAccountConfig(data?.content!);
  }

  hasError(field: keyof IUserInfoPayload, error: string): boolean {
    return this.fbService.hasError(this.form()!, field as string, error, this.formDirective());
  }

  hasAnyError(field: keyof IUserInfoPayload): boolean {
    return this.fbService.hasAnyError(this.form()!, field as string, this.formDirective());
  }

  errorMessage(field: keyof IUserInfoPayload): string {
    return this.fbService.getErrorMessage(this.form()!, field as string, this.formDirective());
  }

  isPending(field: string): boolean {
    return this.fbService.isPending(this.form()!, field);
  }

  // 통합 스타일 변경 핸들러
  onTextStyleChanged(config: TextStyleConfig) {
    this.currentFont.set(config.font);
    this.currentFontSize.set(config.size);
    this.lineSpace.set(config.lineSpace);
  }

  editPseudonym(event: MouseEvent) {
    this.isHide.set(!this.isHide());
    event.stopPropagation();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const result = this.fileManagerService.validateFile(file, 50);

    if (!result.valid) {
      this.fileErrorMessage.set(result.error ?? '아바타 파일 검증 실패');
      return;
    }
    const preUrl = this.previewUrl();
    if (preUrl) URL.revokeObjectURL(preUrl);

    this.selectedFile.set(file);

    const newUrl = URL.createObjectURL(file);
    this.previewUrl.set(newUrl);

    this.fileSize.set({
      formatedSize: this.fileManagerService.formatFileSize(file.size),
      size: file.size,
    });
  }

  // ── 업로드 처리 ─────────────────────────────────────────────────────
  reset() {
    const url = this.previewUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.previewUrl.set(null);
    this.selectedFile.set(null);
    this.fileErrorMessage.set('');
    this.fileSize.set({ formatedSize: '0 Bytes', size: 0 });
  }

  uploadAvatar(): void {
    this.doUpload();
  }

  private doUpload(): void {
    if (this.loading()) return;

    const file = this.selectedFile();
    if (!file) {
      this.fileErrorMessage.set('파일을 먼저 선택해 주세요.');
      return;
    }
    this.fileErrorMessage.set('');
    this.loading.set(true);
    this.loader.show();

    const id = this.id();

    if (!id) {
      this.fileErrorMessage.set('회원정보가 없습니다. 로그인 후 다시 시동하여 주세요.');
      return;
    }
    const upload$: Observable<IDataResponse<IFileRequest> | null>
      = this.fileManagerService.upload$(file, 'avatar', { targetUserId: id });

    upload$
      .pipe(
        catchError((err) => {
          this.fileErrorMessage.set(err.message ?? '업로드 실패');
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
          this.fileErrorMessage.set('업로드 완료! 잠시 후 초기화 됩니다.');

          // 🪐 [우주급 세련미 추가] 백엔드가 리턴해 준 새로운 아바타 경로를 폼에 주입!
          // res.content 내부나 res 구조에 따라 경로 필드명(예: res.content.path 등)을 맞춰주세요.
          const newAvatarPath = res.content?.webpPath;

          if (newAvatarPath && this.form()) {
            // 1. 폼 데이터 값 갱신 (서버 전송용)
            this.form()!.get('avatar')?.patchValue(newAvatarPath);
            // 2. 🎯 우리의 순수 시그널 갱신! (이 순간 getAvatar() computed가 깨어나 화면을 바꿉니다!)
            this.avatarPath.set(newAvatarPath);
          }

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

  goList() {
    this.navigator.replace(this.listUrl());
  }
  goMandala() {
    this.navigator.to([Paths.Account.url]);
  }

  override async onSubmit(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const frm = this.form();
    if (!frm) return;
    await this.command.execute(frm);
  }
}