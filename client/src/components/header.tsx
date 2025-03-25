import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-provider";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="text-primary text-3xl font-bold">Harker</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            href="/" 
            className={`text-xl font-semibold hover:text-primary transition-colors duration-200 ${isActive("/") && "text-primary"}`}
          >
            Live Events
          </Link>
          <Link 
            href="/#on-demand" 
            className="text-xl font-semibold hover:text-primary transition-colors duration-200"
          >
            On-Demand
          </Link>
          <Link 
            href="/discussions" 
            className={`text-xl font-semibold hover:text-primary transition-colors duration-200 ${isActive("/discussions") && "text-primary"}`}
          >
            Discussions
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium">
                  Signed in as {user.username}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  className="text-red-600 cursor-pointer"
                >
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button className="bg-primary hover:bg-primary/90">Sign In</Button>
            </Link>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="md:hidden text-gray-700 focus:outline-none" 
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white mt-2 py-2 px-6">
          <Link 
            href="/" 
            className="block py-4 text-xl font-semibold"
            onClick={() => setMobileMenuOpen(false)}
          >
            Live Events
          </Link>
          <Link 
            href="/#on-demand" 
            className="block py-4 text-xl font-semibold"
            onClick={() => setMobileMenuOpen(false)}
          >
            On-Demand
          </Link>
          <Link 
            href="/discussions" 
            className="block py-4 text-xl font-semibold"
            onClick={() => setMobileMenuOpen(false)}
          >
            Discussions
          </Link>
          
          {user ? (
            <>
              <div className="py-4 text-xl font-semibold text-gray-500">
                Signed in as {user.username}
              </div>
              {user.isAdmin && (
                <Link 
                  href="/admin" 
                  className="block py-4 text-xl font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              <button 
                onClick={() => {
                  logoutMutation.mutate();
                  setMobileMenuOpen(false);
                }}
                className="block py-4 text-xl font-semibold text-red-600 w-full text-left"
              >
                Log Out
              </button>
            </>
          ) : (
            <Link 
              href="/auth" 
              className="block py-4 text-xl font-semibold text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
