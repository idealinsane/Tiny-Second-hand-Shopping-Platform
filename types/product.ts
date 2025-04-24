export interface Product {
  id: string
  title: string
  description: string
  price: number
  imageUrl: string
  sellerId: string
  sellerName: string
  createdAt: string
  status: "available" | "sold" | "removed"
  reportCount: number
}
