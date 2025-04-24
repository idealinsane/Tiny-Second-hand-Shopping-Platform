import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // 토큰 쿠키 삭제
    cookies().delete("token")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ message: "로그아웃 중 오류가 발생했습니다." }, { status: 500 })
  }
}
