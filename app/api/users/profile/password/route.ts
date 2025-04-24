import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PATCH(request: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }
    const { id: userId } = JSON.parse(token)
    const currentUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!currentUser) {
      return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 })
    }
    const body = await request.json()
    const { currentPassword, newPassword } = body
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "모든 필드를 입력해주세요." }, { status: 400 })
    }
    // 현재 비밀번호 검증
    const passwordMatch = await bcrypt.compare(currentPassword, currentUser.password)
    if (!passwordMatch) {
      return NextResponse.json({ message: "현재 비밀번호가 올바르지 않습니다." }, { status: 400 })
    }
    // 새 비밀번호 해싱 및 업데이트
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })
    return NextResponse.json({ message: "비밀번호가 성공적으로 변경되었습니다." })
  } catch (error) {
    console.error("Password update error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json({ message: "비밀번호 변경 중 오류가 발생했습니다." }, { status: 500 })
  }
}
