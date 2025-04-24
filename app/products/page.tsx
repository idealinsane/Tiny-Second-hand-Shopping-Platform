import { getProducts } from "@/lib/data"
import { ProductCard } from "@/components/product-card"
import { SearchBar } from "@/components/search-bar"

export default async function ProductsPage({ searchParams }: { searchParams: { search?: string } }) {
  const products = await getProducts()
  const filteredProducts = searchParams?.search
    ? products.filter(
        (product) =>
          product.title.toLowerCase().includes(searchParams.search!.toLowerCase()) ||
          product.description.toLowerCase().includes(searchParams.search!.toLowerCase()),
      )
    : products

  return (
    <div className="container py-10 flex justify-center">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">상품 목록</h1>
        <div className="mb-8">
          <SearchBar />
        </div>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
