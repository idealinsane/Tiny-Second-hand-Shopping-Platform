import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sanitizeInput } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // 현재 사용자 확인
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    // 토큰에서 사용자 ID 추출
    const { id: userId } = JSON.parse(token)

    // 사용자의 채팅방 조회 (DB)
    const chatRooms = await prisma.chatRoom.findMany({
      where: { participants: { some: { id: userId } } },
      orderBy: { createdAt: "desc" },
      include: { participants: true }, // 참가자 정보도 포함
    })

    return NextResponse.json(chatRooms)
  } catch (error) {
    console.error("Get chat rooms error:", error)
    return NextResponse.json({ message: "채팅방 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // 현재 사용자 확인
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    // 토큰에서 사용자 ID 추출
    const { id: userId } = JSON.parse(token)

    const body = await request.json()
    const { name, isGlobal, participantIds } = body

    // 입력값 검증
    if (!name || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json({ message: "모든 필드를 입력해주세요." }, { status: 400 })
    }

    // 참가자에 현재 사용자 포함
    if (!participantIds.includes(userId)) {
      participantIds.push(userId)
    }

    // 입력값 정제
    const sanitizedName = sanitizeInput(name)

    // 이미 동일한 참가자 조합의 1:1 채팅방이 존재하는지 확인 (isGlobal=false)
    const exists = await prisma.chatRoom.findFirst({
      where: {
        isGlobal: !!isGlobal,
        participants: {
          every: { id: { in: participantIds } },
        },
        AND: [
          { participants: { every: { id: { in: participantIds } } } },
          { participants: { some: { id: userId } } },
        ],
      },
      include: { participants: true },
    })
    if (exists) {
      return NextResponse.json(exists)
    }

    // 채팅방 생성 (DB)
    const chatRoom = await prisma.chatRoom.create({
      data: {
        name: sanitizedName,
        isGlobal: !!isGlobal,
        participants: { connect: participantIds.map((id: string) => ({ id })) },
      },
      include: { participants: true },
    })

    return NextResponse.json(chatRoom)
  } catch (error) {
    console.error("Create chat room error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json({ message: "채팅방 생성 중 오류가 발생했습니다." }, { status: 500 })
  }
}
