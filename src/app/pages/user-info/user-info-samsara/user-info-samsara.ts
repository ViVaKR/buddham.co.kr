import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { IThreadConfig } from '@app/core/interfaces/ui/i-thread-config';
import { UserStore } from '@app/core/services/auth/user.store';
import { Paths } from '@app/data/menu-data';
import { ACCOUNT_USER_COLUMNS } from '@app/layout/table-columns/account-user.columns';
import { IUserInfoComment, IUserInfoView } from '@app/pages/user-info/interfaces/i-user-info';
import { UserInfoService } from '@app/pages/user-info/services/user-info.service';
import { BodyLayout } from "@app/layout/body-layout/body-layout";
import { TitleLayout } from "@app/layout/title-layout/title-layout";
import { CursorAccordionTable } from "@app/layout/cursor-accordion-table/cursor-accordion-table";

@Component({
  selector: 'user-info-samsara',
  imports: [BodyLayout, TitleLayout, CursorAccordionTable],
  templateUrl: './user-info-samsara.html',
  styleUrl: './user-info-samsara.scss',
  providers: [DatePipe, CurrencyPipe]
})
export default class UserInfoSamsara {
  title = Paths.UserInfo.ko;
  color = Paths.UserInfo.color;

  readonly detailUrl = `${Paths.UserInfo.url}/karma`;
  readonly service = inject(UserInfoService);
  readonly userStore = inject(UserStore);
  readonly selectedData = signal<IUserInfoView | null>(null);
  readonly columns = ACCOUNT_USER_COLUMNS;

  readonly threadConfig: IThreadConfig<
    IUserInfoView,
    IUserInfoComment,
    { isLiked: boolean; likeCount: number }
  > = {
      fetchRepliesUrl: this.service.getReplies,
      createCommentFn: this.service.createComment,
      createReplyFn: this.service.createReply,
      canDeleteFn: (item: IUserInfoComment) => item.userId === this.userStore.userId(),
      deleteReplyFn: this.service.deleteComment,
      getAvatarUrlFn: this.service.getAvatar,
      toggleReactionFn: this.service.toggleReaction,
    }

  onReceiveData(data: IUserInfoView) {
    this.selectedData.set(data);
  }
}
