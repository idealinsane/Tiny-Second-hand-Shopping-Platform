export interface User {
  id: string
  username: string
  email: string
  bio?: string
  createdAt: string
  isAdmin: boolean
  isSuspended: boolean
}
