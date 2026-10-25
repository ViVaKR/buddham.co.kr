import { SearchStrategy } from "@app/core/types/search-strategy";

export interface ISearchConfig {
  strategy: SearchStrategy;
  localThreshold: number; // 로컬 검색 최소 글자수
  serverThreshold: number; // 서버 FTS 최소 글자수
}
