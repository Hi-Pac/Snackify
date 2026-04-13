import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { Download, LogOut, Package, Settings } from "lucide-react";
import { useState } from "react";
import { toast as sonnerToast } from "sonner";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"purchases" | "settings">("purchases");

  const { data: orders = [], isLoading } = trpc.marketplace.orders.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view your profile.</p>
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
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {user.role === "creator" ? "Creator" : "Buyer"}
                  </span>
                  {user.role === "admin" && (
                    <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-semibold rounded-full">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab("settings")}
                className="px-4 py-2 border border-border rounded-lg hover:border-primary/50 transition-colors flex items-center gap-2"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
                className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("purchases")}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "purchases"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="w-5 h-5 inline mr-2" />
            My Purchases
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "settings"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            Settings
          </button>
        </div>

        {activeTab === "purchases" ? (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Purchase History</h2>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-muted h-24 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary mb-2">
                          ${order.total_amount}
                        </p>
                        {order.status === "completed" && (
                          <button
                            onClick={() => {
                              if (order.download_links?.length) {
                                window.open(
                                  order.download_links[0]!.url,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                                return;
                              }
                              sonnerToast.message(
                                "Downloads are not attached to this order yet"
                              );
                            }}
                            className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2 ml-auto"
                          >
                            <Download className="w-4 h-4" />
                            Download Files
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <Package className="w-16 h-16 text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No purchases yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring and buy some amazing digital products!
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Browse Products
                </a>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Account Settings</h2>

            <div className="bg-card border border-border rounded-lg p-6 space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-border bg-muted text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user.name || ""}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-border bg-muted text-foreground"
                />
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
                <button
                  onClick={() => sonnerToast.message("Account deletion is not available yet")}
                  className="px-6 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
