import RequestRow from "@/components/admin/RequestRow";
import { Empty, PageHead, Panel } from "@/components/admin/ui";
import { supabaseServer } from "@/lib/supabase/server";
import type { CustomRequest } from "@/lib/types";

export const metadata = { title: "Requests" };

export default async function Requests() {
  const sb = await supabaseServer();
  const { data } = await sb.from("custom_requests").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = (data ?? []) as CustomRequest[];
  return (
    <>
      <PageHead title="Requests" sub="Custom orders, bulk logo quotes and price questions from the website." />
      <Panel>
        {rows.length ? (
          <ul className="divide-y divide-[#eee7da]">
            {rows.map((r) => <RequestRow key={r.id} r={r} />)}
          </ul>
        ) : (
          <Empty>No requests yet.</Empty>
        )}
      </Panel>
    </>
  );
}
