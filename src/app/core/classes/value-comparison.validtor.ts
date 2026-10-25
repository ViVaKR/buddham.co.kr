import { AbstractControl, ValidationErrors } from "@angular/forms";

/** 목표치와 현재 수치 비교 */
export const MaxLimitMatch = {
  validate(currentKey: string, totalKey: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const current = Number(group.get(currentKey)?.value);
      const total = Number(group.get(totalKey)?.value);

      if (isNaN(current) || isNaN(total)) return null;

      // 오늘 쓴 페이지가 전체 페이지보다 많으면 에러!
      return current > total ? { exceededTotal: true } : null;
    };
  }
};

/* 
* 목표치와 현재 수치 비교 (수량/범위 유효성 검사기)
- 보편적 상황: 양수/음수 범위 비교, 최소값과 최대값의 관계 설정
- 사경/경전 CRUD 상황: "오늘의 사경 횟수 자가 점검" 또는 "목표 사경 수 대비 완료 수"
- 경전 CRUD나 사경 기록 폼에서 "권장 사경 일수(혹은 권장 횟수)"와 "내가 설정한 목표 횟수"가 있을 때, 목표치가 최소 권장치보다 낮게 설정되지 않도록 막거나, 반대로 "총 사경 페이지 수"와 "오늘 사경한 페이지 수"를 입력할 때 오늘 한 양이 전체 페이지를 초과하지 않도록 막아주는 로직이야.
*/