"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function ToastProvider() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        style: {
          background: "var(--panel-elevated)",
          color: "var(--foreground)",
          border: "1px solid var(--border-strong)",
          backdropFilter: "blur(16px)",
        },
        className: "glass-strong",
      }}
    />
  );
}
