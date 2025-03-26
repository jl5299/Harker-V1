import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      setTimeout(() => {
        setLocation("/auth");
      }, 100);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isAuthPage = location === "/auth";

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {user ? (
              <Link href="/" className="text-xl font-semibold text-gray-900">
                Harker
              </Link>
            ) : (
              <span className="text-xl font-semibold text-gray-900">
                Harker
              </span>
            )}
            {!isAuthPage && (
              <div className="hidden md:flex space-x-6">
                <Link href="/live-events-page" className="text-gray-600 hover:text-gray-900">
                  Live Events
                </Link>
                <Link href="/on-demand-page" className="text-gray-600 hover:text-gray-900">
                  On-Demand
                </Link>
                <Link href="/discussions-page" className="text-gray-600 hover:text-gray-900">
                  Discussions
                </Link>
              </div>
            )}
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user.email}</span>
              <Button
                onClick={handleSignOut}
                className="bg-primary hover:bg-primary/90"
              >
                Sign Out
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
