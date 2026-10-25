import { signal } from '@angular/core';
import { IColumnDef } from '@app/core/interfaces/ui/i-column-def';

export const GUIDE_COLUMNS = signal<IColumnDef[]>([
  { key: 'id', label: 'ID', showInTable: true, showInTab: false, tabOrder: 0, position: 'sub-header', },
  { key: 'title', label: '제목', width: 'w-auto', showInTable: true, showInTab: false, tabOrder: 1, position: 'header', },
  { key: 'createdAt', label: '작성일자', width: 'w-[120px]', pipe: 'date', showInTable: true, showInTab: false, tabOrder: 2, position: 'badge', },
  { key: 'content', label: '내용', showInTable: false, showInTab: true, tabOrder: 11, position: 'content', },
  { key: 'userId', label: '작성자', showInTable: false, position: 'footer', showInTab: true, pipe: 'uppercase', tabOrder: 12, },
  { key: 'dharmaGuideCategory', label: '카테고리', showInTable: false, showInTab: true, tabOrder: 13, pipe: 'uppercase', position: 'sub-header', },
  { key: 'rowVersion', label: '행버전', showInTable: false, showInTab: true, position: 'footer', tabOrder: 14, },
]);
