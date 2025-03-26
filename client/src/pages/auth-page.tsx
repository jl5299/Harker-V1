import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../contexts/auth-context";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Layout } from "../components/layout";
import { useToast } from "@/components/ui/use-toast";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

const defaultValues: AuthFormData = {
  email: "",
  password: "",
};

export function AuthPage() {
  const [, setLocation] = useLocation();
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  // const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues,
  });

  const onSubmit = async (values: AuthFormData) => {
    try {
      setIsSubmitting(true);
      setFormError(null);
      console.log('Attempting to sign in with:', values.email);
      
      await signIn(values.email, values.password);
      
      console.log('Sign in successful');
      toast({
        title: "Success",
        description: "You have been signed in successfully.",
      });
      
      // Add a small delay to ensure the user state is updated
      setTimeout(() => {
        setLocation("/home-page");
      }, 100);
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred during sign in";
      setFormError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if already signed in
  if (user) {
    setLocation("/home-page");
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Auth Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Welcome to Harker</CardTitle>
              <CardDescription className="text-lg">
                Sign in to access all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* <Tabs defaultValue="login" value={isSignUp ? "register" : "login"} onValueChange={(v) => setIsSignUp(v === "register")}>
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login" className="text-lg py-3">Login</TabsTrigger>
                  <TabsTrigger value="register" className="text-lg py-3">Register</TabsTrigger>
                </TabsList> */}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" className="text-lg py-6" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" className="text-lg py-6" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {formError && (
                    <div className="text-red-500 text-sm">{formError}</div>
                  )}
                  <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>

              {/* <TabsContent value="register">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" className="text-lg py-6" {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" className="text-lg py-6" {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {formError && (
                      <div className="text-red-500 text-sm">{formError}</div>
                    )}
                    <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
                      {isSubmitting ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent> */}
            </CardContent>
          </Card>
          
          {/* Hero Section */}
          <div className="bg-primary text-white rounded-lg shadow-lg flex flex-col justify-center p-10 hidden md:flex">
            <h2 className="text-3xl font-bold mb-6">Harker Video Platform</h2>
            <p className="text-xl mb-8 opacity-90">
              A specially designed platform for senior communities to watch curated content together and engage in meaningful discussions.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Weekly live events from cultural institutions</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Curated on-demand video library</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Thoughtful discussion guides for each video</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Record and transcribe group discussions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
