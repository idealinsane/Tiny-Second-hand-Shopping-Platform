import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import type { User } from '@prisma/client'

// 사용자 관련 함수
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id }
  })
}

export async function createUser(data: {
  email: string
  password: string
  username: string
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10)
  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword
    }
  })
}

export async function verifyPassword(user: User, password: string) {
  return bcrypt.compare(password, user.password)
}

// 채팅 관련 함수
export async function getChatMessages(roomId: string) {
  return prisma.chatMessage.findMany({
    where: { roomId },
    include: {
      sender: {
        select: {
          id: true,
          username: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  })
}

export async function createChatMessage(data: {
  content: string
  senderId: string
  roomId: string
}) {
  const message = await prisma.chatMessage.create({
    data,
    include: {
      sender: {
        select: {
          id: true,
          username: true
        }
      }
    }
  })

  // 채팅방의 마지막 메시지 업데이트
  await prisma.chatRoom.update({
    where: { id: data.roomId },
    data: {
      lastMessage: data.content,
      lastMessageTime: new Date()
    }
  })

  return message
}

export async function getChatRooms(userId: string) {
  return prisma.chatRoom.findMany({
    where: {
      participants: {
        contains: userId
      }
    },
    orderBy: {
      lastMessageTime: 'desc'
    }
  })
}

export async function createChatRoom(data: {
  name: string
  isGlobal: boolean
  participantIds: string[]
}) {
  return prisma.chatRoom.create({
    data: {
      name: data.name,
      isGlobal: data.isGlobal,
      participants: JSON.stringify(data.participantIds)
    }
  })
}

// 상품 관련 함수
export async function getProducts() {
  return prisma.product.findMany({
    include: {
      seller: {
        select: {
          id: true,
          username: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          username: true
        }
      }
    }
  })
}

export async function createProduct(data: {
  title: string
  description: string
  price: number
  imageUrl?: string
  sellerId: string
}) {
  return prisma.product.create({
    data,
    include: {
      seller: {
        select: {
          id: true,
          username: true
        }
      }
    }
  })
}

export async function updateProduct(id: string, data: {
  title?: string
  description?: string
  price?: number
  imageUrl?: string
  status?: 'available' | 'sold' | 'removed'
}) {
  return prisma.product.update({
    where: { id },
    data
  })
}

// 신고 관련 함수
export async function createReport(data: {
  reason: string
  reporterId: string
  targetType: 'user' | 'product'
  targetId: string
  productId?: string
}) {
  const report = await prisma.report.create({
    data,
    include: {
      reporter: {
        select: {
          id: true,
          username: true
        }
      }
    }
  })

  return report
}

export async function getReports() {
  return prisma.report.findMany({
    include: {
      reporter: {
        select: {
          id: true,
          username: true
        }
      },
      product: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function updateReportStatus(id: string, status: 'resolved' | 'dismissed') {
  const report = await prisma.report.update({
    where: { id },
    data: { status },
    include: {
      product: true
    }
  })

  return report
}
