import React from "react";
import { Badge } from "@/components/ui/badge";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const attributeCategoryBadge = cva(
  "", // base styles
  {
    variants: {
      category: {
        WARN: "bg-yellow-100 text-yellow-600 hover:bg-blue-100 dark:bg-yellow-900 dark:text-yellow-300",
        INFO: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300",
        ERROR: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300",
        DEBUG: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
        TRACE: "",
      },
    },
    defaultVariants: {
      category: "INFO",
    },
  }
);

interface AttributeCategoryBadgeProps extends React.ComponentProps<"span"> {
  category: VariantProps<typeof attributeCategoryBadge>["category"];
}

export default function AttributeCategoryBadge({
  category,
  className,
  ...props
}: AttributeCategoryBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(attributeCategoryBadge({ category }), className)}
      {...props}
    >
      {category
        ? category.charAt(0).toUpperCase() + category.slice(1)
        : "Unknown"}
    </Badge>
  );
}