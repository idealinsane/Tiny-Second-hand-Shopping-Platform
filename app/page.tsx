import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { SearchBar } from "@/components/search-bar"
import Link from "next/link"
import { getProducts } from "@/lib/data"

export default async function Home() {
  const products = await getProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white">
          <h1 className="mb-4 text-4xl font-bold">중고거래 플랫폼에 오신 것을 환영합니다</h1>
          <p className="mb-6 text-lg">안전하고 편리한 중고거래를 시작해보세요.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/products/new">
              <Button variant="secondary" size="lg">
                상품 등록하기
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="outline" size="lg" className="bg-white/20 text-white hover:bg-white/30">
                채팅하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">최근 등록된 상품</h2>
          <Link href="/products">
            <Button variant="ghost">모든 상품 보기</Button>
          </Link>
        </div>
        <SearchBar />
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-gray-100 p-6">
        <h2 className="mb-4 text-2xl font-bold">안전한 거래를 위한 팁</h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>직거래 시 공공장소에서 만나세요.</li>
          <li>송금 전 상품 상태를 꼭 확인하세요.</li>
          <li>의심스러운 판매자는 신고해주세요.</li>
          <li>개인정보를 요구하는 경우 주의하세요.</li>
        </ul>
      </section>
    </div>
  )
}
