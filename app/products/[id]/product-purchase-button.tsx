"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductPurchaseButton({ productId, status }: { productId: string; status: string }) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const router = useRouter();

  async function handlePurchase() {
    if (status !== "available") return;
    setIsPurchasing(true);
    try {
      const res = await fetch(`/api/products/${productId}/purchase`, { method: "POST" });
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        // 응답이 비어있으면 data는 null
      }
      if (res.ok) {
        alert("구매가 완료되었습니다!");
        router.refresh();
      } else {
        alert((data && data.error) || "구매 중 오류 발생");
      }
    } finally {
      setIsPurchasing(false);
    }
  }

  return (
    <Button className="flex-1" onClick={handlePurchase} disabled={status !== "available" || isPurchasing}>
      {isPurchasing ? "구매 처리 중..." : "구매하기"}
    </Button>
  );
}
