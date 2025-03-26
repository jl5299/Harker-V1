import { Route, Switch, Redirect } from "wouter";
import { AuthProvider } from "./contexts/auth-context";
import { AuthPage } from "./pages/auth-page";
import { ProtectedRoute } from "./components/protected-route";
import { SettingsPage } from "./pages/settings-page";
import { Toaster } from "./components/ui/toaster";
import LiveEventsPage from "./pages/live-events-page";
import OnDemandPage from "./pages/on-demand-page";
import DiscussionsPage from "./pages/discussions-page";
import HomePage from "./pages/home-page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./contexts/auth-context";

console.log('App component rendering');

// Create a client
const queryClient = new QueryClient();

// Root route that redirects based on auth status
function RootRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  return <HomePage />;
}

function AppRoutes() {
  console.log('AppRoutes component rendering');
  return (
    <Switch>
      <Route path="/auth">
        <AuthPage />
      </Route>
      <ProtectedRoute path="/home-page">
        <HomePage />
      </ProtectedRoute>
      <ProtectedRoute path="/settings">
        <SettingsPage />
      </ProtectedRoute>
      <ProtectedRoute path="/live-events-page">
        <LiveEventsPage />
      </ProtectedRoute>
      <ProtectedRoute path="/on-demand-page">
        <OnDemandPage />
      </ProtectedRoute>
      <ProtectedRoute path="/discussions-page">
        <DiscussionsPage />
      </ProtectedRoute>
      <Route path="/">
        <RootRoute />
      </Route>
    </Switch>
  );
}

export default function App() {
  console.log('App component mounting');
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
