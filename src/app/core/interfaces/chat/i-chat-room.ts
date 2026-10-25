import { IChatMessage } from "@app/core/interfaces/chat/i-chat-message";
import { IChatRoomParticipant } from "@app/core/interfaces/chat/i-chat-room-participant";

export interface IChatRoom {
  id: string;
  roomName: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  messages?: IChatMessage[];
  createdAt: Date;
  isActive: boolean;
  participants?: IChatRoomParticipant[];
  currentParticipants: number;
}
