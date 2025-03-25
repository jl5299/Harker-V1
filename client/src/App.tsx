import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/auth-provider";
import { ProtectedRoute } from "./lib/protected-route";

import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import VideoPage from "@/pages/video-page";
import DiscussionPage from "@/pages/discussion-page";
import AuthPage from "@/pages/auth-page";
import AdminPage from "@/pages/admin-page";
import DiscussionsPage from "@/pages/discussions-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/video/:id" component={VideoPage} />
      <ProtectedRoute path="/discussion/:id" component={DiscussionPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/admin" component={AdminPage} adminOnly={true} />
      <Route path="/discussions" component={DiscussionsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
