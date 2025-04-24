// 클라이언트 측 로컬 스토리지 기반 데이터베이스
// 이 파일은 클라이언트 컴포넌트에서 직접 데이터에 접근할 때 사용합니다.

import { getFromStorage, saveToStorage, generateId } from "./utils"
import type { Product } from "@/types/product"
import type { User } from "@/types/user"
import type { ChatMessage, ChatRoom } from "@/types/chat"

// 클라이언트 측에서 직접 사용할 수 있는 함수들
export function getClientProducts(): Product[] {
  // TODO: DB 연동용 함수로 새로 작성하세요.
  return []
}

export function getClientProductById(id: string): Product | null {
  // TODO: DB 연동용 함수로 새로 작성하세요.
  return null
}

export function getClientProductsBySellerId(sellerId: string): Product[] {
  // TODO: DB 연동용 함수로 새로 작성하세요.
  return []
}

export function getClientUserById(id: string): User | null {
  // TODO: DB 연동용 함수로 새로 작성하세요.
  return null
}

export function getClientChatMessages(roomId: string): ChatMessage[] {
  // TODO: DB 연동용 함수로 새로 작성하세요.
  return []
}

export function getClientChatRooms(userId: string): ChatRoom[] {
  // TODO: DB 연동용 함수로 새로 작성하세요.
  return []
}

export function createClientChatMessage(data: {
  senderId: string
  roomId: string
  content: string
  senderName: string
}): ChatMessage {
  // TODO: DB 연동용 함수로 새로 작성하세요.
  return {
    id: "",
    senderId: "",
    senderName: "",
    content: "",
    createdAt: "",
    roomId: "",
  }
}
