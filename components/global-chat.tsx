"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils"
import { Send } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ChatMessage } from "@/types/chat"

export function GlobalChat({ userId, username }: { userId: string; username: string }) {
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 메시지 가져오기
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/chat/rooms/global/messages")
        if (!response.ok) {
          throw new Error("메시지를 불러오는데 실패했습니다.")
        }

        const chatMessages = await response.json()
        setMessages(chatMessages)
        setError(null)
      } catch (error) {
        console.error("Failed to fetch messages:", error)
        setError("메시지를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // 실시간 업데이트를 위한 폴링 설정 (5초마다)
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch("/api/chat/rooms/global/messages")
        if (!response.ok) {
          throw new Error("메시지를 불러오는데 실패했습니다.")
        }

        const chatMessages = await response.json()
        setMessages(chatMessages)
      } catch (error) {
        console.error("Failed to poll messages:", error)
      }
    }, 5000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // 새 메시지가 추가될 때 스크롤 아래로 이동
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    try {
      // 메시지 전송
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: "global",
          content: newMessage.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("메시지 전송에 실패했습니다.")
      }

      // 메시지 목록 업데이트
      const updatedResponse = await fetch("/api/chat/rooms/global/messages")
      if (!updatedResponse.ok) {
        throw new Error("메시지를 불러오는데 실패했습니다.")
      }

      const updatedMessages = await updatedResponse.json()
      setMessages(updatedMessages)
      setNewMessage("")
      setError(null)
    } catch (error) {
      console.error("Failed to send message:", error)
      setError("메시지를 전송하는 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="flex flex-col h-[500px]">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-md">
        {loading ? (
          <p className="text-center">로딩 중...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground">아직 메시지가 없습니다.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.senderId === userId ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === userId ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {message.senderId !== userId && <p className="font-medium text-sm mb-1">{message.senderName}</p>}
                <p className="break-words">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">{formatDate(message.createdAt)}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          maxLength={500}
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
