"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types/user"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 모의 사용자 데이터 (로컬 개발용)
const MOCK_USERS = [
  {
    id: "1",
    username: "관리자",
    email: "admin@example.com",
    bio: "중고거래 플랫폼 관리자입니다.",
    createdAt: new Date().toISOString(),
    isAdmin: true,
    isSuspended: false,
    reportCount: 0,
    password: "admin",
  },
  {
    id: "2",
    username: "판매자1",
    email: "user1@example.com",
    bio: "안녕하세요! 중고거래 플랫폼에서 다양한 물건을 판매하고 있습니다.",
    createdAt: new Date().toISOString(),
    isAdmin: false,
    isSuspended: false,
    reportCount: 0,
    password: "password",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 페이지 로드시 사용자 인증 상태 확인
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include", // 쿠키를 포함하도록 설정
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // 쿠키를 포함하도록 설정
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "로그인 중 오류가 발생했습니다.")
      }

      const userData = await response.json()
      setUser(userData)
      router.push("/")
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "회원가입 중 오류가 발생했습니다.")
      }

      const userData = await response.json()
      setUser(userData)
      router.push("/")
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // 쿠키를 포함하도록 설정
      })
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error("로그인이 필요합니다.")
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || "프로필 업데이트 중 오류가 발생했습니다.")
      }
      const updatedUser = await response.json()
      setUser(updatedUser)
    } catch (error) {
      console.error("Profile update failed:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
