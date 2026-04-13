import Navbar from "@/components/Navbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRoute } from "wouter";

export default function Checkout() {
  const { isAuthenticated } = useAuth();
  const [, params] = useRoute("/checkout/:orderId");
  const orderId = params?.orderId;
  const productId = new URLSearchParams(window.location.search).get("product");

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-12">
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
            Checkout
          </p>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Payment flow is the next step
          </h1>
          <p className="text-muted-foreground mb-6">
            This route is now connected so users do not hit a dead end. The Stripe
            payment experience still needs to be implemented.
          </p>

          <div className="space-y-3 text-sm text-foreground">
            {orderId && (
              <div className="rounded-lg bg-muted p-4">
                <strong>Order:</strong> #{orderId}
              </div>
            )}
            {productId && (
              <div className="rounded-lg bg-muted p-4">
                <strong>Product:</strong> #{productId}
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <a
              href="/cart"
              className="px-5 py-3 rounded-lg border border-border text-foreground hover:border-primary/50 transition-colors"
            >
              Back to Cart
            </a>
            <a
              href="/"
              className="px-5 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Continue Browsing
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
