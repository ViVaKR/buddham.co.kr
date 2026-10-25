export interface IChatRoomParticipant {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  avatar: string;
  connectionId?: string;
  joinedAt: Date;
  leftAt?: Date;
  isOnline: boolean;
}
