import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getChatMessages } from "@/lib/data";

export async function GET(request: Request, context: any) {
  try {
    // 현재 사용자 확인
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    // context가 Promise이든 객체이든 모두 대응
    const ctx = typeof context.then === "function" ? await context : context;
    const { params } = ctx;
    const roomId = params?.id;

    // 채팅 메시지 조회
    const messages = await getChatMessages(roomId);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get chat messages error:", error);
    return NextResponse.json(
      { message: "채팅 메시지 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
