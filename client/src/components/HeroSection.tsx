import {
  BriefcaseBusiness,
  Palette,
  Search,
  ShieldCheck,
  TrendingUp,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const categories = [
    { name: "Food & Snacks", icon: UtensilsCrossed, color: "from-red-500 to-orange-500" },
    { name: "Design Resources", icon: Palette, color: "from-purple-500 to-pink-500" },
    { name: "Business Tools", icon: BriefcaseBusiness, color: "from-blue-500 to-cyan-500" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/5 pt-20 pb-32 md:pt-32 md:pb-40">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Discover & Download
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Digital Products
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore thousands of high-quality digital products from talented creators.
            Food templates, design resources, and business tools, all available as
            instant downloads.
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12 animate-slide-in-up">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-background rounded-2xl border-2 border-primary/20 hover:border-primary/40 transition-colors shadow-lg hover:shadow-xl">
              <div className="flex items-center px-6 py-4">
                <Search className="w-6 h-6 text-primary mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search products, creators, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground text-lg"
                />
                <button
                  type="submit"
                  className="ml-4 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:scale-105"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {["Recipes", "Logo Templates", "Business Plans"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  window.location.href = `/search?q=${encodeURIComponent(tag)}`;
                }}
                className="px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
              >
                {tag}
              </button>
            ))}
          </div>
        </form>

        <div className="max-w-4xl mx-auto">
          <p className="text-center text-muted-foreground text-sm mb-6 uppercase tracking-wide font-semibold">
            Browse by Category
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <a
                key={category.name}
                href={`/?category=${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group relative overflow-hidden rounded-xl p-6 bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                ></div>

                <div className="relative z-10 flex items-center gap-4">
                  <div className="text-4xl">
                    <category.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">Browse products</p>
                  </div>
                </div>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-primary text-xl">-&gt;</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mx-auto mb-3">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Instant Download</h4>
            <p className="text-sm text-muted-foreground">
              Get your products immediately after purchase
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-secondary/10 mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Trending Products</h4>
            <p className="text-sm text-muted-foreground">
              Discover what's popular in the community
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mx-auto mb-3">
              <ShieldCheck className="w-6 h-6 text-accent" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Quality Verified</h4>
            <p className="text-sm text-muted-foreground">
              All products reviewed by our community
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
