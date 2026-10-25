import { computed, Service, signal } from '@angular/core';
import { IChatMessage } from '@app/core/interfaces/chat/i-chat-message';
import { IChatRoom } from '@app/core/interfaces/chat/i-chat-room';
import { IChatRoomParticipant } from '@app/core/interfaces/chat/i-chat-room-participant';
import { BaseService } from '@app/core/services/base/base.service';
import { Subject } from 'rxjs';

@Service()
export class ChatStoreService extends BaseService {
  // * 방 전체목록
  public rooms = signal<IChatRoom[]>([]);
  // * 현재 들어와 있는 방 정보
  public room = signal<IChatRoom | null>(null);
  // * 페이징/더보기 정보
  public hasMoreMessages = signal<boolean>(false);
  public isLoadingMore = signal<boolean>(false);
  public currentPage = signal<number>(1);
  public totalPages = signal<number>(1);
  // * 현재 선택된 방 ID
  public currentRoomId = signal<string | null>(null);

  public currentRoom = computed(() => {
    const roomId = this.currentRoomId();
    return roomId ? this.rooms().find(x => x.id === roomId) : null;
  });
  // * 메시지 (방별로 단일 맵으로 관리 - currentMessages 오타 수정)
  public messageByRoom = signal<Map<string, IChatMessage[]>>(new Map());

  public currentMessages = computed(() => {
    const roomId = this.currentRoomId();
    return roomId ? this.messageByRoom().get(roomId) || [] : [];
  });

  // * 메시지 히스토리 (방별로 단일 맵으로 통합 관리)
  private messageHistoryByRoom = signal<Map<string, IChatMessage[]>>(new Map());
  public currentHistoryByRoom = computed(() => {
    const roomId = this.currentRoomId();
    return roomId ? this.messageHistoryByRoom().get(roomId) || [] : [];
  });
  // * 참여자 (방별로 저장)
  public participantsByRoom = signal<Map<string, IChatRoomParticipant[]>>(new Map());
  public currentParticipants = computed(() => {
    const roomId = this.currentRoomId();
    return roomId ? this.participantsByRoom().get(roomId) || [] : [];
  });
  private _participants = new Subject<IChatRoomParticipant[] | null>();
  public participants$ = this._participants.asObservable();
  // * 시스템 메시지 및 에러
  public systemMessage = signal<string | null>(null);
  public joinedMessage = signal<string | null>(null);
  public error = signal<string | null>(null);
  constructor() {
    super();
    const savedRoomId = localStorage.getItem('chat_current_room');
    if (savedRoomId) {
      this.currentRoomId.set(savedRoomId);
    }
  }
  // ==================== 방 관리 ====================
  setRooms(rooms: IChatRoom[]) {
    this.rooms.set(rooms);
  }
  setRoom(room: IChatRoom) {
    this.room.set(room);
  }
  addRoom(room: IChatRoom) {
    this.rooms.update(rooms => [...rooms, room]);
  }
  removeRoom(roomId: string) {
    this.rooms.update(rooms => rooms.filter(x => x.id !== roomId));
  }
  setCurrentRoom(roomId: string | null) {
    this.currentRoomId.set(roomId);
    if (roomId) {
      localStorage.setItem('chat_current_room', roomId);
    } else {
      localStorage.removeItem('chat_current_room');
    }
  }
  clearCurrentRoom() {
    this.setCurrentRoom(null);
  }
  // ==================== 메시지 관리 ====================
  addMessage(roomId: string, message: IChatMessage) {
    this.messageByRoom.update(map => {
      const messages = map.get(roomId) || [];
      map.set(roomId, [...messages, message]);
      return new Map(map);
    });
  }
  setMessageHistoryByRoom(roomId: string, items: IChatMessage[]) {
    this.messageHistoryByRoom.update(map => {
      map.set(roomId, items);
      return new Map(map);
    });
  }
  prependMessageHistory(roomId: string, items: IChatMessage[]) {
    this.messageHistoryByRoom.update(map => {
      const current = map.get(roomId) || [];
      map.set(roomId, [...items, ...current]);
      return new Map(map);
    });
  }
  removeMessage(messageId: string) {
    this.messageByRoom.update(map => {
      const newMap = new Map(map);
      for (const [roomId, messages] of newMap) {
        newMap.set(roomId, messages.filter(x => x.id !== messageId));
      }
      return newMap;
    });
  }
  // ==================== 참여자 관리 ====================
  setParticipants(roomId: string, participants: IChatRoomParticipant[]) {
    if (!roomId) return;
    this.participantsByRoom.update(map => {
      map.set(roomId, participants);
      this._participants.next(participants);
      return new Map(map);
    });
  }
  addParticipant(roomId: string, participant: IChatRoomParticipant) {
    this.participantsByRoom.update(map => {
      const participants = map.get(roomId) || [];
      map.set(roomId, [...participants, participant]);
      return new Map(map);
    });
  }
  removeParticipants(roomId: string, userId: string) {
    this.participantsByRoom.update(map => {
      const participants = map.get(roomId) || [];
      map.set(roomId, participants.filter(x => x.userId !== userId));
      return new Map(map);
    });
  }
  // ==================== 공통 초기화 ====================
  reset() {
    this.rooms.set([]);
    this.room.set(null);
    this.currentRoomId.set(null);
    this.messageByRoom.set(new Map());
    this.messageHistoryByRoom.set(new Map());
    this.participantsByRoom.set(new Map());
    this.systemMessage.set(null);
    this.joinedMessage.set(null);
    this.error.set(null);
    localStorage.removeItem('chat_current_room');
  }
}
