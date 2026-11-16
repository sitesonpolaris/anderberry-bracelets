/**
 * Plain text from the admin, shown safely: keeps line breaks, wraps long words,
 * and turns http(s) links into short clickable links (no HTML is ever injected).
 */
const URL_RE = /(https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]])/g;

function label(href: string) {
  try {
    const u = new URL(href);
    const path = u.pathname.replace(/\/+$/, "");
    return u.hostname.replace(/^www\./, "") + (path && path !== "/" ? "/…" : "");
  } catch {
    return href;
  }
}

export default function RichText({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(URL_RE);
  return (
    <p className={`whitespace-pre-line [overflow-wrap:anywhere] ${className}`}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="link font-medium">
            {label(part)}
          </a>
        ) : (
          part
        ),
      )}
    </p>
  );
}
