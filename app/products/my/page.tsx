"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import type { Product } from "@/types/product"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { Edit, Trash } from "lucide-react"

export default function MyProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyProducts = async () => {
      if (!user) return
      setLoading(true)
      try {
        const res = await fetch(`/api/products/my`)
        if (!res.ok) throw new Error("내 상품을 불러올 수 없습니다.")
        const myProducts = await res.json()
        setProducts(myProducts)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMyProducts()
  }, [user])

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("정말로 이 상품을 삭제하시겠습니까?")) return
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("상품 삭제에 실패했습니다.")
      setProducts(products.filter((product) => product.id !== productId))
    } catch (error) {
      console.error("Failed to delete product:", error)
      alert("상품 삭제에 실패했습니다.")
    }
  }

  if (!user) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>로그인이 필요합니다.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">내 상품 목록</h1>
      {loading ? (
        <div>로딩 중...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">등록한 상품이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent>
                <div className="aspect-square relative mb-4">
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="font-bold text-lg mb-2">{product.title}</div>
                <div className="text-muted-foreground mb-2">{product.description}</div>
                <div className="mb-2">{formatPrice(product.price)}</div>
                <div className="mb-2 text-sm">상태: {product.status === "available" ? "판매중" : product.status === "sold" ? "판매완료" : "삭제됨"}</div>
              </CardContent>
              <CardFooter className="gap-2">
                <Link href={`/products/${product.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Edit className="h-4 w-4" />
                    수정
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-red-500 hover:text-red-600"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash className="h-4 w-4" />
                  삭제
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
