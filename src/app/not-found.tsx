import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>
      <div className="relative z-10 text-center">
        <div className="mb-6 inline-block">
          <span className="text-gradient-accent bg-clip-text text-9xl font-bold tracking-tighter">
            404
          </span>
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-[var(--foreground)]">
          Page not found
        </h1>
        <p className="mb-8 max-w-sm text-sm text-[var(--foreground-muted)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button variant="gradient">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
