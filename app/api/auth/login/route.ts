import { NextResponse } from "next/server"
import { validateEmail } from "@/lib/utils"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 입력값 검증
    if (!email || !password) {
      return NextResponse.json({ message: "이메일과 비밀번호를 모두 입력해주세요." }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ message: "유효한 이메일 주소를 입력해주세요." }, { status: 400 })
    }

    // DB에서 사용자 조회
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: "존재하지 않는 이메일입니다." }, { status: 404 })
    }

    // 비밀번호 검증
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ message: "비밀번호가 일치하지 않습니다." }, { status: 401 })
    }

    if (user.isSuspended) {
      return NextResponse.json({ message: "계정이 휴면 상태입니다. 관리자에게 문의하세요." }, { status: 403 })
    }

    // 비밀번호 제외한 사용자 정보 반환
    const { password: _, ...userWithoutPassword } = user

    // 토큰 생성 및 쿠키 설정 (실제 환경에서는 JWT 사용 권장)
    cookies().set({
      name: "token",
      value: JSON.stringify({ id: user.id, email: user.email }),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7일
    })

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Login route error:", error)
    return NextResponse.json({ message: "로그인 중 오류가 발생했습니다." }, { status: 500 })
  }
}
