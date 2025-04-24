import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sanitizeInput } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get("roomId")

    if (!roomId) {
      return NextResponse.json({ message: "채팅방 ID를 입력해주세요." }, { status: 400 })
    }

    // 채팅 메시지 조회 (DB)
    const messages = await prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Get chat messages error:", error)
    return NextResponse.json({ message: "채팅 메시지 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    const { id: userId } = JSON.parse(token)
    const body = await request.json()
    const { roomId, content } = body

    if (!roomId || !content) {
      return NextResponse.json({ message: "채팅방 ID와 메시지 내용을 입력해주세요." }, { status: 400 })
    }

    const sanitizedContent = sanitizeInput(content)

    // 채팅 메시지 생성 (DB)
    const message = await prisma.chatMessage.create({
      data: {
        senderId: userId,
        roomId,
        content: sanitizedContent,
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Create chat message error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json({ message: "채팅 메시지 생성 중 오류가 발생했습니다." }, { status: 500 })
  }
}
