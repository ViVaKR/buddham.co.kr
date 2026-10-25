import { AbstractControl, ValidationErrors } from "@angular/forms";

/**  최소 하나 이상의 필드 입력 강제  */
export const AtLeastOneRequired = {
  validate(fields: string[]) {
    return (group: AbstractControl): ValidationErrors | null => {
      // 지정된 필드 중 하나라도 값이 채워져 있는지 확인
      const hasAtLeastOne = fields.some(field => {
        const value = group.get(field)?.value;
        return value && value.trim() !== '';
      });

      return hasAtLeastOne ? null : { atLeastOneRequired: true };
    };
  }
};

// * config 설정 예시
// --> const groupOptions = { validators: AtLeastOneRequired.validate(['contentKr', 'contentCn']) };

/* 
* 최소 하나 이상의 필드 입력 강제 (선택적 필수 검사기)
- 보편적 상황: 연락처 입력 시 '유선전화' 또는 '휴대폰 번호' 중 최소 하나는 입력해야 할 때
- 사경/경전 CRUD 상황: "경전 검색 앤 필터" 또는 "사경 기록 작성 시 참조 입력"
- 예를 들어 경전을 등록하거나 수정할 때, "경전 한글 번역본" 텍스트 필드와 "한문 원문" 텍스트 필드가 있다고 해보자. 둘 다 필수는 아니지만, 적어도 둘 중 하나는 반드시 입력해야 온전한 경전 등록이 성립된다고 치면, 이 또한 부모 레벨에서 감시해야 해.

*/