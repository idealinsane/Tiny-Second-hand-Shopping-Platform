import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    try {
      // 토큰에서 사용자 ID 추출 (실제 환경에서는 JWT 검증)
      const { id } = JSON.parse(token)

      // 사용자 정보 조회 (DB)
      const user = await prisma.user.findUnique({ 
        where: { id },
        include: {
          buyerOrders: {
            include: { product: true, seller: { select: { username: true } } },
            orderBy: { createdAt: 'desc' }
          },
          sellerOrders: {
            include: { product: true, buyer: { select: { username: true } } },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      if (!user) {
        return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 })
      }

      // 비밀번호 제외한 사용자 정보 반환
      const { password: _, ...userWithoutPassword } = user

      return NextResponse.json(userWithoutPassword)
    } catch (error) {
      console.error("Get current user error:", error)
      return NextResponse.json({ message: "인증 확인 중 오류가 발생했습니다." }, { status: 401 })
    }
  } catch (error) {
    console.error("Authentication check error:", error)
    return NextResponse.json({ message: "인증 확인 중 오류가 발생했습니다." }, { status: 500 })
  }
}
