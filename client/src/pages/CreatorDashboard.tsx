import { useState } from "react";
import { Plus, TrendingUp, Package, DollarSign, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CreatorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const tabParam = new URLSearchParams(window.location.search).get("tab");
  const initialTab =
    tabParam === "products" || tabParam === "earnings" ? tabParam : "overview";
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "earnings">(initialTab);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access the creator dashboard.</p>
          <a href="/login" className="text-primary hover:underline">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (user.role !== "creator" && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need to be a creator to access this page.</p>
          <a href="/" className="text-primary hover:underline">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Creator Dashboard</h1>
            <p className="text-muted-foreground">Manage your products and track your earnings</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2 w-fit">
            <Plus className="w-5 h-5" />
            Upload Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Products</p>
                <p className="text-3xl font-bold text-foreground">0</p>
              </div>
              <Package className="w-12 h-12 text-primary/20" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Views</p>
                <p className="text-3xl font-bold text-foreground">0</p>
              </div>
              <Eye className="w-12 h-12 text-secondary/20" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-foreground">0</p>
              </div>
              <TrendingUp className="w-12 h-12 text-accent/20" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Earnings</p>
                <p className="text-3xl font-bold text-primary">$0.00</p>
              </div>
              <DollarSign className="w-12 h-12 text-primary/20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "products"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            My Products
          </button>
          <button
            onClick={() => setActiveTab("earnings")}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "earnings"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Earnings
          </button>
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
                <div className="text-center py-12 text-muted-foreground">
                  <p>No recent activity</p>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Quick Links</h2>
                <div className="space-y-2">
                  <a href="/creator/dashboard?tab=products" className="block px-4 py-2 hover:bg-muted rounded-lg transition-colors">
                    Upload Product
                  </a>
                  <a href="/profile" className="block px-4 py-2 hover:bg-muted rounded-lg transition-colors">
                    View Profile
                  </a>
                  <a href="/creator/dashboard?tab=earnings" className="block px-4 py-2 hover:bg-muted rounded-lg transition-colors">
                    Earnings
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <Package className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by uploading your first digital product!
              </p>
              <button className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Upload Product
              </button>
            </div>
          </div>
        )}

        {activeTab === "earnings" && (
          <div>
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Earnings Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">This Month</p>
                  <p className="text-3xl font-bold text-primary">$0.00</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-primary">$0.00</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Payout</p>
                  <p className="text-3xl font-bold text-primary">$0.00</p>
                </div>
              </div>
            </div>

            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <DollarSign className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No earnings yet</h3>
              <p className="text-muted-foreground">
                Your earnings will appear here once you make your first sale.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
