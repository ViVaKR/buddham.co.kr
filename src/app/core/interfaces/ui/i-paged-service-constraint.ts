import { Signal } from '@angular/core';

// 💡 C#의 where 제약 조건과 100% 동기화되는 명품 인터페이스!
export interface IPagedServiceConstraint {
  isLoading: Signal<boolean>;
  error: Signal<any>;
  reload: () => void;
  items: Signal<any[]>;        // 안의 알맹이가 무엇이든 배열 형태이기만 하면 됨!
  totalCount: Signal<number>;  // 오프셋/커서 페이징의 필수 덕목!
}
