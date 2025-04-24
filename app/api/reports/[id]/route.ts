import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // 현재 사용자 확인
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    // 토큰에서 사용자 ID 추출
    const { id: userId } = JSON.parse(token)

    // 사용자 정보 조회
    const currentUser = await prisma.user.findUnique({ where: { id: userId } })

    if (!currentUser) {
      return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 })
    }

    // 신고 정보 조회
    const report = await prisma.report.findUnique({ where: { id: params.id } })

    if (!report) {
      return NextResponse.json({ message: "신고를 찾을 수 없습니다." }, { status: 404 })
    }

    // 관리자만 신고 상태 변경 가능
    if (!currentUser.isAdmin) {
      return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    // 입력값 검증
    if (!status || !["pending", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ message: "유효한 상태를 입력해주세요." }, { status: 400 })
    }

    // 신고 상태 업데이트
    const updatedReport = await prisma.report.update({ where: { id: params.id }, data: { status } })

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error("Update report error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json({ message: "신고 상태 업데이트 중 오류가 발생했습니다." }, { status: 500 })
  }
}
