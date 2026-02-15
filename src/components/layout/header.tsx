import Link from "next/link";
import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Zap className="h-5 w-5 text-green-500" />
          <span>Road Trip Companion</span>
        </Link>
      </div>
    </header>
  );
}
