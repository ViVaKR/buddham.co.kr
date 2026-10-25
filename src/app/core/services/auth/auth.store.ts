import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IUserInfoView } from '@app/pages/user-info/interfaces/i-user-info';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthStore {

  private _isLoggedIn = new BehaviorSubject<boolean>(false);

  private _currentUser = new BehaviorSubject<IUserInfoView | null>(null);

  private isLoggedIn$ = this._isLoggedIn.asObservable();

  private currentUser$ = this._currentUser.asObservable();

  public readonly isLoggedIn = toSignal(this.isLoggedIn$, { initialValue: false });

  /** 현재 유저 서비스 */
  public readonly currentUser = toSignal(this.currentUser$, { initialValue: null });

  /**  로그인 유저 업데이트 */
  public updateCurrentUser = (user: IUserInfoView) => this._currentUser.next(user);

  /**
   * 로그인 유저 설정
   */
  public setLogin(user: IUserInfoView | null) {
    this._isLoggedIn.next(true);
    this._currentUser.next(user);
  }

  public clear() {
    this._isLoggedIn.next(false);
    this._currentUser.next(null);
  }
}
