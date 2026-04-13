import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Heart, ImageIcon, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { toast as sonnerToast } from "sonner";
import { Link } from "wouter";

interface ProductCardProps {
  id: number;
  title: string;
  slug: string;
  price: string;
  rating: string;
  reviewCount: number;
  previewImage?: string;
  creatorName?: string;
  category?: string;
  featured?: boolean;
}

export default function ProductCard({
  id,
  title,
  slug,
  price,
  rating,
  reviewCount,
  previewImage,
  creatorName,
  category,
  featured,
}: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const addToCartMutation = trpc.marketplace.cart.addItem.useMutation({
    onSuccess: async () => {
      await utils.marketplace.cart.get.invalidate();
      sonnerToast.success("Added to cart");
    },
    onError: (error) => {
      sonnerToast.error(error.message || "Could not add item to cart");
    },
  });

  const addToWishlistMutation = trpc.marketplace.wishlist.add.useMutation({
    onSuccess: () => {
      setIsWishlisted(true);
      sonnerToast.success("Saved to wishlist");
    },
    onError: (error) => {
      setIsWishlisted(true);
      sonnerToast.message(error.message || "Already in your wishlist");
    },
  });

  const removeFromWishlistMutation = trpc.marketplace.wishlist.remove.useMutation({
    onSuccess: () => {
      setIsWishlisted(false);
      sonnerToast.success("Removed from wishlist");
    },
    onError: (error) => {
      sonnerToast.error(error.message || "Could not update wishlist");
    },
  });

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (isWishlisted) {
      removeFromWishlistMutation.mutate({ productId: id });
      return;
    }

    addToWishlistMutation.mutate({ productId: id });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    addToCartMutation.mutate({ productId: id });
  };

  return (
    <Link href={`/product/${slug}`}>
      <a className="group block h-full">
        <div
          className="relative rounded-xl overflow-hidden bg-card border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative overflow-hidden bg-muted aspect-square">
            {previewImage ? (
              <img
                src={previewImage}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
              </div>
            )}

            {featured && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">
                Featured
              </div>
            )}

            {isHovered && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 animate-fade-in">
                <button
                  onClick={handleWishlist}
                  disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
                  className="p-3 bg-white rounded-full hover:bg-primary hover:text-white transition-colors disabled:opacity-70"
                >
                  <Heart
                    className="w-5 h-5"
                    fill={isWishlisted ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                  className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="p-4 flex-1 flex flex-col">
            {category && (
              <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                {category}
              </span>
            )}

            <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {title}
            </h3>

            {creatorName && (
              <p className="text-sm text-muted-foreground mb-3">by {creatorName}</p>
            )}

            <div className="flex items-center gap-1 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(parseFloat(rating))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({reviewCount})</span>
            </div>

            <div className="mt-auto pt-3 border-t border-border">
              <p className="text-lg font-bold text-primary">${price}</p>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
