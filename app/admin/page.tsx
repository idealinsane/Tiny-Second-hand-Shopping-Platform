import { getReports, getUsers, getProducts } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate } from "@/lib/utils";
import { Ban, CheckCircle, XCircle } from "lucide-react";
import AdminActions from "./_client-actions";

export default async function AdminPage() {
  // 서버 컴포넌트에서 직접 DB 연동
  const reports = await getReports();
  const users = await getUsers();
  const products = await getProducts();

  // 인증/권한 체크는 별도 미들웨어 또는 서버 컴포넌트에서 처리 권장

  return (
    <div className="container py-10 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">관리자 페이지</h1>
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto mb-6">
            <TabsTrigger value="reports">신고 관리</TabsTrigger>
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="products">상품 관리</TabsTrigger>
          </TabsList>
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>신고 관리</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminActions tab="reports" reports={reports} users={users} products={products} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>사용자 관리</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminActions tab="users" reports={reports} users={users} products={products} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>상품 관리</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminActions tab="products" reports={reports} users={users} products={products} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
