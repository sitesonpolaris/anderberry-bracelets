import { BADGE_PATH, WORDMARK_PATH } from "./logo-paths";

export function Wordmark({ className = "", title = "AnderBerry" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="40 392 962 356" className={className} role="img" aria-label={title} fill="currentColor">
      <path d={WORDMARK_PATH} fillRule="evenodd" />
    </svg>
  );
}

export function Badge({ className = "", title = "AnderBerry Bracelets, established 2014" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 1073 1073" className={className} role="img" aria-label={title} fill="currentColor">
      <path d={BADGE_PATH} fillRule="evenodd" />
    </svg>
  );
}
