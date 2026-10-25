import { ReactionType } from '@enums/reaction-type';

export interface IReply {
  id: number | string;
  rootId?: number | string | null;
  parentId?: number | string | null;
  userId?: number | string;
  avatar?: string | null;
  pseudonym: string;
  mentionedUserName?: string | null;
  content: string;
  createdAt: string | Date;
  replyCount?: number;
  currentReaction: ReactionType;
  hapjangCount: number;
  lotusCount: number;
  meritCount: number;
}
