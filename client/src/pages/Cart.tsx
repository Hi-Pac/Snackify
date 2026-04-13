import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react";
import { toast as sonnerToast } from "sonner";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: cartItems = [], isLoading } = trpc.marketplace.cart.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const removeFromCartMutation = trpc.marketplace.cart.removeItem.useMutation({
    onSuccess: async () => {
      await utils.marketplace.cart.get.invalidate();
      sonnerToast.success("Removed from cart");
    },
    onError: (error) => {
      sonnerToast.error(error.message || "Could not remove item");
    },
  });

  const createOrderMutation = trpc.marketplace.orders.create.useMutation({
    onError: (error) => {
      sonnerToast.error(error.message || "Could not start checkout");
    },
  });

  const handleRemoveItem = (cartItemId: number) => {
    removeFromCartMutation.mutate({ cartItemId });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const items = cartItems.map((item: any) => ({
      product_id: item.product_id,
      price: item.product.price,
      creator_id: item.product.creator_id,
    }));

    const totalAmount = cartItems
      .reduce((sum: number, item: any) => sum + parseFloat(item.product.price), 0)
      .toFixed(2);

    createOrderMutation.mutate(
      { items, totalAmount },
      {
        onSuccess: (order) => {
          window.location.href = `/checkout/${order.id}`;
        },
      }
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view your cart.</p>
          <a href="/login" className="text-primary hover:underline">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-muted h-24 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.product.preview_images?.[0] || "/placeholder-product.png"}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {item.product.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {item.product.creator?.name || "Independent creator"}
                      </p>
                      <p className="text-lg font-bold text-primary">${item.product.price}</p>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={removeFromCartMutation.isPending}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-muted mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Start by adding some amazing digital products!
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Continue Shopping
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

                <div className="space-y-2 mb-4 pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items ({cartItems.length})</span>
                    <span className="font-semibold text-foreground">
                      ${cartItems
                        .reduce(
                          (sum: number, item: any) => sum + parseFloat(item.product.price),
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ${cartItems
                        .reduce(
                          (sum: number, item: any) => sum + parseFloat(item.product.price),
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={createOrderMutation.isPending}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Instant download after payment
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
