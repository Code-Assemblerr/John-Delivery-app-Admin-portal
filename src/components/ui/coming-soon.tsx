import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({ title }: { title: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)]">
          <Construction className="h-7 w-7 text-[var(--accent)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          {title}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-[var(--foreground-muted)]">
          This section is being built. Check back soon.
        </p>
      </CardContent>
    </Card>
  );
}
