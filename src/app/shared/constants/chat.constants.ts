// chat-method.ts

/**
 * 🚀 C# ChatHub 백엔드와 100% 동기화된 실시간 채팅 이벤트 상수
 */
export const ChatMethod = {

  // ==================== 연결 관련 ====================
  Connected: 'Connected',

  // ==================== 방 목록 및 정보 관련 ====================
  GetRooms: 'GetRooms',
  CreateRoom: 'CreateRoom',
  DeleteRoom: 'DeleteRoom',
  JoinRoom: 'JoinRoom',
  LeaveRoom: 'LeaveRoom',
  ReceiveRooms: 'ReceiveRooms',
  ReceiveRoomInfo: 'ReceiveRoomInfo',
  RoomCreated: 'RoomCreated',
  RoomDeleted: 'RoomDeleted',

  // ==================== 방 입장 / 퇴장 / 참여자 관련 ====================
  JoinedRoom: 'JoinedRoom',
  UserJoined: 'UserJoined',
  UserLeft: 'UserLeft',
  ReceiveParticipants: 'ReceiveParticipants',

  // ==================== 메시지 및 에러 관련 ====================

  SendMessage: 'SendMessage',
  ReceiveMessage: 'ReceiveMessage',
  GetRoomMessages: 'GetRoomMessages',
  GetRoomParticipants: 'GetRoomParticipants',
  ReceiveMessageHistory: 'ReceiveMessageHistory',
  DeleteMessage: 'DeleteMessage',
  Error: 'Error',

  // ==== ETC ===
  GetPseudonymName: 'GetPseudonymName'

} as const; // 💡 읽기 전용 철통 가드!

/**
 * 🔮 오직 ChatMethod의 값들만 허용하는 초현대식 마법의 자동완성 타입
 * 상수가 추가되면 이 타입도 알아서 삼라만상의 이치대로 자동 진화합니다!
 */
export type ChatMethodType = typeof ChatMethod[keyof typeof ChatMethod];
