"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] shadow-[0_0_0_1px_var(--accent),0_4px_20px_-4px_var(--accent-glow)] hover:shadow-[0_0_0_1px_var(--accent-hover),0_8px_32px_-4px_var(--accent-glow)]",
        destructive:
          "bg-[var(--danger)] text-white hover:opacity-90 shadow-[0_0_0_1px_var(--danger)]",
        outline:
          "border border-[var(--border-strong)] bg-transparent text-[var(--foreground)] hover:bg-[var(--sidebar-item-hover)] hover:border-[var(--accent)]",
        secondary:
          "bg-[var(--panel-elevated)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--sidebar-item-hover)]",
        ghost:
          "text-[var(--foreground)] hover:bg-[var(--sidebar-item-hover)]",
        link:
          "text-[var(--accent)] underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-[0_4px_20px_-4px_var(--accent-glow)] hover:shadow-[0_8px_32px_-4px_var(--accent-glow)] hover:brightness-110",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-12 px-6 text-base rounded-xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
