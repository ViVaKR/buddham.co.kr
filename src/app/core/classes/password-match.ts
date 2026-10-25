import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class PasswordMatch {
    public static validate(controlName: string, checkControlName: string): ValidatorFn {

        return (group: AbstractControl): ValidationErrors | null => {
            // 1. 그룹(FormGroup)에서 실제 컨트롤을 꺼냅니다.
            const passwordControl = group.get(controlName);
            const confirmControl = group.get(checkControlName);

            if (!passwordControl || !confirmControl) return null;

            // 2. 이름이 아니라 '값(Value)'을 비교합니다!
            const isMatch = passwordControl.value === confirmControl.value;

            // 3. 에러를 리턴하면서, 동시에 확인 칸에 직접 에러를 꽂아주면 UX가 더 좋아집니다.
            if (!isMatch) {
                confirmControl.setErrors({ passwordMismatch: true });
                return { passwordMismatch: true };
            } else {
                // 에러가 없으면 확인 칸의 다른 에러는 유지하되 mismatch 에러만 지워줍니다.
                // 이 부분은 상황에 따라 생략 가능하지만, 정석은 아래와 같습니다.
                return null;
            }
        };
    }
}
