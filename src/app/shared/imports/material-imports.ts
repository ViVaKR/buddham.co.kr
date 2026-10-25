import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { TabIndent } from "@app/core/directives/tab-indent.directive";

// ── Buttons ──────────────────────────────
import { MatAnchor, MatButton, MatFabButton, MatIconButton, MatMiniFabButton } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";

// ── Form Fields ──────────────────────────
import { MatError, MatFormField, MatHint, MatLabel, MatPrefix, MatSuffix } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatSelect, MatSelectTrigger } from "@angular/material/select";
import { MatOption } from "@angular/material/core";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { MatSlider, MatSliderThumb } from "@angular/material/slider";
import { MatAutocompleteModule } from "@angular/material/autocomplete";   // 모듈 유지
import { MatChipsModule } from "@angular/material/chips";                  // 모듈 유지
import { MatDatepickerModule } from "@angular/material/datepicker";        // 모듈 유지
import { MatNativeDateModule } from "@angular/material/core";
import { MatTimepickerModule } from "@angular/material/timepicker";        // 모듈 유지

// ── Layout / Navigation ──────────────────
import { MatDivider } from "@angular/material/divider";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatTab, MatTabGroup, MatTabLabel } from "@angular/material/tabs";
import { MatStepperModule } from "@angular/material/stepper";              // 모듈 유지

// ── Cards / Lists ────────────────────────
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardActions, MatCardImage } from "@angular/material/card";
import { MatListModule } from "@angular/material/list";                    // 모듈 유지 (복잡)
import { MatAccordion, MatExpansionPanel, MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from "@angular/material/expansion";
import { MatTreeModule } from "@angular/material/tree";                    // 모듈 유지

// ── Data / Table ─────────────────────────
import { MatTableModule } from "@angular/material/table";                  // 모듈 유지
import { MatSortModule } from "@angular/material/sort";                    // 모듈 유지
import { MatPaginatorModule } from "@angular/material/paginator";          // 모듈 유지

// ── Overlays / Feedback ──────────────────
import { MatDialogModule } from "@angular/material/dialog";                // 모듈 유지
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";     // 모듈 유지
import { MatSnackBarModule } from "@angular/material/snack-bar";           // 모듈 유지
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatProgressBar } from "@angular/material/progress-bar";
import { MatTooltip } from "@angular/material/tooltip";
import { MatBadge } from "@angular/material/badge";
import { MatRipple } from "@angular/material/core";

// ── Icons / Grid ─────────────────────────
import { MatIcon } from "@angular/material/icon";
import { MatGridListModule } from "@angular/material/grid-list";           // 모듈 유지
import { TextFieldModule } from "@angular/cdk/text-field";

export const MATERIAL_COMMON = [
    // ── Angular Core ──────────────────────
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ClipboardModule,

    // ── Buttons ───────────────────────────
    MatButton,
    MatAnchor,
    MatIconButton,
    MatFabButton,
    MatMiniFabButton,
    MatButtonToggleModule,    // 토글 그룹 복잡해서 모듈 유지

    // ── Icons / Badge / Ripple ────────────
    MatIcon,
    MatBadge,
    MatRipple,

    // ── Form Fields ───────────────────────
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatPrefix,                // matPrefix 디렉티브
    MatSuffix,                // matSuffix 디렉티브
    MatInput,
    MatSelect,
    MatSelectTrigger,
    MatOption,
    MatCheckbox,
    MatSlideToggle,
    MatSlider,
    MatSliderThumb,
    MatAutocompleteModule,    // 내부 패널 오버레이 복잡
    MatChipsModule,           // 칩 입력 복잡
    MatDatepickerModule,      // 캘린더 오버레이 복잡
    MatTimepickerModule,      // 시간 오버레이 복잡
    MatNativeDateModule,
    TextFieldModule,

    // ── Layout ────────────────────────────
    MatDivider,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTab,
    MatTabGroup,
    MatTabLabel,
    MatStepperModule,         // 스텝퍼 내부 복잡

    // ── Cards / Lists ─────────────────────
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardActions,
    MatCardImage,
    MatListModule,            // SelectionList 등 복잡
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatTreeModule,            // 재귀 구조 복잡

    // ── Data / Table ──────────────────────
    MatTableModule,           // sort + paginator 연동 복잡
    MatSortModule,
    MatPaginatorModule,

    // ── Overlays / Feedback ───────────────
    MatDialogModule,          // 오버레이 서비스 복잡
    MatBottomSheetModule,     // 오버레이 서비스 복잡
    MatSnackBarModule,        // 오버레이 서비스 복잡
    MatProgressSpinner,
    MatProgressBar,
    MatTooltip,

    // ── Grid ──────────────────────────────
    MatGridListModule,

    // ── Custom ────────────────────────────
    TabIndent,
] as const;