import { Badge } from "./Logo";

/** Shown where a product has no photograph yet. */
export default function NoPhoto({ name }: { name: string }) {
  return (
    <div role="img" aria-label={`${name}, photo coming soon`} className="absolute inset-0 grid place-items-center bg-onyx text-bone">
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <Badge className="h-24 w-24 opacity-90" title="" />
        <span className="text-sm text-ash">Photo coming soon</span>
      </div>
    </div>
  );
}
