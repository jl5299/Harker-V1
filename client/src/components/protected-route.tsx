import { Route, useLocation } from "wouter";
import { useAuth } from "../contexts/auth-context";
import { useEffect } from "react";

interface ProtectedRouteProps {
  path: string;
  children: React.ReactNode;
}

export function ProtectedRoute({ path, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/auth");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Route path={path}>{children}</Route>;
} 