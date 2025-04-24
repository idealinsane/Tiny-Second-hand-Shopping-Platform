import { getProductById, getUserById } from "@/lib/data"
import { formatPrice, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ReportButton } from "@/components/report-button"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { MessageSquare, AlertTriangle } from "lucide-react"
import ProductPurchaseButton from "./product-purchase-button";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  const seller = await getUserById(product.sellerId)

  return (
    <div className="container py-10">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative aspect-square">
          <Image
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.title}
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <p className="text-2xl font-bold mt-2">{formatPrice(product.price)}</p>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <span>등록일: {formatDate(product.createdAt)}</span>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">판매자</h3>
                  <p>{seller?.username || product.sellerName}</p>
                </div>
                <Link href={`/chat?sellerId=${product.sellerId}`}>
                  <Button variant="outline" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    채팅하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-semibold mb-2">상품 설명</h2>
            <p className="whitespace-pre-line">{product.description}</p>
          </div>

          <div className="flex gap-4">
            <ProductPurchaseButton productId={product.id} status={product.status} />
            <ReportButton targetId={product.id} targetType="product" />
          </div>

          {product.status !== "available" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <p>{product.status === "sold" ? "판매 완료된 상품입니다." : "삭제된 상품입니다."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
