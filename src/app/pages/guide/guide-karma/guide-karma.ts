import {
  Component, input, computed, inject,
  effect, viewChild, signal,
  untracked,
} from '@angular/core';
import { BodyLayout } from '@layout/body-layout/body-layout';
import { TitleLayout } from '@layout/title-layout/title-layout';
import { Paths } from '@data/menu-data';
import { CommonModule } from '@angular/common';
import { GuideService } from '@pages/guide/services/guide.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { IGuidePayload, IGuideView } from '@interfaces/api/request/i-guide.request';
import { ILoadingState } from '@interfaces/ui/i-loading-state';
import { MATERIAL_COMMON } from '@shared/imports/material-imports';
import { LoadingErrorWrapper } from '@layout/loading-error-wrapper/loading-error-wrapper';
import { BaseFormDirective } from '@directives/base-form.directive';
import { FormControlsOf, GenericFormService } from '@services/form/generic-form.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { FORM_TEMPLATES } from '@shared/constants/form.constants';
import { GuideCommand } from '@pages/guide/services/guide-command';
import { createGuideConfig } from '@pages/guide/services/guide-karma.config';

@Component({
  selector: 'guide-karma',
  imports: [BodyLayout,
    TitleLayout, CommonModule,
    ...MATERIAL_COMMON, LoadingErrorWrapper],
  templateUrl: './guide-karma.html',
  styleUrl: './guide-karma.scss',
})
export default class GuideKarma extends BaseFormDirective {
  // [1. 상태 및 인프라 주입 필드]
  title = Paths.Guide.ko;
  color = Paths.Guide.color;

  readonly service = inject(GuideService);
  private fbService = inject(GenericFormService);
  private command = inject(GuideCommand);
  readonly matcher = this.fbService.matcher;

  // [2. 인풋 및 계산된 프로퍼티 (Signals)]
  readonly id = input<number, string | undefined>(undefined, {
    transform: (value) => (value ? Number(value) : 0),
  });
  readonly returnUrl = input<string | undefined>(undefined, {});
  readonly listUrl = computed(() => this.returnUrl() || Paths.Home.url);

  isEditMode = signal<boolean>(false);

  // [3. 폼 통제 및 설정 필드]
  private formDirective = viewChild<FormGroupDirective>(FORM_TEMPLATES.DIRECTIVE_NAME);
  private readonly formConfig = createGuideConfig();
  form: FormGroup<FormControlsOf<IGuidePayload>> = this.fbService.build(this.formConfig);

  // [4. 데이터 라이프사이클 스트림 및 최종 상태]
  private data$ = toObservable(this.id).pipe(
    switchMap((id) => {
      // transform에 의해 id가 없으면 0으로 들어오므로 명확하게 방어선 구축!
      if (!id || id === 0) {
        return of<ILoadingState<IGuideView>>({ data: null, loading: false, error: null });
      }
      return this.service.getById(id).pipe(
        map<any, ILoadingState<IGuideView>>((res) => {
          if (res.isSuccess) {
            return { data: res.content ?? null, loading: false, error: null };
          }
          return { data: null, loading: false, error: null };
        }),
        startWith<ILoadingState<IGuideView>>({ data: null, loading: true, error: null }),
        catchError((err) =>
          of<ILoadingState<IGuideView>>({ data: null, loading: false, error: err }),
        ),
      );
    }),
  );

  private state = toSignal(this.data$, {
    initialValue: { data: null, loading: false, error: null },
  });

  data = computed(() => this.state().data);
  isLoading = computed(() => this.state().loading);
  error = computed(() => this.state().error);

  constructor() {
    super();

    effect(() => {
      const data = this.data();
      if (!data) return;
      untracked(() => {
        this.form.patchValue(data);
      });
    }, { allowSignalWrites: true });

    effect(() => {
      if (this.service.mutatedTrigger() > 0) {
        this.service.reload();
      }
    });
  }

  ngOnInit() {
    // id가 0이 아닐 때만 진짜 수정 모드!
    this.isEditMode.set(!!this.id() && this.id() !== 0);
  }

  hasError(field: keyof IGuidePayload, error: string): boolean {
    return this.fbService.hasError(this.form, field as string, error, this.formDirective());
  }

  // 💡 족보를 IUserRoleBase에서 IGuidePayload로 전면 수정하여 웹스톰 진압!
  errorMessage(field: keyof IGuidePayload): string {
    return this.fbService.getErrorMessage(this.form, field as string);
  }

  isPending(field: string): boolean {
    return this.fbService.isPending(this.form, field);
  }

  goList() {
    this.navigator.byUrl(this.listUrl());
  }

  async onDelete(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const id = this.id();
    if (!id || id === 0) return;
    const result = await this.service.deleteById(id);
    if (result) {
      this.navigator.byUrl(this.listUrl());
    }
  }

  override async onSubmit(event: MouseEvent): Promise<void> {
    event.preventDefault();
    this.fbService.markAllTouched(this.form);

    // 0일 때는 null로 던져서 신규 등록임을 커맨드에 명확히 선언!
    const currentId = this.id();
    const result = await this.command.execute(
      this.form,
      currentId && currentId !== 0 ? currentId : null,
    );
    if (result) {
      this.navigator.byUrl(this.listUrl());
    }
  }
}
