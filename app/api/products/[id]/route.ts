import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { sanitizeInput } from "@/lib/utils"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) {
      return NextResponse.json({ message: "상품을 찾을 수 없습니다." }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ message: "상품 조회 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }
    const { id: userId } = JSON.parse(token)
    const currentUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!currentUser) {
      return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 })
    }
    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) {
      return NextResponse.json({ message: "상품을 찾을 수 없습니다." }, { status: 404 })
    }
    // 권한 확인 (판매자 또는 관리자만 수정 가능)
    if (product.sellerId !== currentUser.id && !currentUser.isAdmin) {
      return NextResponse.json({ message: "상품을 수정할 권한이 없습니다." }, { status: 403 })
    }
    const body = await request.json()
    const updateData: any = {}
    if (body.title) updateData.title = sanitizeInput(body.title)
    if (body.description) updateData.description = sanitizeInput(body.description)
    if (body.price && !isNaN(Number(body.price))) updateData.price = Number(body.price)
    if (body.imageUrl) updateData.imageUrl = body.imageUrl
    if (body.status && ["available", "sold", "removed"].includes(body.status)) updateData.status = body.status
    const updatedProduct = await prisma.product.update({ where: { id: params.id }, data: updateData })
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Update product error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json({ message: "상품 수정 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value
    if (!token) {
      return NextResponse.json({ message: "인증되지 않은 사용자입니다." }, { status: 401 })
    }
    const { id: userId } = JSON.parse(token)
    const currentUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!currentUser) {
      return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 })
    }
    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) {
      return NextResponse.json({ message: "상품을 찾을 수 없습니다." }, { status: 404 })
    }
    // 권한 확인 (판매자 또는 관리자만 삭제 가능)
    if (product.sellerId !== currentUser.id && !currentUser.isAdmin) {
      return NextResponse.json({ message: "상품을 삭제할 권한이 없습니다." }, { status: 403 })
    }
    // 상품 삭제: 실제로는 상태만 변경
    const deletedProduct = await prisma.product.update({ where: { id: params.id }, data: { status: "removed" } })
    return NextResponse.json({ success: true, deletedProduct })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ message: "상품 삭제 중 오류가 발생했습니다." }, { status: 500 })
  }
}
