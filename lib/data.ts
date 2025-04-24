import type { Product } from "@/types/product";
import type { User } from "@/types/user";
import type { Report } from "@/types/report";
import type { ChatMessage, ChatRoom } from "@/types/chat";
import { prisma } from "@/lib/prisma";

function fixProductImageUrl<T extends { imageUrl: string | null }>(p: T): Omit<T, 'imageUrl'> & { imageUrl: string } {
  return { ...p, imageUrl: p.imageUrl ?? "" };
}

// 상품 관련 함수
export async function getProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { status: { not: "removed" } }, 
    include: {
      seller: { select: { username: true } }
    },
    orderBy: { createdAt: "desc" },
  });
  return products.map((p) => {
    const base = { ...p, sellerName: p.seller?.username ?? "" };
    return fixProductImageUrl(base);
  });
}

export async function getProductById(id: string): Promise<Product | null> {
  const p = await prisma.product.findUnique({
    where: { id },
    include: { seller: { select: { username: true } } },
  });
  if (!p || p.status === "removed") return null; 
  const base = { ...p, sellerName: p.seller?.username ?? "" };
  return fixProductImageUrl(base);
}

export async function getProductsBySellerId(sellerId: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { sellerId, status: { not: "removed" } }, 
    include: { seller: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });
  return products.map((p) => {
    const base = { ...p, sellerName: p.seller?.username ?? "" };
    return fixProductImageUrl(base);
  });
}

export async function createProduct(data: {
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  sellerId: string;
}): Promise<Product> {
  const p = await prisma.product.create({
    data: {
      ...data,
      status: "available",
    },
    include: { seller: { select: { username: true } } },
  });
  const base = { ...p, sellerName: p.seller?.username ?? "" };
  return fixProductImageUrl(base);
}

export async function updateProduct(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    status: string;
  }>
): Promise<Product | null> {
  const p = await prisma.product.update({
    where: { id },
    data,
    include: { seller: { select: { username: true } } },
  });
  if (!p) return null;
  const base = { ...p, sellerName: p.seller?.username ?? "" };
  return fixProductImageUrl(base);
}

export async function deleteProduct(id: string): Promise<Product | null> {
  const p = await prisma.product.update({
    where: { id },
    data: { status: "removed" },
    include: { seller: { select: { username: true } } },
  });
  if (!p) return null;
  const base = { ...p, sellerName: p.seller?.username ?? "" };
  return fixProductImageUrl(base);
}

// 사용자 관련 함수
export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  // DB 연동 코드 작성 필요
  return null;
}

export async function getUsers(): Promise<User[]> {
  // Prisma에서 모든 사용자 목록을 가져옴
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  return users;
}

export async function updateUser(
  id: string,
  data: Partial<{
    username: string;
    bio: string;
    isSuspended: boolean;
  }>
): Promise<User | null> {
  const user = await prisma.user.update({
    where: { id },
    data,
  });
  return user;
}

// 신고 관련 함수
export async function getReports(): Promise<Report[]> {
  // Prisma에서 모든 신고 내역을 가져옴
  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { username: true } },
      product: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return reports.map((r) => ({
    ...r,
    reporterName: r.reporter?.username ?? "",
  }));
}

export async function createReport(data: {
  reporterId: string;
  targetType: "user" | "product";
  targetId: string;
  reason: string;
}): Promise<Report> {
  // DB 연동 코드 작성 필요
  return {
    id: "",
    reporterId: "",
    targetType: "",
    targetId: "",
    reason: "",
    createdAt: "",
    status: "",
  };
}

export async function updateReportStatus(
  id: string,
  status: "resolved" | "dismissed"
): Promise<Report | null> {
  // 먼저 해당 신고가 존재하는지 확인
  const exists = await prisma.report.findUnique({ where: { id } });
  if (!exists) return null; // 404 상황
  const report = await prisma.report.update({
    where: { id },
    data: { status },
  });
  return report;
}

// 채팅 관련 함수
export async function getChatRooms(userId: string): Promise<ChatRoom[]> {
  // DB 연동 코드 작성 필요
  return [];
}

export async function getChatMessages(roomId: string): Promise<ChatMessage[]> {
  // 실제 DB에서 메시지 조회
  const messages = await prisma.chatMessage.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: true,
    },
  })
  return messages.map(m => ({
    id: m.id,
    senderId: m.senderId,
    senderName: m.sender.username,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    roomId: m.roomId,
  }))
}

export async function createChatMessage(data: {
  senderId: string;
  roomId: string;
  content: string;
}): Promise<ChatMessage> {
  // 실제 DB에 메시지 저장
  const message = await prisma.chatMessage.create({
    data: {
      senderId: data.senderId,
      roomId: data.roomId,
      content: data.content,
    },
    include: { sender: true },
  })
  return {
    id: message.id,
    senderId: message.senderId,
    senderName: message.sender.username,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    roomId: message.roomId,
  }
}

export async function createChatRoom(data: {
  name: string;
  isGlobal: boolean;
  participantIds: string[];
}): Promise<ChatRoom> {
  // DB 연동 코드 작성 필요
  return {
    id: "",
    name: "",
    isGlobal: false,
    participants: [],
  };
}
