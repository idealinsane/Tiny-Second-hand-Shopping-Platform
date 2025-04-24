"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import type { ChatRoom } from "@/types/chat"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GlobalChat } from "@/components/global-chat"
import { PrivateChat } from "@/components/private-chat"
import { useRouter, useSearchParams } from "next/navigation"

export default function ChatPage() {
  const { user } = useAuth()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const sellerId = searchParams.get("sellerId")

  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!user) return
      try {
        setLoading(true)
        const response = await fetch("/api/chat/rooms")
        if (!response.ok) {
          throw new Error("채팅방 정보를 불러오는데 실패했습니다.")
        }
        const rooms = await response.json()
        setChatRooms(rooms)
        // sellerId 쿼리 파라미터가 있으면 해당 판매자와의 1:1 채팅방 활성화 또는 생성
        if (sellerId && sellerId !== user.id) {
          let privateRoom = rooms.find((room: ChatRoom) =>
            !room.isGlobal && room.participants && room.participants.some((p: any) => p.id === sellerId)
          )
          if (!privateRoom) {
            // 채팅방 생성
            const createRes = await fetch("/api/chat/rooms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: `${user.username} - ${sellerId}`,
                isGlobal: false,
                participantIds: [user.id, sellerId],
              }),
            })
            if (createRes.ok) {
              privateRoom = await createRes.json()
              setChatRooms((prev) => [...prev, privateRoom])
            }
          }
          if (privateRoom) {
            setActiveRoom(privateRoom.id)
            // 쿼리스트링 제거
            router.replace("/chat")
          }
        } else {
          // 기존처럼 글로벌 채팅 활성화
          const globalRoom = rooms.find((room: ChatRoom) => room.isGlobal)
          if (globalRoom) {
            setActiveRoom(globalRoom.id)
          } else if (rooms.length > 0) {
            setActiveRoom(rooms[0].id)
          }
        }
        setError(null)
      } catch (error) {
        console.error("Failed to fetch chat rooms:", error)
        setError("채팅방 정보를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }
    fetchChatRooms()
    const intervalId = setInterval(() => {
      if (user) fetchChatRooms()
    }, 10000)
    return () => clearInterval(intervalId)
  }, [user, sellerId])

  if (!user) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>로그인이 필요합니다.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-10 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">채팅</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-6">
            <TabsTrigger value="global">전체 채팅</TabsTrigger>
            <TabsTrigger value="private">개인 채팅</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <Card>
              <CardHeader>
                <CardTitle>전체 채팅</CardTitle>
                <CardDescription>모든 사용자와 대화할 수 있는 공개 채팅방입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <GlobalChat userId={user.id} username={user.username} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="private">
            <Card>
              <CardHeader>
                <CardTitle>개인 채팅</CardTitle>
                <CardDescription>다른 사용자와의 1:1 대화입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>로딩 중...</p>
                ) : chatRooms.filter((room) => !room.isGlobal).length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">아직 개인 채팅이 없습니다.</p>
                    <p className="text-sm mt-1">상품 페이지에서 판매자와 채팅을 시작해보세요.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {chatRooms
                      .filter((room) => !room.isGlobal)
                      .map((room) => (
                        <Button
                          key={room.id}
                          variant={activeRoom === room.id ? "default" : "outline"}
                          className="justify-start h-auto py-3 px-4"
                          onClick={() => setActiveRoom(room.id)}
                        >
                          <div className="text-left">
                            <p className="font-medium">{room.name}</p>
                            {room.lastMessage && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{room.lastMessage}</p>
                            )}
                          </div>
                        </Button>
                      ))}
                  </div>
                )}

                {activeRoom && !loading && chatRooms.filter((room) => !room.isGlobal).length > 0 && (
                  <div className="mt-6">
                    <PrivateChat roomId={activeRoom} userId={user.id} username={user.username} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
