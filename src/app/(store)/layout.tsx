import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SiteMotion from "@/components/SiteMotion";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer />
      <SiteMotion />
    </CartProvider>
  );
}
