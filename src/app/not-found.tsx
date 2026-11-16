import Link from "next/link";
import StoreLayout from "./(store)/layout";

export default function NotFound() {
  return (
    <StoreLayout>
      <div className="wrap pb-40 pt-16 lg:pt-24">
        <h1 className="max-w-3xl text-[clamp(3rem,7vw,6.5rem)]">This bead slipped off the string</h1>
        <p className="mt-6 max-w-lg text-[1.2rem]">The page you were after isn’t here. Try the shop instead.</p>
        <Link href="/shop" className="btn btn-ink mt-10">Shop bracelets</Link>
      </div>
    </StoreLayout>
  );
}
