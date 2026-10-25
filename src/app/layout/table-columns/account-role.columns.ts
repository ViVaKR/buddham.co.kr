import { signal } from "@angular/core";
import { IColumnDef } from "@app/core/interfaces/ui/i-column-def";

export const ACCOUNT_ROLE_COLUMNS = signal<IColumnDef[]>([
  { key: 'normalizedName', label: '식별자', width: 'w-[120px]', showInTable: true, tabOrder: 0, position: 'header', showInTab: false },
  { key: 'name', label: '영문명', width: 'w-[120px]', showInTable: true, showInTab: false, tabOrder: 1 },
  { key: 'koName', label: '한글명', width: 'w-[120px]', showInTable: true, showInTab: false, tabOrder: 2 },
  { key: 'description', label: '설명', width: 'min-w-0 w-full', tabOrder: 10, fontName: 'font-noto', position: 'content' },

  // 내부
  { key: 'id', label: 'ID', showInTable: false, tabOrder: 3, position: 'footer' },
  { key: 'isSystem', label: '시스템 계정', showInTable: false, tabOrder: 4, position: 'footer' },
  { key: 'createdAt', label: '생성일', showInTable: false, tabOrder: 5, pipe: 'date', position: 'badge' },
  { key: 'rowVersion', label: 'Version', showInTable: false, tabOrder: 6, position: 'badge' }
] as const);
