export interface ILoadingState<T> {
  data?: T | null;
  loading: boolean;
  error: Error | null;
}

/*
- content 데이터가 아예 안 넘어옴 (undefined) 👉 통과!
- 백엔드가 고의로 빈 값이라고 보내옴 (null) 👉 통과!
- 이쁜 문자열 데이터가 넘어옴 (string) 👉 통과!
*/
