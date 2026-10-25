export interface IColumnDef {
  key: string; // 실제 데이터 필드
  label: string; // 한글 헤더
  width?: string | 'w-auto'; // 넓이
  fontName?: string | 'font-noto';
  showInTable?: boolean; // 테이블에 표시 (기본: true)
  showInTab?: boolean; // 탭에 표시 여부 (기본 : true)
  tabLabel?: string; // 탭에 표시될 레이블 (다를경우)
  detailUrl?: string;
  tabOrder?: number; // 탭 표시 순서
  pipe?:
  | 'date'
  | 'currency'
  | 'number'
  | 'enum'
  | 'truncate'
  | 'like'
  | 'replyCount'
  | 'uppercase'
  | 'lowercase'
  | 'titlecase'
  | 'array'
  | 'active'
  | 'roles';

  pipeArgs?: any; // 파이프 인자
  enumType?: 'MainCategoryType' | 'ScriptureStructureType';
  placeHoder?: string;
  position?: 'header' | 'sub-header' | 'badge' | 'grid' | 'content' | 'footer';
  defaultValue?: string | null;
  unit?: string;
}
