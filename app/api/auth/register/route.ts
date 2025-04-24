import { NextResponse } from "next/server"
import { validateEmail, validatePassword, sanitizeInput } from "@/lib/utils"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    // 입력값 검증
    if (!username || !email || !password) {
      return NextResponse.json({ message: "모든 필드를 입력해주세요." }, { status: 400 })
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ message: "유효한 이메일 주소를 입력해주세요." }, { status: 400 })
    }
    if (!validatePassword(password)) {
      return NextResponse.json({ message: "비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다." }, { status: 400 })
    }

    // 이메일 중복 확인
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ message: "이미 가입된 이메일입니다." }, { status: 409 })
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10)

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        username: sanitizeInput(username),
        email,
        password: hashedPassword,
        bio: "",
        isAdmin: false,
        isSuspended: false,
        reportCount: 0,
      },
    })

    // 비밀번호 제외한 사용자 정보 반환
    const { password: _, ...userWithoutPassword } = newUser

    // 토큰 생성 및 쿠키 설정
    cookies().set({
      name: "token",
      value: JSON.stringify({ id: newUser.id, email: newUser.email }),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7일
    })

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Registration error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json({ message: "회원가입 중 오류가 발생했습니다." }, { status: 500 })
  }
}
