export enum PostType {
    Draft = 1, // 초안
    Review = 2, // 검토
    Publish = 3, // 공개
    Private = 4, // 비공개
    Featured = 5 // 추천
}

export interface PostTypeOption {
    value: PostType;
    label: string;
    displayText: string;
}

export const POSTTYPE_OPTIONS: PostTypeOption[] = [
    { value: PostType.Draft, label: '초안', displayText: 'Draft (초안)' },
    { value: PostType.Review, label: '검토', displayText: 'Review (검토)' },
    { value: PostType.Publish, label: '공개', displayText: 'Published (공개)' },
    { value: PostType.Private, label: '비공개', displayText: 'Hidden (비공개)' },
    { value: PostType.Featured, label: '추천', displayText: 'Featured (추천)' },
]
// 특정 값의 라벨을 바로 가져오는 헬퍼 함수
export const getPostTypeLabel = (value: PostType): string => {
    return POSTTYPE_OPTIONS.find(opt => opt.value === value)?.label || '알 수 없음';
};
