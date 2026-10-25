import { computed, inject, Service, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { IUserRoleRequest } from '@app/core/interfaces/api/request/i-user-role.request';
import { BaseService } from '@app/core/services/base/base.service';
import { FileUploadService } from '@app/core/services/file/file-upload-service';
import { IUserInfoView } from '@app/pages/user-info/interfaces/i-user-info';

@Service()
export class UserStore extends BaseService {
  private readonly fileUploadService = inject(FileUploadService);

  private static readonly NO_AVATAR = 'buddha.png';
  public readonly defaultAvatar = '/assets/avatars/buddha.png';

  // ── 1. 데이터의 유일한 원천 (Single Source of Truth) ──────────────────
  private readonly _user = signal<IUserInfoView | null>(null);
  private readonly _isInitialized = signal(false);

  // ── 2. 외부 노출용 시그널 (완벽하게 일원화) ──────────────────────────
  readonly user = this._user.asReadonly();
  readonly currentUser = computed(() => this._user);
  readonly isInitialized = this._isInitialized.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  // ── 아바타 ─────────────────────────────────────────────────────
  // readonly avatar = computed(() => {
  //   const user = this._user(); // 원본 직결
  //   if (!user || !user.avatar) return this.defaultAvatar;
  //   // 2. 캐시 방지(Cache Busting)를 위한 타임스탬프 추가
  //   const timestamp = new Date().getTime();
  //   const fullPath = user.avatar?.startsWith('/') ? user.avatar : `/${this.defaultAvatar}`;
  //   return `${this.apiUrl}${fullPath}?v=${timestamp}`;
  // });

  readonly avatar = computed(() => {
    const path = this._user()?.avatar?.trim();

    // null, 빈값, 센티널 → 로컬 기본 이미지
    if (!path || path.toLowerCase() === UserStore.NO_AVATAR) {
      return this.defaultAvatar;
    }

    // '/' 유무와 상관없이 정규화 (avatarUpdated$ 경로 형식이 달라도 안전)
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiUrl}${normalized}`;
  });

  // RxJS 호환용
  // 외부 가드나 다른 레거시에서 필요할 때만 단방향으로 제공
  public readonly user$ = toObservable(this._user);

  // ── Computed ─────────────────────────────────────────────────────────────
  readonly isEmailConfirmed = computed(() => this._user()?.emailConfirmed ?? false);

  readonly userRoles = computed(() => {
    const roles = this.user()?.roles;
    if (!roles) return [];
    return Array.isArray(roles) ? roles : [roles];
  });

  readonly isAdmin = computed(() => this.userRoles().some((r) => r.en === 'Admin'));

  readonly userRoleNamesKo = computed(() => {
    const rawRoles = this.user()?.roles;
    if (!rawRoles || !Array.isArray(rawRoles)) return [];
    return rawRoles.map((r) => (typeof r === 'string' ? r : r.ko));
  });

  readonly userId = computed(() => this._user()?.id ?? null);
  readonly userPseudonym = computed(() => this._user()?.pseudonym ?? '');
  readonly userEmail = computed(() => this._user()?.email ?? null);

  constructor() {
    super();
    this.fileUploadService.avatarUpdated$.subscribe((path) => {
      this.patchUser({ avatar: path });
    });
  }

  // ── Methods ──────────────────────────────────────────────────────────────
  setUser(user: IUserInfoView): void {
    this._user.set(user);
    this._isInitialized.set(true);
  }

  updateUser(user: IUserInfoView): void {
    this._user.set(user);
  }

  patchUser(updates: Partial<IUserInfoView>): void {
    const current = this._user();
    if (current) this._user.set({ ...current, ...updates });
  }

  setInitialized(): void {
    this._isInitialized.set(true);
  }

  clear(): void {
    this._user.set(null);
    this._isInitialized.set(true);
  }

  hasRole(roleName: string): boolean {
    return this.userRoles().some((r) => r.en === roleName);
  }

  hasAnyRole(roles: string[] | IUserRoleRequest[]): boolean {
    const userRoles = this.userRoles();
    const roleNames = this.normalizeRoles(roles); // ← string[]로 정규화
    return roleNames.some((name) => userRoles.some((r) => r.en === name));
  }

  hasAllRoles(roles: string[] | IUserRoleRequest[]): boolean {
    const userRoles = this.userRoles();
    const roleNames = this.normalizeRoles(roles);
    return roleNames.every((name) => userRoles.some((r) => r.en === name));
  }

  // ✅ string | IUserRoleRequest 둘 다 → string[] 으로 정규화
  private normalizeRoles(roles: string[] | IUserRoleRequest[]): string[] {
    return roles.map((r) => (typeof r === 'string' ? r : r.en));
  }
}
