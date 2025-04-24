import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sanitizeInput } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request) {
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

    const body = await request.json()

    // 입력값 정제
    const updateData: any = {}
    if (body.bio) updateData.bio = sanitizeInput(body.bio)

    // 사용자 정보 업데이트 (DB)
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Profile update error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json({ message: "프로필 업데이트 중 오류가 발생했습니다." }, { status: 500 })
  }
}
