"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin, supabaseServer } from "@/lib/supabase/server";

/** Refresh the public store after a catalogue change. */
export async function revalidateStore(slug?: string) {
  if (!(await getAdmin())) throw new Error("Not allowed");
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/shop/${slug}`);
}

export async function signOut() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/admin/login");
}
