// ── 단일 역할 원자값 ──────────────────────────────────────────
export const Role = {
  Admin: 'Admin',
  Dev: 'Dev',
  Monk: 'Monk',
  Editor: 'Editor',
  Verified: 'Verified',
  User: 'User',
  Guest: 'Guest',
  Banned: 'Banned',
} as const;


// ── 역할 그룹 (라우트/메뉴 roleOverrides 에서 사용) ────────────
// 상위 역할은 하위 역할의 모든 권한을 포함한다는 원칙 반영
export const Roles = {

  /** 비로그인 포함 전체 공개 */
  Public: [],

  /** 비회원 읽기 전용 */
  Guest: [Role.Guest],

  /** 로그인 일반 회원 이상 */
  User: [Role.User, Role.Verified, Role.Monk, Role.Editor, Role.Dev, Role.Admin],

  /** 이메일/본인인증 완료 회원 이상 */
  Verified: [Role.Verified, Role.Monk, Role.Editor, Role.Dev, Role.Admin],

  /** 경전 편집 권한 이상 */
  Editor: [Role.Editor, Role.Monk, Role.Dev, Role.Admin],

  /** 스님 회원 이상 (경전 관리) */
  Monk: [Role.Monk, Role.Dev, Role.Admin],

  /** 개발자 이상 */
  Dev: [Role.Dev, Role.Admin],

  /** 최고 관리자 전용 */
  Admin: [Role.Admin],

  /** 서비스 이용 차단 판별용 (가드에서 Banned 체크에 활용) */
  Banned: [Role.Banned],

} as const;

export type RoleName = typeof Role[keyof typeof Role];