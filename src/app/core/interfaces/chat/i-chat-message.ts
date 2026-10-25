export interface IChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  avatar: string;
  content: string;
  sentAt: Date;
}
