"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { sanitizeInput } from "@/lib/utils"

interface ReportButtonProps {
  targetId: string
  targetType: "user" | "product"
}

export function ReportButton({ targetId, targetType }: ReportButtonProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleReport = async () => {
    if (!user) {
      alert("로그인이 필요합니다.")
      return
    }

    if (!reason.trim()) {
      setError("신고 사유를 입력해주세요.")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess(false)

      // 입력값 정제
      const sanitizedReason = sanitizeInput(reason)

      // 실제 신고 생성 API 호출
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason: sanitizedReason,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "신고 처리에 실패했습니다.")
      }

      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setReason("")
      }, 2000)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("신고 처리 중 오류가 발생했습니다.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-red-500 hover:text-red-600">
          <AlertTriangle className="h-4 w-4" />
          신고하기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>신고하기</DialogTitle>
          <DialogDescription>
            {targetType === "user" ? "사용자" : "상품"}에 대한 신고 사유를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <div className="py-6 text-center text-green-600">
            <p className="font-medium">신고가 접수되었습니다.</p>
            <p className="text-sm mt-1">관리자가 검토 후 조치하겠습니다.</p>
          </div>
        ) : (
          <>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="신고 사유를 자세히 입력해주세요."
              rows={4}
              maxLength={500}
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button onClick={handleReport} disabled={loading}>
                {loading ? "처리 중..." : "신고하기"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
