import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "graphite";
}

const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bento-card relative rounded-2xl border p-6 transition-all duration-200",
          variant === "default" &&
            "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-brand/50",
          variant === "glass" &&
            "bg-white/80 dark:bg-white/5 backdrop-blur-xl border-white/20 dark:border-white/10",
          variant === "graphite" && "bg-graphite border-white/10",
          className,
        )}
        {...props}
      />
    );
  },
);

BentoCard.displayName = "BentoCard";

export { BentoCard };
