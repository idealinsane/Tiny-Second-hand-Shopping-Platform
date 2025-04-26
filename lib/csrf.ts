import crypto from "crypto"
import { cookies } from "next/headers"

const CSRF_TOKEN_NAME = "csrfToken"
const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 2, // 2시간
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex")
}

export function setCsrfTokenCookie() {
  const token = generateCsrfToken()
  cookies().set({
    name: CSRF_TOKEN_NAME,
    value: token,
    ...CSRF_COOKIE_OPTIONS,
  })
  return token
}

export function getCsrfTokenFromCookie(): string | null {
  const cookieStore = cookies()
  return cookieStore.get(CSRF_TOKEN_NAME)?.value || null
}

export function validateCsrfToken(request: Request): boolean {
  const csrfTokenFromCookie = getCsrfTokenFromCookie()
  const csrfTokenFromHeader = request.headers.get("x-csrf-token")
  return Boolean(csrfTokenFromCookie && csrfTokenFromHeader && csrfTokenFromCookie === csrfTokenFromHeader)
}
