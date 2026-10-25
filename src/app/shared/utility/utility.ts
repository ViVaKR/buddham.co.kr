// 어디서든 사용 가능한 유틸 함수
export function getBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
  // 예) "Asia/Seoul"
}

export function getBrowserLocale(): string {
  return navigator.language;
  // 예) "ko-KR"
}

export const LOCALES = [
  { value: 'ko-KR', label: '한국어' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'ja-JP', label: '日本語' },
  { value: 'zh-CN', label: '中文 (简体)' },
  { value: 'zh-TW', label: '中文 (繁體)' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'de-DE', label: 'Deutsch' },
  // ...필요한 만큼만
] as const;