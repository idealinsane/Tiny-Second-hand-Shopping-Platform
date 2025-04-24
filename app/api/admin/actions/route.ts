import { NextRequest, NextResponse } from "next/server";
import { updateReportStatus, updateUser, getUserById, getProductById, updateProduct } from "@/lib/data";

export const dynamic = "force-dynamic";

// 신고 상태 변경 (resolve/dismiss)
export async function POST(req: NextRequest) {
  const { type, id, action } = await req.json();

  if (type === "report") {
    if (action !== "resolve" && action !== "dismiss") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    const updated = await updateReportStatus(id, action === "resolve" ? "resolved" : "dismissed");
    if (!updated) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, updated });
  }

  if (type === "user") {
    if (action !== "suspend" && action !== "activate") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    const user = await getUserById(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const updated = await updateUser(id, { isSuspended: action === "suspend" });
    return NextResponse.json({ ok: true, updated });
  }

  if (type === "product") {
    if (action !== "remove" && action !== "restore") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    // 상품 상태 변경 함수가 필요하다면 lib/data.ts에 추가 필요
    const product = await getProductById(id);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const updated = await updateProduct(id, { status: action === "remove" ? "removed" : "available" });
    return NextResponse.json({ ok: true, updated });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
