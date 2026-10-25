import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { UserService } from "@app/core/services/auth/user.service";
import { catchError, first, map, Observable, of, switchMap, timer } from "rxjs";

export class UniqueValidators {

    /** Generic 중복 검사 팩토리 */
    static createDuplicateValidator<T>(
        serviceCall: (value: T) => Observable<boolean>,
        errorKey: string = 'duplicated'
    ): AsyncValidatorFn {

        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            if (!control.value) return of(null);
            return timer(500).pipe(
                // 입력값의 타입을 T로 간주하여 서비스 호출
                switchMap(() => serviceCall(control.value as T)),
                map((isTaken: boolean) => {
                    // 중복이면 지정된 에러 키 반환, 아니면 통과(null)
                    return isTaken ? { [errorKey]: true } : null;
                }),
                // API 에러 시 UX를 위해 일단 통과 처리 (또는 에러 핸들링)
                catchError(() => of(null)),
                first()
            );

        };
    }

    /*
    [사용예시]
    --> pseudonym: ['', [Validators.required], this.uniqueValidator(this.auth.checkPseudonymAuth, { debounceMs: 300, errorKey: 'alreadyExists' })]
    --> email: [ '', [Validators.email, Validators.required], [ uniqueValidator( v => authService.checkEmail(v), { errorKey: 'emailTaken' }) ] ]
    --> password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)], [ uniqueValidator(v => authService.checkEmail(v), { errorKey: 'passwordTaken' }) ]]
    */

    static uniqueValidator<T>(
        callback: (value: string) => Observable<T>,
        options?: {
            debounceMs?: number;
            errorKey?: string;
        }
    ): AsyncValidatorFn {
        const debounceMs = options?.debounceMs ?? 500;
        const errorKey = options?.errorKey ?? 'unique';

        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            const value = control.value;

            // (1) 값 없으면 통과
            if (!value) {
                return of(null);
            }

            return timer(debounceMs).pipe(
                switchMap(() => callback(value)),
                map(res => (res ? null : { [errorKey]: true })),
                catchError(() => of(null)), // UX 보호
                first() // 반드시 complete
            );
        };
    }


    /* 구버전 (하위호환 용) */
    // ! 이메일 중복 검사
    static createEmailValidator(userService: UserService): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            if (!control.value) {
                return of(null);
            }

            return timer(500).pipe( // (1) 0.5 초 디바운스 (타자 칠 땐 기다림
                switchMap(() => userService.checkEmail(control.value)), // (2) API 호출
                map((isTaken) => {
                    // (3) 결과 처리: true 면 (이미 있음) 에러 리턴, false 면 null (통과)
                    return isTaken ? { emailTaken: true } : null;
                }),
                catchError(() => of(null)), // 에러나면 일단 통과 시킴 (UX상 방해 안되게)
                first() // (4) 중요: 반드시 완료 (Complete) 되어야 폼 상태가 확정됨
            );
        };
    }

    // * 필명 중복 검사기 (회원가입 용)
    static createPseudonymValidator(userService: UserService): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            if (!control.value) return of(null);
            return timer(500).pipe(
                switchMap(() => userService.checkPseudonym(control.value)),
                map(isTaken => isTaken ? { pseudonymTaken: true } : null),
                catchError(() => of(null)),
                first()
            );
        };
    }

    static createPseudonymAuthValidator(userService: UserService): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            if (!control.value) return of(null);
            return timer(500).pipe(
                switchMap(() => userService.checkPseudonym(control.value)),
                map(isTaken => isTaken ? { pseudonymTaken: true } : null),
                catchError(() => of(null)),
                first()
            )
        }
    }
}
