import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  CircleCheck,
  Download,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  UserCircle2,
} from "lucide-react";
import { useState } from "react";
import { toast as sonnerToast } from "sonner";
import { useRoute } from "wouter";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const slug = params?.slug as string;
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data: product, isLoading } = trpc.marketplace.products.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

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

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (product) {
      addToCartMutation.mutate({ productId: product.id });
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (product) {
      window.location.href = `/checkout?product=${product.id}`;
    }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (!product) return;

    if (isWishlisted) {
      removeFromWishlistMutation.mutate({ productId: product.id });
      return;
    }

    addToWishlistMutation.mutate({ productId: product.id });
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;

    try {
      await navigator.clipboard.writeText(shareUrl);
      sonnerToast.success("Link copied");
    } catch {
      sonnerToast.message("Copy this link manually", {
        description: shareUrl,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12">
          <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-muted h-96 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist.
          </p>
          <a href="/" className="text-primary hover:underline">
            Back to Marketplace
          </a>
        </div>
      </div>
    );
  }

  const previewImages = product.preview_images || [];
  const mainImage = previewImages[selectedImageIndex] || "/placeholder-product.png";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 md:py-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <a href="/" className="hover:text-primary">
            Home
          </a>
          <span>/</span>
          <a href="/" className="hover:text-primary">
            Products
          </a>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl bg-muted aspect-square">
              <img
                src={mainImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {previewImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {previewImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === selectedImageIndex
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {product.title}
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(parseFloat(product.rating))
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.review_count} reviews)
                </span>
              </div>

              {product.creator && (
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {product.creator.avatar ? (
                      <img
                        src={product.creator.avatar}
                        alt={product.creator.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle2 className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{product.creator.name}</p>
                    {product.creator.is_creator && (
                      <p className="text-xs text-secondary flex items-center gap-1">
                        <CircleCheck className="w-3 h-3" />
                        Creator account
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">
                Price
              </p>
              <p className="text-4xl font-bold text-primary">${product.price}</p>
            </div>

            {product.description && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">
                  About This Product
                </p>
                <p className="text-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">
                File Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Format</p>
                  <p className="font-semibold text-foreground">
                    {product.file_type || "Digital"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Size</p>
                  <p className="font-semibold text-foreground">
                    {product.file_size
                      ? `${(product.file_size / 1024 / 1024).toFixed(2)} MB`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleBuyNow}
                disabled={addToCartMutation.isPending}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50"
              >
                <Download className="w-5 h-5 inline mr-2" />
                Buy Now and Download
              </button>

              <button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="w-full px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-all disabled:opacity-50"
              >
                <ShoppingCart className="w-5 h-5 inline mr-2" />
                Add to Cart
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleWishlist}
                disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:border-primary/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? "fill-current text-secondary" : ""}`}
                />
                <span className="hidden sm:inline">Wishlist</span>
              </button>
              <button
                onClick={handleShare}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                <strong>Instant Download:</strong> You'll receive a download link immediately
                after purchase. No waiting.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Customer Reviews</h2>
          <div className="text-center py-8 text-muted-foreground">
            <p>Reviews coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
