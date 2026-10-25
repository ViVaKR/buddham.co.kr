import { IMenuItem } from '@app/core/interfaces/i-menu-config';
import { Icons } from '@app/shared/constants/icon.constants';

export type NavKeyType = (typeof NavKey)[keyof typeof NavKey];

export const NavKey = {
  Mandala: 'mandala',
  Samsara: 'samsara',
  Karma: 'karma',
  Edit: 'edit',
  Likhita: 'likhita',
  Vipassana: 'vipassana',
} as const;

export const getTitle = (key: NavKeyType): string => titles.get(key) ?? '붓다의 가르침';

export const titles: ReadonlyMap<string, string> = new Map([
  [NavKey.Mandala, `원(圓) · ${NavKey.Mandala.toUpperCase()}`], // 만다라, 우주의 원
  [NavKey.Samsara, `윤(輪) · ${NavKey.Samsara.toUpperCase()}`], // 윤회 - 순환의 바퀴
  [NavKey.Karma, `업(業) · ${NavKey.Karma.toUpperCase()}`], // 정진 - 업, 행위의 쌓임
  [NavKey.Edit, `사(寫) · ${NavKey.Likhita.toUpperCase()}`], // 정진 - 필사, 옮겨 쓰다
  [NavKey.Vipassana, `관(觀) · ${NavKey.Vipassana.toUpperCase()}`], // 관조 - , 꿰뚫어 보다
]);

export const Paths = {

  /** 홈 */
  Home: {
    url: 'Home',
    title: 'Home',
    ko: '홈',
    en: 'Home',
    hj: '',
    sa: '',
    pi: '',
    akasha: 'home',
    icon: Icons.NaturePeople,
    color: 'text-sky-600',
    tooltip: '홈',
    navKey: 'mandala' as NavKeyType,
  },

  /* [ 삼장 (Pitaka) ] → [ 성전 (Canon) ] → [ 경전 (Sutra) ] → [ 법 (Dhamma) ] → [ 사경 (Lekhana) ] → [ 법담 (Dhamma Chat) ] */
  /**
   * 1. 법 (Dhamma) — 우주와 존재의 생생한 이치이자 모든 가르침의 근본
   * (통찰 반영: 모든 문헌과 가르침의 최상위 개념이므로 맨 앞으로 배치)
   */
  Dhamma: {
    url: 'Dhamma',
    title: 'Dhamma',
    ko: '법',
    en: 'Dhamma',
    hj: '法',
    sa: 'Dharma',
    pi: 'Dhamma',
    akasha: 'dhamma',
    icon: Icons.NaturePeople,
    color: 'text-sky-600',
    tooltip: '법 (Dhamma)\n우주와 삶이 작동하는 있는 그대로의 법칙이자\n말과 문헌을 초월한 본질적인 진리',
    navKey: 'mandala' as NavKeyType,
  },

  /**
   * 2. 성전 (Canon) — 공인된 정전 집합
   * (통찰 반영: 특정 역사적 전통/종파가 정통으로 공인한 권위 있는 문헌집임을 강조)
   */
  Canon: {
    url: 'Canon',
    title: 'Canon',
    ko: '성전',
    en: 'Canon',
    hj: '聖典',
    sa: 'Saddharma',
    pi: 'Dhammakāya',
    akasha: 'canon',
    icon: Icons.NaturePeople,
    color: 'text-fuchsia-600',
    tooltip: '성전 (Canon)\n초기·대승·티베트 등 각 전통에서\n정통으로 공인한 권위 있는 최고의 기준',
    navKey: 'mandala' as NavKeyType,
  },

  /**
   * 3. 삼장 (Pitaka) — 가르침의 그릇 및 분류 체계
   */
  Pitaka: {
    url: 'Pitaka',
    title: 'Pitaka',
    ko: '삼장',
    en: 'Pitaka',
    hj: '三藏',
    sa: 'Piṭaka',
    pi: 'Piṭaka',
    akasha: 'pitaka',
    icon: Icons.NaturePeople,
    color: 'text-amber-600',
    tooltip: '삼장 (Piṭaka)\n경(가르침)·율(계율)·론(논서)의 체계로 분류한\n부처님 말씀의 세 가지 거대한 지식 바구니',
    navKey: 'mandala' as NavKeyType,
  },

  /**
   * 4. 경전 (Sutra) — 정제된 개별 가르침
   * (통찰 반영: 성전(Canon)과의 중복을 피해 '개별 설법', '실로 꿰어낸 구체적 조항'임을 부각)
   */
  Sutra: {
    url: 'Sutra',
    title: 'Sutra',
    ko: '경전',
    en: 'Sutra',
    hj: '經典',
    sa: 'Sūtra',
    pi: 'Sutta',
    akasha: 'sutra',
    icon: Icons.NaturePeople,
    color: 'text-mauve-500',
    tooltip: '경전 (Sūtra)\n숫타니파타부터 개별 대승교설까지\n흩어지지 않게 실로 꿰어낸 붓다의 친설(親說)',
    navKey: 'mandala' as NavKeyType,
  },

  /**
   * 5. 사경 (Lekhana) — 필사와 삼매 수행
   */
  Lekhana: {
    url: 'Lekhana',
    title: 'Lekhana',
    ko: '사경',
    en: 'Lekhana',
    hj: '寫經',
    sa: 'Lekhana',
    pi: 'Lekhana',
    akasha: 'lekhana',
    icon: Icons.NaturePeople,
    color: 'text-violet-600',
    tooltip: '사경 (Lekhana)\n손끝으로 한 자 한 자 온 마음을 다해\n부처님의 지혜를 내 마음에 새기는 삼매 수행',
    navKey: 'mandala' as NavKeyType,
  },

  /**
   * 6. 법담 (Dhamma Chat) — AI 법우 및 도반 소통의 장
   */
  DhammaChat: {
    url: 'DhammaChat',
    title: 'DhammaChat',
    ko: '법담',
    en: 'Dhamma Chat',
    hj: '法談',
    sa: 'Dharma-saṃbhāṣā',
    pi: 'Dhamma-kathā',
    akasha: 'dhamma-chat',
    icon: Icons.NaturePeople,
    color: 'text-teal-500',
    tooltip: '법담 (Dhamma Chat)\nAI 법우 및 도반들과 함께 진리를\n묻고 답하는 생생한 지혜의 대화 마당',
    navKey: 'mandala' as NavKeyType,
  },

  Chat: {
    url: 'Chat',
    title: 'Chat',
    ko: '법담',
    en: 'Chat',
    hj: '法談',
    sa: 'Dharma-saṃbhāṣā',
    pi: 'Dhamma-kathā',
    akasha: 'dhamma-chat',
    icon: Icons.NaturePeople,
    color: 'text-teal-500',
    tooltip: '법담 (Dhamma Chat)\nAI 법우 및 도반들과 함께 진리를\n묻고 답하는 생생한 지혜의 대화 마당',
    navKey: 'mandala' as NavKeyType,
  },

  /**
   * 사인업
   * 회원가입
   */
  SignUp: {
    url: 'SignUp',
    title: '발심',
    ko: '귀의',
    en: 'SignUp',
    hj: '歸依',
    sa: 'Śaraṇa',
    pi: 'Saraṇa',
    icon: 'person_add',
    tooltip: '회원가입 (Signup)',
    color: 'text-sky-600',
    navKey: 'karma' as NavKeyType,
  },

  SignIn: {
    url: 'SignIn',
    title: '입선',
    ko: '입선',
    en: 'Sign in',
    hj: '入禪',
    sa: 'Samādhi',
    pi: 'Samādhi',
    tooltip: '로그인 (Signin)',
    color: 'text-sky-600',
    navKey: 'karma' as NavKeyType,
    icon: 'login',
  },

  SignOut: {
    url: 'SignOut',
    title: '회향',
    ko: '회향',
    en: 'Sign Out',
    hj: '廻向',
    sa: 'Pariṇāma',
    pi: 'Pariṇāma',
    tooltip: '로그아웃 (Signout)',
    color: 'text-sky-600',
    navKey: 'karma' as NavKeyType,
    icon: Icons.NaturePeople,
  },

  Account: {
    url: 'Account',
    title: '도반(道伴)',
    ko: '회원',
    hj: '道伴',
    en: 'Account',
    sa: '',
    pi: '',
    akasha: 'account',
    icon: Icons.NaturePeople,
    color: 'text-sky-900',
    tooltip: '나의 계정 정보 및 관리',
    navKey: 'mandala' as NavKeyType,
  },
  AccountVipassana: {
    url: 'AccountVipassana',
    title: '도반(道伴)',
    ko: '회원정보 관리',
    hj: '道伴',
    en: 'Account Vipassana',
    sa: '',
    pi: '',
    akasha: 'account vipassana',
    icon: Icons.NaturePeople,
    color: 'text-red-900',
    tooltip: '나의 계정 정보 및 관리',
    navKey: 'vipassana' as NavKeyType,
  },
  AccountRole: {
    url: 'AccountRole',
    title: '방편(方便) 목록',
    ko: '역할',
    hj: '階位',
    en: 'Hierarchy',
    sa: '',
    pi: '',
    icon: Icons.NaturePeople,
    color: 'text-sky-600',
    tooltip: '역할 및 권한',
    navKey: 'karma' as NavKeyType,
  },
  AccountRoleKarma: {
    url: 'AccountRoleKarma',
    title: '방편(方便) 관리',
    ko: '역할 관리',
    hj: '',
    en: '',
    sa: '',
    pi: '',
    icon: Icons.NaturePeople,
    color: 'text-sky-600',
    navKey: 'karma' as NavKeyType,
  },

  SecuritySettings: {
    url: 'SecuritySettings',
    title: '보안설정',
    ko: '보안설정',
    hj: '',
    en: 'Security Settings',
    sa: '',
    pi: '',
    icon: Icons.NaturePeople,
    tooltip: '보안설정',
    navKey: 'karma' as NavKeyType,
  },
  TwoFactor: {
    url: 'TwoFactor',
    title: '2단계 인증',
    ko: '2단계 인증',
    hj: '',
    en: 'Two Factor',
    sa: '',
    pi: '',
    icon: Icons.NaturePeople,
    tooltip: '2단계 인증 설정',
  },
  TwoFactorVerify: {
    url: 'TwoFactorVerify',
    title: '2단계 인증',
    ko: '2단계 인증',
    hj: '',
    en: 'Two Factor Verify',
    sa: '',
    pi: '',
    navKey: 'karma' as NavKeyType,
    icon: Icons.NaturePeople,
    tooltip: '2단계 인증',
  },
  TwoFactorDisableDialog: {
    url: 'TwoFactorDisableDialog',
    title: '보안설정 해제 (2FA)',
    ko: '2단계 인증 해제',
    hj: '',
    en: 'Two Factor DisableDialog',
    sa: '',
    pi: '',
    navKey: 'karma' as NavKeyType,
    icon: Icons.NaturePeople,
    tooltip: '2단계 인증 해제',
  },

  ConfirmEmail: {
    url: 'ConfirmEmail',
    title: '이메일 인증',
    ko: '이메일 인증',
    hj: '',
    en: 'Confirm Email',
    sa: '',
    pi: '',
    navKey: 'karma' as NavKeyType,
    icon: Icons.NaturePeople,
    color: 'text-sky-600',
    tooltip: '등록한 나의 이메일을 인증합니다.',
  },
  ChangePassword: {
    url: 'ChangePassword',
    title: '비밀번호 변경',
    ko: '비밀번호 변경',
    en: 'Change Password',
    hj: '',
    sa: '',
    pi: '',
    navKey: 'karma' as NavKeyType,
    icon: Icons.NaturePeople,
    color: 'text-sky-600',
    tooltip: '비밀번호를 변경합니다.',
  },
  BuddhaFortune: {
    url: 'BuddhaFortune',
    title: '붓다의 복',
    ko: '붓다의 복',
    hj: '',
    en: 'Buddha Fortune',
    sa: '',
    pi: '',
    navKey: 'karma' as NavKeyType,
    icon: Icons.NaturePeople,
    tooltip: '붓다의 복',
  },
  Error: { url: 'Error', title: '오류' },
  DailySutra: {
    url: 'DailySutra',
    title: 'DailySutra',
    ko: '',
    hj: '',
    en: 'DailySutra',
    sa: '',
    pi: '',
    navKey: '' as NavKeyType,
    icon: Icons.NaturePeople,
    tooltip: '',
  },
  Help: {
    url: 'Help',
    title: 'Help',
    ko: '안내',
    hj: '',
    en: 'Help',
    sa: '',
    pi: '',
    icon: Icons.NaturePeople,
    color: 'text-sky-600',
    tooltip: '',
    navKey: 'mandala' as NavKeyType,
  },
  Guide: {
    url: 'Guide',
    title: 'Guide',
    ko: '안내',
    hj: '法指南',
    en: 'Guide',
    sa: 'Dharmadīpa',
    pi: 'Dhammadīpa',
    icon: Icons.NaturePeople,
    color: 'text-sky-600',
    tooltip: '법을 찾는 사람을 위한 길잡이',
    navKey: 'mandala' as NavKeyType,
  },

  ForgotPassword: {
    url: 'ForgotPassword',
    title: '비밀번호 찾기',
    ko: '비밀번호 찾기',
    hj: '',
    en: 'Forgot Password',
    sa: '',
    pi: '',
    icon: 'password_2',
    color: 'text-sky-600',
    tooltip: '분실된 비밀번호 찾기',
    navKey: 'karma' as NavKeyType,
  },

  ResetPassword: {
    url: 'ResetPassword',
    title: '비밀번호 재설정',
    ko: '비밀번호 재설정',
    hj: '',
    en: 'ResetPassword',
    sa: '',
    pi: '',
    navKey: '' as NavKeyType,
    icon: Icons.NaturePeople,
    color: 'text-sky-600',
    tooltip: '새로운 비밀번호로 설정하세요.',
  },

  VerifyEmail: {
    url: 'VerifyEmail',
    title: '메일인증',
    ko: '이메일 인증',
    hj: '',
    en: 'Verify Email',
    sa: '',
    pi: '',
    navKey: '' as NavKeyType,
    icon: Icons.NaturePeople,
    color: 'text-sky-600',
    tooltip: '이메일 인증위하여 메일을 전송하고 확인용 메일을 수신합니다.',
  },
  VerifyEmailKarma: {
    url: 'VerifyEmailKarma',
    title: '이메일 인증',
    ko: '이메일 인증',
    hj: '',
    en: 'Verify Email',
    sa: '',
    pi: '',
    navKey: '' as NavKeyType,
    icon: Icons.NaturePeople,
    color: 'text-sky-600',
    tooltip: '이메일 인증위하여 메일을 전송하고 확인용 메일을 수신합니다.',
    access: {
      hideWhen: {
        emailConfirmed: true
      }
    }
  },
  UserInfo: {
    url: 'UserInfo',
    title: '회원 정보',
    ko: '회원 정보',
    hj: '',
    en: 'User Info',
    sa: '',
    pi: '',
    navKey: '' as NavKeyType,
    icon: Icons.NaturePeople,
    color: 'text-sky-600',
    tooltip: '관리자용 회원관리',
    access: {
      requiresAuth: true,
      roles: ['Admin'],
      roleMatchMode: 'any'
    }
  },
  Auth: {
    url: 'Auth',
    title: '프로파일',
    ko: '나의정보',
    hj: '',
    en: 'Auth',
    sa: '',
    pi: '',
    navKey: '' as NavKeyType,
    icon: Icons.NaturePeople,
    color: 'text-amber-600',
    tooltip: '나의 정보',
    access: {
      requiresAuth: true,
      roles: ['Admin', 'User', 'Verified'],
      roleMatchMode: 'any'
    }
  },
  Nirvana: {
    url: 'Nirvana',
    title: '열반(涅槃)',
    ko: '해탈',
    hj: '解脫',
    en: 'Nirvana',
    sa: '',
    pi: '',
    akasha: 'nirvana',
    icon: Icons.NaturePeople,
    tooltip: '가입해지',
    color: 'text-rose-900',
    navKey: 'karma' as NavKeyType,
    access: {
      requiresAuth: true,
      roles: ['User'],
      roleMatchMode: 'any'
    }

  },
  DharmaChat: {
    url: 'DharmaChat',
    title: '반야담소',
    ko: '반야담소',
    hj: '般若談所',
    en: 'Dharma Chat',
    sa: '',
    pi: '',
    navKey: '' as NavKeyType,
    icon: Icons.NaturePeople,
    color: 'text-teal-600',
    tooltip: '흐르는 물처럼 막힘없는 대화 속에서 부처님의 지혜(반야)를 만나보세요.',
  },
  AppleSyscall: {
    url: 'AppleSyscall',
    title: 'AppleSyscall',
    ko: '어셈블리',
    hj: '組合言語',
    en: 'AppleSyscall',
    sa: '',
    pi: '',
    navKey: '' as NavKeyType,
    icon: Icons.NaturePeople,
    tooltip: '어셈블리 시스템콜 사전',
  },


} as const satisfies Record<string, IMenuItem>;
