import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-ink text-cream",
      kosong: "bg-statusKosong/15 text-emerald-700",
      pending: "bg-statusPending/20 text-amber-700",
      verifikasi: "bg-statusVerifikasi/15 text-blue-700",
      terisi: "bg-statusTerisi/15 text-red-400",
    },
  },
  defaultVariants: { variant: "default" },
});

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
