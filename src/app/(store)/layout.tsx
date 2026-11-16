import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SiteMotion from "@/components/SiteMotion";
import { getCollections } from "@/lib/products";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const collections = await getCollections();
  const lead = collections[0];
  return (
    <CartProvider>
      <Header featured={lead ? { key: lead.key, name: lead.name } : undefined} />
      <main id="main">{children}</main>
      <Footer collections={collections} />
      <CartDrawer />
      <SiteMotion />
    </CartProvider>
  );
}
