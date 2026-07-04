import { Link } from "wouter";
import { Lockup } from "@/components/Lockup";

export function SignatureMark() {
  return (
    <Link
      href="/"
      className="inline-flex group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Lockup
        className="text-foreground group-hover:opacity-80 transition-opacity"
        fontSize="clamp(24px, 2.6vw, 34px)"
      />
    </Link>
  );
}
