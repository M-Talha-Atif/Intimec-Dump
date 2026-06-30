import React from "react";
import { Badge } from "@/components/ui/badge";
import { cva, VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "hover:bg-opacity-100", // base classes, if any
  {
    variants: {
      color: {
        red: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-800",
        green:
          "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-800",
        blue: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-800",
        yellow:
          "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-100 dark:hover:bg-yellow-800",
        gray: "bg-zinc-100 text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-800",
      },
    },
    defaultVariants: {
      color: "gray",
    },
  }
);
export type CustomBadgeColor = VariantProps<typeof badgeVariants>["color"];

interface CustomBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

export default function CustomBadge({
  color,
  children,
  className,
  ...props
}: CustomBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={badgeVariants({ color, className })}
      {...props}
    >
      {children}
    </Badge>
  );
}
