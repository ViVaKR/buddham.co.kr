import { inject, Service, signal } from '@angular/core';
import { IChatResponse } from '@app/core/interfaces/api/i-response';
import { IChatMessage } from '@app/core/interfaces/chat/i-chat-message';
import { IChatRoom } from '@app/core/interfaces/chat/i-chat-room';
import { IChatRoomParticipant } from '@app/core/interfaces/chat/i-chat-room-participant';
import { BaseService } from '@app/core/services/base/base.service';
import { ChatConnectionService } from '@app/core/services/chat/chat-connection.service';
import { ChatStoreService } from '@app/core/services/chat/chat-store.service';
import { ChatMethod } from '@app/shared/constants/chat.constants';

@Service()
export class ChatEventService extends BaseService {

  private registered = signal<boolean>(false);
  private readonly chatConnectionService = inject(ChatConnectionService);
  private readonly chatStoreService = inject(ChatStoreService);

  unregisterEvents() {
    const hub = this.chatConnectionService.hub;
    if (!hub) return;
    Object.values(ChatMethod).forEach(method => hub.off(method));
    this.registered.set(false);
  }

  registerGlobalEvents() {
    if (this.registered()) return;
    const hub = this.chatConnectionService.hub;

    if (!hub)
      throw new Error('초기화 되지 않았습니다.');

    this.unregisterEvents();

    // * 연결
    hub.on(ChatMethod.Connected, (connectionId: string) => {
      this.chatStoreService.systemMessage.set(`(${connectionId}) 서버에 연결되었습니다.`);
    });

    // ==================== 방 목록 ====================

    // * 전체 방 목록 수신
    hub.on(ChatMethod.ReceiveRooms, (rooms: IChatRoom[]) => this.chatStoreService.setRooms(rooms));

    // * 현재 방 목록 수신
    hub.on(ChatMethod.ReceiveRoomInfo, (room: IChatRoom) => this.chatStoreService.setRoom(room));

    // * (방장) 방 생성 수신
    hub.on(ChatMethod.RoomCreated, (room: IChatRoom) => this.chatStoreService.setRoom(room));

    // * (방장) 방 삭제 (방에 있던 '모든 사람' 이 이코들 실행하게 됨)
    hub.on(ChatMethod.RoomDeleted, (roomId: string) => {
      this.chatStoreService.removeRoom(roomId);
      this.alertService.openSheetAsync([{ title: '방이 삭제되어 로비로 이동합니다.' }]);
    });

    // ==================== 방 입장/퇴장 ====================

    // *  방참여
    // * (방참여) 사용자 입장
    hub.on(ChatMethod.UserJoined, (data: IChatRoomParticipant) => {
      this.chatStoreService.addParticipant(data.roomId, data);
      this.chatStoreService.systemMessage.set(`${data.userName}님이 입장했습니다.`);
      this.chatStoreService.joinedMessage.set(`${data.userName}님이 입장했습니다.`);
    });

    // * 사용자 퇴장
    hub.on(ChatMethod.UserLeft, (data: { userName: string; userId: string, roomId: string }) => {
      this.chatStoreService.removeParticipants(data.roomId, data.userId);
      this.chatStoreService.systemMessage.set(`${data.userName}님이 퇴장했습니다.`);
    });

    // ==================== 메시지 ====================

    // * 메시지 수신
    hub.on(ChatMethod.ReceiveMessage, (message: IChatMessage) => this.chatStoreService.addMessage(message.roomId, message));

    // * 메시지 히스토리
    hub.on(ChatMethod.ReceiveMessageHistory, (messges: IChatResponse<IChatMessage>) => {

      const items = messges.items ?? [];
      const roomId = this.chatStoreService.currentRoomId();
      if (!roomId) return;
      if (this.chatStoreService.isLoadingMore()) {
        // 더보기 클릭 -> 앞에 붙이기
        this.chatStoreService.prependMessageHistory(roomId, items);
      } else {
        // 최초 로드 -> 새로 갱신
        this.chatStoreService.setMessageHistoryByRoom(roomId, items);
      }
      // 페이지 메타 업데이트
      this.chatStoreService.currentPage.set(messges.pageNumber);
      this.chatStoreService.totalPages.set(messges.totalPages);
      this.chatStoreService.hasMoreMessages.set(messges.hasNextPage);
      this.chatStoreService.isLoadingMore.set(false);
    });

    // ==================== 참여자 ====================
    hub.on(ChatMethod.ReceiveParticipants, (data: {
      roomId: string;
      participants: IChatRoomParticipant[]
    }) => {
      this.chatStoreService.setParticipants(data.roomId, data.participants);
    });

    // ==================== 에러 ====================
    hub.on(ChatMethod.Error, (error: string) => {
      this.chatStoreService.error.set(error);
    });

    this.registered.set(true);
  }
}
