import * as bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import type { User } from "@/types/user"
import { sql, getUserByEmail, getUserById } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// 사용자 등록
export async function registerUser(data: { username: string; email: string; password: string }): Promise<User> {
  try {
    const { username, email, password } = data

    // 이메일 중복 확인
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      throw new Error("이미 등록된 이메일 주소입니다.")
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10)

    // 사용자 생성
    const result = await sql`
      INSERT INTO "User" (username, email, password)
      VALUES (${username}, ${email}, ${hashedPassword})
      RETURNING *
    `
    const user = result[0]

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio || undefined,
      createdAt: user.createdAt.toISOString(),
      isAdmin: user.isAdmin,
      isSuspended: user.isSuspended,
    }
  } catch (error) {
    console.error("Register user error:", error)
    throw error
  }
}

// 사용자 로그인
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    // 사용자 조회
    const user = await getUserByEmail(email)

    if (!user) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.")
    }

    // 비밀번호 확인
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.")
    }

    // 계정 상태 확인
    if (user.isSuspended) {
      throw new Error("계정이 휴면 상태입니다. 관리자에게 문의하세요.")
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio || undefined,
      createdAt: user.createdAt.toISOString(),
      isAdmin: user.isAdmin,
      isSuspended: user.isSuspended,
    }
  } catch (error) {
    console.error("Login user error:", error)
    throw error
  }
}

// JWT 토큰 생성
export async function createToken(user: { id: string; email: string }): Promise<string> {
  try {
    const token = await new SignJWT({ id: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(JWT_SECRET))

    return token
  } catch (error) {
    console.error("Create token error:", error)
    throw error
  }
}

// JWT 토큰 검증
export async function verifyToken(token: string): Promise<{ id: string; email: string }> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return { id: payload.id as string, email: payload.email as string }
  } catch (error) {
    console.error("Verify token error:", error)
    throw new Error("인증 토큰이 유효하지 않습니다.")
  }
}

// 현재 로그인한 사용자 정보 가져오기
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return null
    }

    try {
      const { id } = await verifyToken(token)
      const user = await getUserById(id)

      if (!user) {
        return null
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio || undefined,
        createdAt: user.createdAt.toISOString(),
        isAdmin: user.isAdmin,
        isSuspended: user.isSuspended,
      }
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  } catch (error) {
    console.error("Get current user outer error:", error)
    return null
  }
}

// 다른 인증 관련 함수들..."
