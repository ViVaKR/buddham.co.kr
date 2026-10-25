export interface IChatBase {
  room: string;
  user: string;
}

export interface IChatView extends IChatBase { }
export interface IChatEvent extends IChatBase {
  kind: 'join' | 'leave'
  at: Date
}
export interface IChatPayload extends IChatBase {
  id: string;
  siteId: string;
  text: string;
  sentAt: string;
}
