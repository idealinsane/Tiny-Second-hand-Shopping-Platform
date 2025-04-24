import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Next.js 13+ dynamic route API: params는 반드시 await request.nextUrl로부터 추출해야 함
export async function POST(req: NextRequest) {
  try {
    // 동적 params 추출
    const url = req.nextUrl;
    const segments = url.pathname.split("/").filter(Boolean);
    const productId = segments[segments.length - 2]; //倒数第二개가 상품 id
    if (!productId) {
      console.error("[구매API] productId가 유효하지 않음", url.pathname);
      return NextResponse.json({ error: "상품 ID가 유효하지 않습니다." }, { status: 400 });
    }

    // 쿠키에서 user id 추출
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    let buyerId: string | undefined;
    if (token) {
      try {
        const parsed = JSON.parse(token);
        buyerId = parsed.id;
      } catch {}
    }
    if (!buyerId) {
      console.error("[구매API] buyerId 없음, token:", token);
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 상품 정보 조회
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      console.error("[구매API] product가 null/undefined입니다. productId:", productId);
      return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
    }
    if (product.status !== "available") {
      return NextResponse.json({ error: "이미 판매된 상품입니다." }, { status: 400 });
    }
    if (product.sellerId === buyerId) {
      return NextResponse.json({ error: "본인 상품은 구매할 수 없습니다." }, { status: 400 });
    }

    // 구매자 정보 조회
    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) {
      console.error("[구매API] buyer가 null/undefined입니다. buyerId:", buyerId);
      return NextResponse.json({ error: "구매자 정보를 찾을 수 없습니다." }, { status: 404 });
    }
    if (buyer.balance < product.price) {
      return NextResponse.json({ error: "잔액이 부족합니다." }, { status: 400 });
    }

    // 판매자 정보 조회
    const seller = await prisma.user.findUnique({ where: { id: product.sellerId } });
    if (!seller) {
      console.error("[구매API] seller가 null/undefined입니다. sellerId:", product.sellerId);
      return NextResponse.json({ error: "판매자 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    // 혹시라도 product, buyer, seller가 undefined일 때 방어
    if (!product || !buyer || !seller) {
      console.error("[구매API] 트랜잭션 진입 전 필수 객체가 undefined임", { product, buyer, seller });
      return NextResponse.json({ error: "내부 오류: 필수 정보 누락" }, { status: 500 });
    }

    // 트랜잭션 처리
    await prisma.$transaction([
      prisma.user.update({
        where: { id: buyerId },
        data: { balance: { decrement: product.price } },
      }),
      prisma.user.update({
        where: { id: seller.id },
        data: { balance: { increment: product.price } },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { status: "sold" },
      }),
      prisma.order.create({
        data: {
          buyerId,
          sellerId: seller.id,
          productId: product.id,
          amount: product.price,
        },
      }),
    ]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("구매 처리 중 오류:", e);
    return NextResponse.json({ error: e?.message || "구매 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
