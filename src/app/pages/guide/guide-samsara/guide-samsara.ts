import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { IGuideComment, IGuideView } from '@app/core/interfaces/api/request/i-guide.request';
import { IThreadConfig } from '@app/core/interfaces/ui/i-thread-config';
import { Paths } from '@app/data/menu-data';
import { GUIDE_COLUMNS } from '@app/layout/table-columns/guide.columns';
import { CursorAccordionTable } from '@app/layout/cursor-accordion-table/cursor-accordion-table';
import { TitleLayout } from '@app/layout/title-layout/title-layout';
import { BodyLayout } from '@app/layout/body-layout/body-layout';
import { UserStore } from '@services/auth/user.store';
import { GuideService } from '@app/pages/guide/services/guide.service';

@Component({
  selector: 'guide-samsara',
  imports: [CursorAccordionTable, TitleLayout, BodyLayout],
  templateUrl: './guide-samsara.html',
  styleUrl: './guide-samsara.scss',
  providers: [DatePipe, CurrencyPipe],
})
export default class GuideSamsara {
  title = Paths.Guide.ko;
  color = Paths.Guide.color;
  readonly detailUrl = `${Paths.Guide.url}/karma`;
  readonly service = inject(GuideService);
  readonly userStore = inject(UserStore);
  readonly selectedData = signal<IGuideView | null>(null);
  readonly columns = GUIDE_COLUMNS;

  // 🔥 3개 타입 아규먼트 명시
  readonly threadConfig: IThreadConfig<
    IGuideView, // T
    IGuideComment, // U
    { isLiked: boolean; likeCount: number } // R
  > = {
      fetchRepliesUrl: this.service.getReplies,
      createCommentFn: this.service.createComment,
      createReplyFn: this.service.createReply,
      canDeleteFn: (item: IGuideComment) => item.userId === this.userStore.userId(),
      deleteReplyFn: this.service.deleteComment,
      getAvatarUrlFn: this.service.getAvatar,
      toggleReactionFn: this.service.toggleReaction,
    };

  onReceiveData(data: IGuideView) {
    this.selectedData.set(data);
  }
}
