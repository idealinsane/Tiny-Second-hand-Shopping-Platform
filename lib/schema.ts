import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

// 사용자 테이블
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  bio: text("bio"),
  createdAt: text("createdAt").notNull(),
  isAdmin: integer("isAdmin", { mode: "boolean" }).notNull().default(false),
  isSuspended: integer("isSuspended", { mode: "boolean" }).notNull().default(false),
  reportCount: integer("reportCount").notNull().default(0),
})

// 상품 테이블
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("imageUrl"),
  sellerId: text("sellerId").notNull(),
  sellerName: text("sellerName").notNull(),
  createdAt: text("createdAt").notNull(),
  status: text("status").notNull(),
  reportCount: integer("reportCount").notNull().default(0),
})

// 신고 테이블
export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  reporterId: text("reporterId").notNull(),
  targetType: text("targetType").notNull(),
  targetId: text("targetId").notNull(),
  reason: text("reason").notNull(),
  createdAt: text("createdAt").notNull(),
  status: text("status").notNull(),
})

// 채팅방 테이블
export const chatRooms = sqliteTable("chatRooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isGlobal: integer("isGlobal", { mode: "boolean" }).notNull(),
  participants: text("participants").notNull(), // JSON 문자열로 저장
  lastMessage: text("lastMessage"),
  lastMessageTime: text("lastMessageTime"),
})

// 채팅 메시지 테이블
export const chatMessages = sqliteTable("chatMessages", {
  id: text("id").primaryKey(),
  senderId: text("senderId").notNull(),
  senderName: text("senderName").notNull(),
  content: text("content").notNull(),
  createdAt: text("createdAt").notNull(),
  roomId: text("roomId").notNull(),
})
