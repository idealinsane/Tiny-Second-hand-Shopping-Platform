"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validatePassword } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [bio, setBio] = useState(user?.bio || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // 거래내역 탭 상태
  // useState 등 훅은 조건문(if) 밖, 컴포넌트 최상단에서만 호출해야 함!
  const [tab, setTab] = useState<'buyer' | 'seller'>('buyer')

  if (!user) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>로그인이 필요합니다.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      setLoading(true)
      await updateProfile({ bio })
      setSuccess("프로필이 성공적으로 업데이트되었습니다.")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("프로필 업데이트 중 오류가 발생했습니다.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("모든 필드를 입력해주세요.")
      return
    }

    if (!validatePassword(newPassword)) {
      setError("새 비밀번호는 최소 8자 이상이며, 문자, 숫자, 특수문자를 포함해야 합니다.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.")
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/users/profile/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: "include",
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || "비밀번호 변경 중 오류가 발생했습니다.")
      }
      setSuccess("비밀번호가 성공적으로 변경되었습니다.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("비밀번호 변경 중 오류가 발생했습니다.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">내 프로필</h1>

      {/* 잔액 표시 */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>내 잔액</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-semibold text-green-700">{user.balance?.toLocaleString() ?? 0}원</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>계정 정보</CardTitle>
            <CardDescription>기본 계정 정보를 확인합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>사용자 이름</Label>
                <div className="mt-1 font-medium">{user.username}</div>
              </div>
              <div>
                <Label>이메일</Label>
                <div className="mt-1 font-medium">{user.email}</div>
              </div>
              <div>
                <Label>가입일</Label>
                <div className="mt-1 font-medium">{user.createdAt?.slice(0, 10)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 거래내역 */}
        <Card>
          <CardHeader>
            <CardTitle>거래내역</CardTitle>
            <CardDescription>구매/판매 내역을 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button
                variant={tab === 'buyer' ? 'default' : 'outline'}
                className="mr-2"
                onClick={() => setTab('buyer')}
              >
                구매내역
              </Button>
              <Button
                variant={tab === 'seller' ? 'default' : 'outline'}
                onClick={() => setTab('seller')}
              >
                판매내역
              </Button>
            </div>
            <div>
              {tab === 'buyer' ? (
                <>
                  {user.buyerOrders?.length ? (
                    <ul className="divide-y">
                      {user.buyerOrders.map((order) => (
                        <li key={order.id} className="py-2">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                              <span className="font-semibold">{order.product?.title}</span>
                              <span className="ml-2 text-gray-500 text-sm">({order.product?.price?.toLocaleString()}원)</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              판매자: {order.seller?.username}
                              <span className="ml-2">{order.createdAt?.slice(0, 16).replace('T', ' ')}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-400">구매 내역이 없습니다.</div>
                  )}
                </>
              ) : (
                <>
                  {user.sellerOrders?.length ? (
                    <ul className="divide-y">
                      {user.sellerOrders.map((order) => (
                        <li key={order.id} className="py-2">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                              <span className="font-semibold">{order.product?.title}</span>
                              <span className="ml-2 text-gray-500 text-sm">({order.product?.price?.toLocaleString()}원)</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              구매자: {order.buyer?.username}
                              <span className="ml-2">{order.createdAt?.slice(0, 16).replace('T', ' ')}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-400">판매 내역이 없습니다.</div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 기존 프로필/비번 변경 탭 등은 그대로 하단에 유지 */}
      <div className="mt-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">프로필 정보</TabsTrigger>
            <TabsTrigger value="password">비밀번호 변경</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>프로필 정보 수정</CardTitle>
                <CardDescription>프로필 정보를 업데이트합니다.</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="bio">소개글</Label>
                    <Textarea
                      id="bio"
                      placeholder="자신을 소개해주세요"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? "업데이트 중..." : "프로필 업데이트"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>비밀번호 변경</CardTitle>
                <CardDescription>계정 비밀번호를 변경합니다.</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordUpdate}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">현재 비밀번호</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">새 비밀번호</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      비밀번호는 최소 8자 이상이며, 문자, 숫자, 특수문자를 포함해야 합니다.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? "변경 중..." : "비밀번호 변경"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
