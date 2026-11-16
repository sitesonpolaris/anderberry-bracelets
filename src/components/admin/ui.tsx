export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[2.6rem] leading-none">{title}</h1>
        {sub && <p className="mt-2 text-hematite">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-5 sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 font-sans text-[1.05rem] font-semibold tracking-normal">{title}</h2>}
      {children}
    </section>
  );
}

const statusTone: Record<string, string> = {
  paid: "bg-[#f3e6c8] text-[#5a3d0c]",
  in_production: "bg-[#e3e7ee] text-[#26313a]",
  shipped: "bg-[#dfeadf] text-[#21452a]",
  delivered: "bg-[#dfeadf] text-[#21452a]",
  cancelled: "bg-[#eee] text-[#444]",
  refunded: "bg-[#f1dcd9] text-[#5e1b19]",
  new: "bg-[#f3e6c8] text-[#5a3d0c]",
  quoted: "bg-[#e3e7ee] text-[#26313a]",
  won: "bg-[#dfeadf] text-[#21452a]",
  closed: "bg-[#eee] text-[#444]",
};

export function Status({ value }: { value: string }) {
  return <span className={`inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-sm font-medium ${statusTone[value] ?? "bg-[#eee]"}`}>{value.replace("_", " ")}</span>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-[#f7f4ee] px-4 py-6 text-center text-hematite">{children}</p>;
}
