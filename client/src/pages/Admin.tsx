import Navbar from "@/components/Navbar";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            This area is reserved for administrators.
          </p>
          <a href="/" className="text-primary hover:underline">
            Back to marketplace
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-12">
        <div className="max-w-3xl bg-card border border-border rounded-xl p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
            Admin
          </p>
          <h1 className="text-3xl font-bold text-foreground mb-4">Admin area connected</h1>
          <p className="text-muted-foreground">
            This placeholder route keeps admin navigation valid until moderation,
            reporting, and operations tools are implemented.
          </p>
        </div>
      </div>
    </div>
  );
}
