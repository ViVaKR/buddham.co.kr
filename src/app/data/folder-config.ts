import { Paths } from "@app/data/menu-data";

export const FOLDER_CONFIG = [
  {
    tooltip: "모든 것은 변한다",
    class: 'folder-left max-md:left-[13%]',
    items: [
      { id: 1, name: '제', url: Paths.BuddhaFortune.url },
      { id: 2, name: '행', url: '...' },
      { id: 3, name: '무', url: '...' },
      { id: 4, name: '상', url: '...' }
    ]
  },
  {
    tooltip: "고정된 실체는 없다",
    class: 'folder-middle',
    items: [
      { id: 5, name: '제', url: '...' },
      { id: 6, name: '법', url: '...' },
      { id: 7, name: '무', url: '...' },
      { id: 8, name: '아', url: '...' }
    ]
  },
  {
    tooltip: "모든 번뇌소멸 해탈에 이름",
    class: 'folder-right max-md:left-[87%]',
    items: [
      { id: 9, name: '열', url: '...' },
      { id: 10, name: '반', url: '...' },
      { id: 11, name: '적', url: '...' },
      { id: 12, name: '정', url: '...' }
    ]
  }
];
