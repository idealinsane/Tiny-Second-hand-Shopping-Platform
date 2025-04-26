import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sanitizeHtml } from "sanitize-html"
import { prisma } from "@/lib/prisma"
import { validateCsrfToken } from "@/lib/csrf"

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

    // CSRF 토큰 검증
    if (!validateCsrfToken(request)) {
      return NextResponse.json({ message: "잘못된 접근입니다(CSRF)." }, { status: 403 })
    }

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
    const sanitizedReason = sanitizeHtml(reason)

    // 신고 생성 (DB)
    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        targetType,
        targetId,
        reason: sanitizedReason,
        status: "pending",
        productId: targetType === "product" ? targetId : undefined,
      },
    })

    // 상품 신고라면 reports 배열 활용해 신고 개수 집계 및 자동 제재 처리
    if (targetType === "product") {
      // 해당 상품의 신고 내역(reports 배열) 개수 집계
      const productWithReports = await prisma.product.findUnique({
        where: { id: targetId },
        include: { reports: true },
      })
      const reportTotal = productWithReports?.reports.length ?? 0

      if (reportTotal >= 5 && productWithReports?.status !== "removed") {
        // 상품 비활성화
        await prisma.product.update({
          where: { id: targetId },
          data: { status: "removed" },
        })
        // 판매자 자동 휴면 처리
        await prisma.user.update({
          where: { id: productWithReports.sellerId },
          data: { isSuspended: true },
        })
      }
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Create report error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json({ message: "신고 생성 중 오류가 발생했습니다." }, { status: 500 })
  }
}
