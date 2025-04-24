export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
  roomId: string
}

export interface ChatRoom {
  id: string
  name: string
  isGlobal: boolean
  participants: string[]
  lastMessage?: string
  lastMessageTime?: string
}
