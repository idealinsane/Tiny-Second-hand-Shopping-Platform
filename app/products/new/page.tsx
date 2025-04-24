"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sanitizeInput } from "@/lib/utils"

export default function NewProductPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (!user) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>로그인이 필요합니다.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!title || !description || !price) {
      setError("모든 필드를 입력해주세요.")
      return
    }
    const priceValue = Number.parseInt(price)
    if (isNaN(priceValue) || priceValue <= 0) {
      setError("유효한 가격을 입력해주세요.")
      return
    }
    try {
      setLoading(true)
      const sanitizedTitle = sanitizeInput(title)
      const sanitizedDescription = sanitizeInput(description)
      // 이미지 업로드 로직이 필요하다면 여기에 추가
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sanitizedTitle,
          description: sanitizedDescription,
          price: priceValue,
          imageUrl: undefined, // image 업로드 구현 시 실제 URL로 대체
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "상품 등록 실패")
      }
      router.push("/products")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("상품 등록 중 오류가 발생했습니다.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">상품 등록</h1>
      <Card>
        <CardHeader>
          <CardTitle>새 상품 등록</CardTitle>
          <CardDescription>판매할 상품 정보를 입력하세요.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">상품명</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">상품 설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={2000}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">가격 (원)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={0}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">상품 이미지</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setImage(e.target.files[0])
                  }
                }}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "등록 중..." : "상품 등록"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
