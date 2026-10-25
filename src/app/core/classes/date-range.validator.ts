import { AbstractControl, ValidationErrors } from "@angular/forms";

/** 시작일과 종료일 역전 방지 (기간 검사기) */
export const DateRangeMatch = {
  validate(startKey: string, endKey: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const start = group.get(startKey)?.value;
      const end = group.get(endKey)?.value;

      if (!start || !end) return null; // 값이 없으면 개별 required에서 걸러짐

      // 시작일이 종료일보다 늦으면 에러!
      return new Date(start) > new Date(end) ? { dateRangeInvalid: true } : null;
    };
  }
};


/* 
* 시작일과 종료일 역전 방지 (기간 검사기)
- 보편적 상황: 이벤트 기간, 공지사항 게시 기간 설정 등
- 사경/경전 CRUD 상황: "경전 사경 챌린지 기간" 또는 "개인 사경 수행 기간 설정"
- 사경을 시작하는 날짜(startDate)와 완료 목표일(endDate)을 입력받을 때, 
  종료일이 시작일보다 과거일 순 없잖아? 
  두 날짜 인풋은 각각 자기 날짜가 올바른 형식인지만 알 뿐, 서로를 비교할 수 없어. 
  이럴 때 부모 그룹 검사기가 등판해야 해.
*/