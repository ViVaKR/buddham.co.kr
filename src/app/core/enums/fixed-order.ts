export enum FixedOrder {
  NotFixed = 0,
  GeneralFixed = 10,
  ImportantFixed = 50,
  TopFixed = 100
}

export function fixedOrderLabel(key: string): string {
  switch (key) {
    case 'NotFixed': return '고정 안 함';
    case 'GeneralFixed': return '일반 고정';
    case 'ImportantFixed': return '중요 공지';
    case 'TopFixed': return '최상단 고정';
    default: return key;
  }
}
