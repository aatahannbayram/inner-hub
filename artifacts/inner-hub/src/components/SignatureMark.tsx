import React from "react";
import { Link } from "wouter";

export function SignatureMark() {
  return (
    <Link href="/" className="inline-flex items-baseline gap-[0.2em] group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2">
      <span className="font-serif text-xl tracking-tight text-foreground group-hover:opacity-80 transition-opacity">inner</span>
      <span className="inline-block w-[0.45em] h-[0.45em] bg-[var(--inner-green)] animate-beacon" aria-hidden="true" />
      <span className="font-serif text-xl tracking-tight text-foreground group-hover:opacity-80 transition-opacity">hub</span>
    </Link>
  );
}
