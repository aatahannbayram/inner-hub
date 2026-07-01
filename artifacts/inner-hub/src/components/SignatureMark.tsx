import { Link } from "wouter";

export function SignatureMark() {
  return (
    <Link href="/" className="inline-flex items-baseline gap-[0.15em] group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2">
      <span className="font-serif italic text-xl tracking-tight text-foreground group-hover:opacity-80 transition-opacity">inner</span>
      <span
        className="inline-block w-[0.38em] h-[0.38em] bg-[var(--inner-green)] animate-beacon flex-shrink-0"
        style={{ marginBottom: "0.06em" }}
        aria-hidden="true"
      />
      <span className="font-serif text-xl tracking-tight text-foreground group-hover:opacity-80 transition-opacity">hub</span>
    </Link>
  );
}
