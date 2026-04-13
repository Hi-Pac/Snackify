import { useEffect } from "react";
import { getLoginUrl } from "@/const";

export default function LoginRedirect() {
  useEffect(() => {
    window.location.replace(getLoginUrl());
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-foreground mb-3">Redirecting to sign in</h1>
        <p className="text-muted-foreground">
          Please wait while we forward you to the authentication provider.
        </p>
      </div>
    </div>
  );
}
