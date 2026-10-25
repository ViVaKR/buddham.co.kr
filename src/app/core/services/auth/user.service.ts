import { inject, Service } from '@angular/core';
import { IDataResponse, IResponse } from '@app/core/interfaces/api/i-response';
import { TokenStorage } from '@app/core/services/auth/token.storage';
import { UserStore } from '@app/core/services/auth/user.store';
import { BaseService } from '@app/core/services/base/base.service';
import { catchError, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { IChangePasswordRequest, IUpdateFullNameRequest, IUpdatePsedonymRequest } from '@interfaces/api/request/i-auth.request';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { IUserInfoView } from '@app/pages/user-info/interfaces/i-user-info';

@Service()
export class UserService extends BaseService {
  private readonly userStore = inject(UserStore);
  private readonly tokenStorage = inject(TokenStorage);
  private currentUserRequest$: Observable<IUserInfoView | undefined | null> | null = null;

  getUserDetail(): Observable<IUserInfoView | undefined | null> {

    if (!this.tokenStorage.getAccessToken()) return of(null);
    if (this.currentUserRequest$) return this.currentUserRequest$;

    this.currentUserRequest$ = this.http.get<IDataResponse<IUserInfoView>>(`${this.apiUrl}/User/ReadInfo`).pipe(
      tap((user) => {
        this.userStore.setUser(user.content!);
      }),
      map((user) => user.content),
      catchError((error: HttpErrorResponse) => {
        this.alertService.openSheet([{
          title: '회원정보 가져오기 실패',
          content: `${error.status}: ${error.statusText}`
        }]);
        return of(null);
      }),
      finalize(() => {
        this.currentUserRequest$ = null;
      }),
      shareReplay(1),
    );
    return this.currentUserRequest$;
  }

  updateMyInfo(user: IUserInfoView): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/User/Update/${user.id}`, user)
      .pipe(tap(() => this.userStore.updateUser(user)));
  }

  getUserList(): Observable<IDataResponse<IUserInfoView[]>> {
    return this.http.get<IDataResponse<IUserInfoView[]>>(`${this.apiUrl}/Auth/Users`);
  }

  getUserById(userId: string): Observable<IDataResponse<IUserInfoView>> {
    return this.http.get<IDataResponse<IUserInfoView>>(`${this.apiUrl}/Auth/Users/${userId}`);
  }

  /** 이메일 중복 체크 */
  checkEmail(data: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/Auth/CheckEmail`, { email: data });
  }

  /** 필명 중복 체크 */
  checkPseudonym(data: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/Auth/CheckPseudonym`, { pseudonym: data });
  }

  // * 비밀번호 변경 (회원용)
  /** 비밀번호 변경 (회원용) */
  changePassword(data: Omit<IChangePasswordRequest, 'newPasswordConfirm'>): Observable<IDataResponse<boolean>> {
    return this.http.put<IResponse>(`${this.apiUrl}/Auth/ChangePassword`, data);
  }

  // * 필명 수정 (회원용)
  updatePseudonym(id: string, data: IUpdatePsedonymRequest): Observable<boolean> {
    return this.http.put<boolean>(`${this.apiUrl}/Auth/UpdatePseudonymAuth/${id}`, data);
  }

  // * 법명/불명 수정 (회원용)
  updateFullName(id: string, data: IUpdateFullNameRequest): Observable<boolean> {
    return this.http.put<boolean>(`${this.apiUrl}/Auth/UpdateFullNameAuth/${id}`, data);
  }

  // * 회원 탈퇴 처리
  withdraw(password: string): Observable<IResponse> {
    const queryParams = new HttpParams()
      .set('password', password);
    return this.http.delete<IResponse>(`${this.apiUrl}/Auth/Withdraw`, { params: queryParams });
  }
}
