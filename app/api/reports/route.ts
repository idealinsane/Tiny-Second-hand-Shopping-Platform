import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sanitizeInput } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // 현재 사용자 확인
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    // 토큰에서 사용자 ID 추출
    const { id: userId } = JSON.parse(token)

    // 사용자 정보 조회 (DB)
    const currentUser = await prisma.user.findUnique({ where: { id: userId } })

    if (!currentUser) {
      return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 })
    }

    // 관리자만 모든 신고 조회 가능
    if (!currentUser.isAdmin) {
      return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 })
    }

    // 신고 전체 조회 (DB)
    const reports = await prisma.report.findMany({ orderBy: { createdAt: "desc" } })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Get reports error:", error)
    return NextResponse.json({ message: "신고 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // 현재 사용자 확인
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    // 토큰에서 사용자 ID 추출
    const { id: userId } = JSON.parse(token)

    const body = await request.json()
    const { targetType, targetId, reason } = body

    // 입력값 검증
    if (!targetType || !targetId || !reason) {
      return NextResponse.json({ message: "모든 필드를 입력해주세요." }, { status: 400 })
    }

    if (targetType !== "user" && targetType !== "product") {
      return NextResponse.json({ message: "유효하지 않은 대상 유형입니다." }, { status: 400 })
    }

    // 입력값 정제
    const sanitizedReason = sanitizeInput(reason)

    // 신고 생성 (DB)
    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        targetType,
        targetId,
        reason: sanitizedReason,
        status: "pending",
      },
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error("Create report error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json({ message: "신고 생성 중 오류가 발생했습니다." }, { status: 500 })
  }
}
