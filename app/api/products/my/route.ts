import { NextResponse } from "next/server"
import { cookies } from "next/headers"
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

    // 사용자의 상품 조회 (DB), "removed" 상태 상품은 제외
    const products = await prisma.product.findMany({
      where: {
        sellerId: userId,
        status: { not: "removed" },
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Get my products error:", error)
    return NextResponse.json({ message: "상품 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}
