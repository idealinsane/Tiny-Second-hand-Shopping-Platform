export interface Report {
  id: string
  reporterId: string
  targetType: "user" | "product"
  targetId: string
  reason: string
  createdAt: string
  status: "pending" | "resolved" | "dismissed"
}
