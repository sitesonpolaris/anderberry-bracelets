export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="wrap pb-32 pt-10 lg:pt-16">
      <h1 className="text-[clamp(2.75rem,6vw,5.5rem)]">{title}</h1>
      <p className="mt-4 text-hematite">Last updated {updated}</p>
      <div className="mt-12 max-w-2xl space-y-6 text-[1.08rem] leading-relaxed [&_h2]:mt-12 [&_h2]:text-[2rem] [&_a]:underline">{children}</div>
    </article>
  );
}
