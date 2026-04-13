import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/ProductGrid";
import CreatorSpotlight from "@/components/CreatorSpotlight";

export default function Home() {
  const { isAuthenticated } = useAuth();

  // Extract search query from URL if present
  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get("q") || undefined;
  const categoryParam = searchParams.get("category") || undefined;

  // Map category names to IDs (will need to fetch these dynamically in real app)
  const categoryMap: Record<string, number> = {
    "food-snacks": 1,
    "design-resources": 2,
    "business-tools": 3,
  };

  const categoryId = categoryParam ? categoryMap[categoryParam] : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <HeroSection onSearch={(query) => {
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
      }} />

      {/* Product Grid */}
      <ProductGrid categoryId={categoryId} searchQuery={searchQuery} />

      {/* Creator Spotlight */}
      <CreatorSpotlight />

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-secondary">
        <div className="container text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Share Your Creations?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join our community of creators and start selling your digital products today. Instant downloads, secure payments, and real earnings.
          </p>
          <button
            onClick={() => {
              if (isAuthenticated) {
                window.location.href = "/creator/dashboard";
              } else {
                window.location.href = "/login";
              }
            }}
            className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-opacity-90 transition-all hover:scale-105"
          >
            Become a Creator
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary">Snackify</h3>
              <p className="text-sm text-muted-foreground">
                Discover and download high-quality digital products from talented creators.
              </p>
            </div>

            {/* Marketplace */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Marketplace</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/?category=food-snacks" className="hover:text-primary transition-colors">Food & Snacks</a></li>
                <li><a href="/?category=design-resources" className="hover:text-primary transition-colors">Design Resources</a></li>
                <li><a href="/?category=business-tools" className="hover:text-primary transition-colors">Business Tools</a></li>
              </ul>
            </div>

            {/* For Creators */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">For Creators</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/creator/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
                <li><a href="/creator/dashboard?tab=products" className="hover:text-primary transition-colors">Upload Product</a></li>
                <li><a href="/creator/dashboard?tab=earnings" className="hover:text-primary transition-colors">Earnings</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2026 Snackify. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition-colors">Twitter</a>
              <a href="#" className="hover:text-primary transition-colors">Instagram</a>
              <a href="#" className="hover:text-primary transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
