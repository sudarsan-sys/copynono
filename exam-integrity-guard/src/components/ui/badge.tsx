import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        info: "border-transparent bg-info text-info-foreground",
        // Severity variants
        minor: "border-transparent bg-severity-minor text-success-foreground",
        major: "border-transparent bg-severity-major text-warning-foreground",
        severe: "border-transparent bg-severity-severe text-destructive-foreground",
        // Status variants
        pending: "border-transparent bg-status-pending/20 text-status-pending border-status-pending",
        review: "border-transparent bg-status-review/20 text-status-review border-status-review",
        resolved: "border-transparent bg-status-resolved/20 text-status-resolved border-status-resolved",
        dismissed: "border-transparent bg-status-dismissed/20 text-status-dismissed border-status-dismissed",
        draft: "border-transparent bg-status-draft/20 text-status-draft border-status-draft",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
