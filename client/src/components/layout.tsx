import Header from "./header";
import Footer from "./footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="py-6 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
} 