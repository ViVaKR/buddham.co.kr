import { AbstractControl, FormGroupDirective, NgForm } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";

/** 부모와 연관된 오류 검출기 */
export class GlobalErrorStateMatcher implements ErrorStateMatcher {

    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {

        // 1. 폼이 제출(Submit) 되었는가?
        const isSubmitted = !!(form && form.submitted);

        // 2. 사용자가 폼 컨트롤을 건드렸거나(dirty), 포커스가 한 번이라도 들어갔다 나왔는가(touched)?
        const controlTouched = !!(control && (control.dirty || control.touched));

        // 3. 컨트롤 자체가 유효성 검사를 통과하지 못했는가(invalid)?
        const isInvalid = !!(control && control.invalid);

        // 비동기 검사 중(로딩 중)이면 에러 상태로 보지 않음 (빨간 줄 안 띄움)
        if (control?.pending) return false;

        // 핵심: 특정 에러명을 지우고 "부모가 invalid" 하면 다 받아 들이기!
        let hasRelevantParentError = false;

        if (control?.parent?.invalid && controlTouched) {

            // 1. 부모 폼에 passwordMismatch 에러가가 있고
            const parentHasMismatch = control.parent.hasError('passwordMismatch');

            // * 핵심 수정 포인트: 현재 검사 중인 컨트롤이 'confirmPassword' 일 때만 붉은 줄을 표시하도록 제한
            // 2. 현재 검사 중인 녀석이 'confirmPassword' 인풋이라면?
            const isConfirmPasswordControl = control === control.parent.get('confirmPassword');

            if (parentHasMismatch && isConfirmPasswordControl) {
                // 3. 너 본인은 에러가 없지만, 부모 에러를 네 에러인 것 처럼 짊어 지거라 (True)
                hasRelevantParentError = true;
            }
        }

        return (isInvalid || hasRelevantParentError) && (controlTouched || isSubmitted);
    }
}

/* [범용적으로 사용할때]
    if (control?.parent && control.parent.invalid && controlTouched) {
        hasParentError = true;
    }
*/

// (컨트롤 본인 에러 OR 부모로부터 물려받은 에러)가 있으면서,
// (사용자가 건드렸거나 OR 폼을 제출했을 때) 비로소 빨간 줄을 띄운다!
// --> isSubmitted 의 존재 이유..
// 1. 사용자가 회원가입 화면에 들어 왔어. 폼은 아주 깨끗한 상태 (Pristine)
// 2. 그런데 사용자가 성격이 너무 급해서 곧바로 화면 아래에 있는 가입하기 버튼을 쾅 눌렀을때
// 3. 폼 전체를 invalid 상태로 만들로 서버 전송을 막음
// 4. 그런데 문제.
// 비밀번호 불일치 검사는 '인풋 컨트롤'을 직접 건드린게 아니잖아?
// Tucuched/Dirty 하지 않았다면 버튼을 밸날 눌러도 비밀번호 확인 칸에 붉은 테두리가 절대 안들어오는 참사 발생
// controlTouched 가 false 인 칸이라 할지라도 "야 폼 제출 버튼 눌렸으니 주저하지 말고 무조건 빨간 불 다 켜" 라고
// 강제 집행
// GlobalErrorStateMatcher  →  빨간 줄 타이밍 (Material UI)
// GenericFormService       →  에러 메시지 텍스트 (로직)
// FormConfig<T>            →  필드 정의 (중앙 관리)

/*
사용자 입력
    │
    ├── GenericFormService        → "어떤 에러인지, 메시지는 뭔지"
    │    getErrorMessage()        → <mat-error> 안의 텍스트
    │
    └── GlobalErrorStateMatcher   → "지금 빨간 줄 띄울 타이밍인지"
         isErrorState()           → mat-form-field 의 빨간 테두리


*/

/*
<!-- app.config.ts 또는 컴포넌트에서 전역 제공 -->
<!-- providers: [{ provide: ErrorStateMatcher, useClass: GlobalErrorStateMatcher }] -->

<mat-form-field>
    <input matInput formControlName="confirmPassword">
    <mat-error>
        <!-- GenericFormService 가 담당 -->
        {{ forms.getErrorMessage(form, 'confirmPassword') }}
    </mat-error>
    <!-- 빨간 줄 타이밍은 GlobalErrorStateMatcher 가 담당 -->
</mat-form-field>
*/




/*

* 부모 검사기(groupOptions)의 정석은!
두 개 이상의 인풋 값이 서로 엮여서
비교(Comparison)되어야 하거나 조화(Harmony)를 이루어야 할 때
100% 사용

1. A와 B가 같아야 한다 (passwordMismatch - 비밀번호 확인)
2. A가 B보다 커야(혹은 빨라야) 한다 (dateRangeInvalid, exceededTotal - 기간, 수량 비교)
3. A와 B 중 적어도 하나는 있어야 한다 (atLeastOneRequired - 상호 보완 필수)

* app.config 등록용
// 진정한 전역 처리를 위한 GlobalErrorStateMatcher 업그레이드 버전
import { AbstractControl, FormGroupDirective, NgForm } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";

export class GlobalErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = !!(form && form.submitted);
        const controlTouched = !!(control && (control.dirty || control.touched));
        const isInvalid = !!(control && control.invalid);

        if (control?.pending) return false;

        // 👈 핵심: 특정 에러명을 지우고 "부모가 invalid"하면 다 받아들이기!
        let hasParentError = false;
        if (control?.parent && control.parent.invalid && controlTouched) {

            // 비밀번호 확인 칸이거나, 기간 종료일 칸이거나 등등
            // 부모 그룹 전체가 invalid 상태라면 에러 상태로 인지하도록 처리합니다.
            hasParentError = true;
        }

        return (isInvalid || hasParentError) && (controlTouched || isSubmitted);
    }
}

// app.config.ts 예시
import { ApplicationConfig } from '@angular/core';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { GlobalErrorStateMatcher } from './global-error-state-matcher';

export const appConfig: ApplicationConfig = {
  providers: [
    // 👈 Angular Material의 기본 ErrorStateMatcher를 내 커스텀 매처로 대체한다!
    { provide: ErrorStateMatcher, useClass: GlobalErrorStateMatcher }
  ]
};
*/









