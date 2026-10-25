import { ReactionType } from '@enums/reaction-type';

export interface IReactionResponse {
  currentReaction: ReactionType;
  hapjangCount: number;
  lotusCount: number;
  meritCount: number;
}
