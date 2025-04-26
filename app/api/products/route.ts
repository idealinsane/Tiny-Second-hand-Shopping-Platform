import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { sanitizeInput, sanitizeHtml } from "@/lib/utils"
import { validateCsrfToken } from "@/lib/csrf"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    // 상품 전체 조회 (DB), status가 "removed"인 상품 제외
    let products = await prisma.product.findMany({
      where: {
        status: { not: "removed" },
      },
    })

    // 검색 기능 구현
    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(
        (product) =>
          product.title.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower),
      )
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ message: "상품 조회 중 오류가 발생했습니다." }, { status: 500 })
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
    const { title, description, price, imageBase64 } = body

    // 입력값 검증
    if (!title || !description || !price) {
      return NextResponse.json({ message: "모든 필드를 입력해주세요." }, { status: 400 })
    }

    const priceValue = Number(price)
    if (isNaN(priceValue) || priceValue < 0) {
      return NextResponse.json({ message: "유효한 가격을 입력해주세요." }, { status: 400 })
    }

    // 상품 등록 시 XSS 방어 적용
    const safeTitle = sanitizeHtml(title)
    const safeDescription = sanitizeHtml(description)

    // 상품 생성 (DB)
    const product = await prisma.product.create({
      data: {
        title: safeTitle,
        description: safeDescription,
        price: priceValue,
        imageUrl: imageBase64 || null,
        sellerId: userId,
        status: "available",
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Create product error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json({ message: "상품 등록 중 오류가 발생했습니다." }, { status: 500 })
  }
}
