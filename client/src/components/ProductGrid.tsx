import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import ProductCard from "./ProductCard";
import { trpc } from "@/lib/trpc";

interface ProductGridProps {
  categoryId?: number;
  searchQuery?: string;
}

type SortOption = "newest" | "price-low" | "price-high" | "rating" | "trending";

export default function ProductGrid({ categoryId, searchQuery }: ProductGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    categoryId ? [categoryId] : []
  );

  // Fetch categories
  const { data: categories = [] } = trpc.marketplace.categories.list.useQuery();

  // Fetch products
  const { data: products = [], isLoading } = trpc.marketplace.products.list.useQuery(
    {
      limit: 20,
      offset: 0,
      categoryId: selectedCategories[0],
    },
    { enabled: selectedCategories.length > 0 || !categoryId }
  );

  // Search products if query exists
  const { data: searchResults = [] } = trpc.marketplace.products.search.useQuery(
    { query: searchQuery || "", limit: 20 },
    { enabled: !!searchQuery }
  );

  const displayProducts = searchQuery ? searchResults : products;

  // Sort products
  const sortedProducts = [...displayProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "rating":
        return parseFloat(b.rating) - parseFloat(a.rating);
      case "trending":
        return b.download_count - a.download_count;
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Filter by price
  const filteredProducts = sortedProducts.filter(
    (p) =>
      parseFloat(p.price) >= priceRange[0] && parseFloat(p.price) <= priceRange[1]
  );

  return (
    <div className="container py-12">
      {/* Filters Section */}
      <div className="mb-8 flex flex-col md:flex-row gap-6">
        {/* Category Filter */}
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-3">Categories</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.length === 0}
                onChange={() => setSelectedCategories([])}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm text-foreground">All Categories</span>
            </label>
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([cat.id]);
                    } else {
                      setSelectedCategories([]);
                    }
                  }}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-foreground">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-3">Price Range</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Min: ${priceRange[0]}
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([parseInt(e.target.value), priceRange[1]])
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Max: ${priceRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-3">Sort By</h3>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground appearance-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="trending">Trending</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} products
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-muted rounded-xl h-80 animate-pulse"></div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              slug={product.slug}
              price={product.price}
              rating={product.rating}
              reviewCount={product.review_count}
              previewImage={
                product.preview_images?.[0] || "/placeholder-product.png"
              }
              creatorName={product.creator?.name}
              category={categories.find((c) => c.id === product.category_id)?.name}
              featured={product.featured}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-2">No products found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </div>
      )}
    </div>
  );
}
