import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 기존 데이터 삭제
  await prisma.chatMessage.deleteMany()
  await prisma.chatRoom.deleteMany()
  await prisma.report.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // 사용자 생성
  const admin = await prisma.user.create({
    data: {
      username: "관리자",
      email: "admin@example.com",
      password: await bcrypt.hash("Admin123!", 10),
      bio: "중고거래 플랫폼 관리자입니다.",
      isAdmin: true,
    }
  })

  const user1 = await prisma.user.create({
    data: {
      username: "판매자1",
      email: "user1@example.com",
      password: await bcrypt.hash("User123!", 10),
      bio: "안녕하세요! 중고거래 플랫폼에서 다양한 물건을 판매하고 있습니다.",
    }
  })

  const user2 = await prisma.user.create({
    data: {
      username: "판매자2",
      email: "user2@example.com",
      password: await bcrypt.hash("User123!", 10),
      bio: "전자기기 판매 전문입니다.",
    }
  })

  // 상품 생성
  await prisma.product.createMany({
    data: [
      {
        title: "아이폰 13 Pro",
        description: "1년 사용한 아이폰 13 Pro입니다. 상태 좋습니다.",
        price: 800000,
        imageUrl: "/placeholder.svg?height=300&width=300",
        sellerId: user1.id,
      },
      {
        title: "삼성 갤럭시 S22",
        description: "6개월 사용한 갤럭시 S22입니다. 약간의 사용감이 있습니다.",
        price: 650000,
        imageUrl: "/placeholder.svg?height=300&width=300",
        sellerId: user2.id,
      },
      {
        title: "맥북 프로 M1",
        description: "2021년형 맥북 프로 M1 모델입니다. 상태 좋습니다.",
        price: 1200000,
        imageUrl: "/placeholder.svg?height=300&width=300",
        sellerId: user2.id,
      },
      {
        title: "에어팟 프로",
        description: "거의 새 제품 에어팟 프로입니다.",
        price: 180000,
        imageUrl: "/placeholder.svg?height=300&width=300",
        sellerId: user1.id,
      }
    ]
  })

  // 채팅방 생성 (relation 기반)
  const globalRoom = await prisma.chatRoom.create({
    data: {
      name: "전체 채팅방",
      isGlobal: true,
      participants: {
        connect: [admin, user1, user2].map(u => ({ id: u.id }))
      },
    }
  })

  const privateRoom = await prisma.chatRoom.create({
    data: {
      name: "1:1 채팅방",
      isGlobal: false,
      participants: {
        connect: [user1, user2].map(u => ({ id: u.id }))
      },
    }
  })

  // 채팅 메시지 생성
  await prisma.chatMessage.createMany({
    data: [
      {
        senderId: user1.id,
        content: "안녕하세요!",
        roomId: globalRoom.id,
      },
      {
        senderId: user2.id,
        content: "반갑습니다!",
        roomId: globalRoom.id,
      },
      {
        senderId: admin.id,
        content: "모두 환영합니다. 즐거운 거래 되세요!",
        roomId: globalRoom.id,
      },
      {
        senderId: user2.id,
        content: "아이폰 13 Pro 상태가 어떤가요?",
        roomId: privateRoom.id,
      },
      {
        senderId: user1.id,
        content: "상태 좋습니다. 기스 없고 배터리 성능도 90% 이상입니다.",
        roomId: privateRoom.id,
      }
    ]
  })

  // 마지막 메시지 업데이트
  await prisma.chatRoom.update({
    where: { id: globalRoom.id },
    data: {
      lastMessage: "모두 환영합니다. 즐거운 거래 되세요!",
      lastMessageTime: new Date(),
    }
  })

  await prisma.chatRoom.update({
    where: { id: privateRoom.id },
    data: {
      lastMessage: "상태 좋습니다. 기스 없고 배터리 성능도 90% 이상입니다.",
      lastMessageTime: new Date(),
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
