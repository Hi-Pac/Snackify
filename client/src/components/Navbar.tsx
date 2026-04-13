import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Menu,
  Search,
  Shield,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link href="/">
          <a className="flex items-center gap-2 font-bold text-xl md:text-2xl text-primary hover:text-primary/80 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="hidden sm:inline">Snackify</span>
          </a>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-8 max-w-md">
          <div className="flex items-center w-full bg-input border border-border rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-primary">
            <Search className="w-5 h-5 text-muted-foreground mr-2" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
            />
          </div>
        </form>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/cart">
            <a className="relative p-2 hover:bg-muted rounded-lg transition-colors">
              <ShoppingCart className="w-6 h-6 text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
            </a>
          </Link>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden lg:inline text-sm font-medium">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <a className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/purchases">
                    <a className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      My Purchases
                    </a>
                  </Link>
                </DropdownMenuItem>
                {user.role === "creator" && (
                  <DropdownMenuItem asChild>
                    <Link href="/creator/dashboard">
                      <a className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Creator Dashboard
                      </a>
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <a className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </a>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-primary hover:bg-primary/90"
            >
              Sign In
            </Button>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="container py-4 space-y-4">
            <form onSubmit={handleSearch}>
              <div className="flex items-center bg-input border border-border rounded-lg px-4 py-2">
                <Search className="w-5 h-5 text-muted-foreground mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
                />
              </div>
            </form>

            <div className="space-y-2">
              <Link href="/cart">
                <a className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                </a>
              </Link>

              {isAuthenticated && user ? (
                <>
                  <Link href="/profile">
                    <a className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors">
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </a>
                  </Link>
                  <Link href="/purchases">
                    <a className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors">
                      <ShoppingCart className="w-5 h-5" />
                      <span>My Purchases</span>
                    </a>
                  </Link>
                  {user.role === "creator" && (
                    <Link href="/creator/dashboard">
                      <a className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Creator Dashboard</span>
                      </a>
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <a className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors">
                        <Shield className="w-5 h-5" />
                        <span>Admin Panel</span>
                      </a>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-2 py-2 text-destructive hover:bg-muted rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    window.location.href = getLoginUrl();
                    setIsOpen(false);
                  }}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
