"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Product } from "@/types/product"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: "", description: "", price: "", imageUrl: "" })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      const res = await fetch(`/api/products/${productId}`)
      if (!res.ok) {
        setError("상품 정보를 불러올 수 없습니다.")
        setLoading(false)
        return
      }
      const data = await res.json()
      setProduct(data)
      setForm({
        title: data.title,
        description: data.description,
        price: data.price.toString(),
        imageUrl: data.imageUrl || "",
      })
      setLoading(false)
    }
    fetchProduct()
  }, [productId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    const res = await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        imageUrl: form.imageUrl,
      }),
    })
    setSubmitting(false)
    if (!res.ok) {
      setError("상품 수정에 실패했습니다.")
      return
    }
    router.push(`/products/${productId}`)
  }

  if (loading) return <div className="container py-10">로딩 중...</div>
  if (error) return <div className="container py-10 text-red-500">{error}</div>

  return (
    <div className="container py-10 flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader>
          <h1 className="text-2xl font-bold mb-2">상품 수정</h1>
          <p className="text-muted-foreground text-sm mb-2">필수 정보를 입력 후 수정 완료 버튼을 눌러주세요.</p>
        </CardHeader>
        <CardContent>
          {product && (
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 mb-2">
                <Image
                  src={form.imageUrl || "/placeholder.svg"}
                  alt={form.title || "상품 이미지"}
                  fill
                  className="object-cover rounded-lg border"
                />
              </div>
              <Label htmlFor="imageUrl" className="block mb-1 font-medium w-full text-left">이미지 URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="이미지 URL"
                className="w-full mb-2"
                autoComplete="off"
              />
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="title" className="block mb-1 font-medium">제목</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="제목"
                required
                className="w-full"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="description" className="block mb-1 font-medium">설명</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="설명"
                required
                className="w-full min-h-[80px]"
              />
            </div>
            <div>
              <Label htmlFor="price" className="block mb-1 font-medium">가격 (원)</Label>
              <Input
                id="price"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="가격"
                required
                type="number"
                min="0"
                className="w-full"
                autoComplete="off"
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <CardFooter className="justify-end p-0 pt-2">
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "수정 중..." : "수정 완료"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
