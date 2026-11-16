import Link from "next/link";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { Wordmark } from "@/components/Logo";
import { getAdmin, supabaseServer } from "@/lib/supabase/server";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";

export default async function Panel({ children }: { children: React.ReactNode }) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  const admin = await getAdmin();

  if (!admin) {
    return (
      <div className="grid min-h-dvh place-items-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-4xl">No admin access</h1>
          <p className="mt-4 text-hematite">
            {user.email} is signed in but isn’t an admin for this store. Ask Sites on Polaris to add you.
          </p>
          <form action={signOut} className="mt-6">
            <button className="btn btn-ink">Sign out</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
      <aside className="bg-onyx text-bone lg:sticky lg:top-0 lg:h-dvh">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block lg:px-6 lg:py-7">
          <Link href="/admin" aria-label="Admin home">
            <Wordmark className="h-9 w-auto lg:h-11" />
          </Link>
          <p className="hidden text-sm text-ash lg:mt-1 lg:block">Store admin</p>
        </div>
        <AdminNav />
        <div className="hidden px-6 pb-6 pt-8 text-sm lg:block">
          <p className="truncate text-ash">{admin.email}</p>
          <div className="mt-3 flex gap-4">
            <Link href="/" className="underline underline-offset-4">View store</Link>
            <form action={signOut}>
              <button className="underline underline-offset-4">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 px-4 pb-24 pt-6 sm:px-8 lg:px-10 lg:pt-10">{children}</div>
    </div>
  );
}
