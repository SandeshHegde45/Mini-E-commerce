import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { CartPreviewProvider } from "@/components/CartPreview";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function RootLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <CartPreviewProvider>
      <div className="flex min-h-dvh flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CartPreviewProvider>
  );
}
