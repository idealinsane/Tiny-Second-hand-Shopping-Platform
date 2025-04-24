"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Ban, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminActionsProps {
  tab: "reports" | "users" | "products";
  reports: any[];
  users: any[];
  products: any[];
}

async function postAdminAction(type: string, id: string, action: string) {
  const res = await fetch("/api/admin/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, id, action })
  });
  if (!res.ok) throw new Error("관리자 액션 실패");
  return await res.json();
}

export default function AdminActions({ tab, reports, users, products }: AdminActionsProps) {
  const [localReports, setLocalReports] = useState(reports);
  const [localUsers, setLocalUsers] = useState(users);
  const [localProducts, setLocalProducts] = useState(products);
  const [loading, setLoading] = useState<string | null>(null);

  // 신고 처리
  const handleReportAction = async (reportId: string, action: "resolve" | "dismiss") => {
    setLoading(`report-${reportId}`);
    try {
      await postAdminAction("report", reportId, action);
      setLocalReports(localReports.map(r => r.id === reportId ? { ...r, status: action === "resolve" ? "resolved" : "dismissed" } : r));
    } catch (e) {
      alert("신고 처리에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  };

  // 사용자 상태 변경
  const handleUserAction = async (userId: string, action: "suspend" | "activate") => {
    setLoading(`user-${userId}`);
    try {
      await postAdminAction("user", userId, action);
      setLocalUsers(localUsers.map(u => u.id === userId ? { ...u, isSuspended: action === "suspend" } : u));
    } catch (e) {
      alert("사용자 상태 변경에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  };

  // 상품 상태 변경
  const handleProductAction = async (productId: string, action: "remove" | "restore") => {
    setLoading(`product-${productId}`);
    try {
      await postAdminAction("product", productId, action);
      setLocalProducts(localProducts.map(p => p.id === productId ? { ...p, status: action === "remove" ? "removed" : "available" } : p));
    } catch (e) {
      alert("상품 상태 변경에 실패했습니다.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* 신고 관리 */}
      {tab === "reports" && (
        <section>
          <h2 className="text-xl font-semibold mb-2">신고 관리</h2>
          {localReports.length === 0 ? (
            <p className="text-muted-foreground">신고 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {localReports.map(report => {
                const targetUser = localUsers.find(u => u.id === report.targetId);
                const targetProduct = localProducts.find(p => p.id === report.targetId);
                const reporterUser = localUsers.find(u => u.id === report.reporterId);
                return (
                  <div key={report.id} className="border rounded p-4 flex justify-between items-start bg-white">
                    <div>
                      <div className="font-medium">
                        {report.targetType === "user"
                          ? `사용자 신고: ${targetUser?.username || "알 수 없음"}`
                          : `상품 신고: ${targetProduct?.title || "알 수 없음"}`}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        신고자: {reporterUser?.username || "알 수 없음"} | 신고일: {formatDate(report.createdAt)}
                      </div>
                      <div className="mt-1">사유: {report.reason}</div>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${report.status === "pending" ? "bg-yellow-100 text-yellow-800" : report.status === "resolved" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {report.status === "pending" ? "대기 중" : report.status === "resolved" ? "처리됨" : "무시됨"}
                      </span>
                    </div>
                    {report.status === "pending" && (
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm" className="gap-1 text-green-600" onClick={() => handleReportAction(report.id, "resolve")} disabled={loading === `report-${report.id}`}> <CheckCircle className="h-4 w-4" /> 처리 </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-red-500" onClick={() => handleReportAction(report.id, "dismiss")} disabled={loading === `report-${report.id}`}> <XCircle className="h-4 w-4" /> 무시 </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 사용자 관리 */}
      {tab === "users" && (
        <section>
          <h2 className="text-xl font-semibold mb-2">사용자 관리</h2>
          {localUsers.length === 0 ? (
            <p className="text-muted-foreground">사용자가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {localUsers.map(u => (
                <div key={u.id} className="border rounded p-4 flex justify-between items-center bg-white">
                  <div>
                    <div className="font-medium">{u.username}</div>
                    <div className="text-sm text-muted-foreground">{u.email}</div>
                    <div className="mt-1 flex gap-2">
                      {u.isAdmin && <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">관리자</span>}
                      {u.isSuspended && <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">휴면 계정</span>}
                      {u.reportCount > 0 && <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">신고 {u.reportCount}회</span>}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className={`gap-1 ${u.isSuspended ? "text-green-600" : "text-red-500"}`} onClick={() => handleUserAction(u.id, u.isSuspended ? "activate" : "suspend")} disabled={loading === `user-${u.id}`}> <Ban className="h-4 w-4" /> {u.isSuspended ? "계정 활성화" : "계정 휴면"} </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 상품 관리 */}
      {tab === "products" && (
        <section>
          <h2 className="text-xl font-semibold mb-2">상품 관리</h2>
          {localProducts.length === 0 ? (
            <p className="text-muted-foreground">등록된 상품이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {localProducts.map(product => (
                <div key={product.id} className="border rounded p-4 flex justify-between items-center bg-white">
                  <div>
                    <div className="font-medium">{product.title}</div>
                    <div className="text-sm text-muted-foreground">판매자: {product.sellerName} | 가격: {new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(product.price)}</div>
                    <div className="mt-1 flex gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.status === "available" ? "bg-green-100 text-green-800" : product.status === "sold" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>{product.status === "available" ? "판매중" : product.status === "sold" ? "판매완료" : "삭제됨"}</span>
                      {product.reportCount > 0 && <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">신고 {product.reportCount}회</span>}
                    </div>
                  </div>
                  {product.status !== "sold" && (
                    <Button variant="outline" size="sm" className={`gap-1 ${product.status === "removed" ? "text-green-600" : "text-red-500"}`} onClick={() => handleProductAction(product.id, product.status === "removed" ? "restore" : "remove")} disabled={loading === `product-${product.id}`}> {product.status === "removed" ? (<><CheckCircle className="h-4 w-4" />복원</>) : (<><XCircle className="h-4 w-4" />삭제</>)} </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
