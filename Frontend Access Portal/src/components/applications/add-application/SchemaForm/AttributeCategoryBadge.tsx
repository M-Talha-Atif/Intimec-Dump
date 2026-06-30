import React from "react";
import { Badge } from "@/components/ui/badge";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const attributeCategoryBadge = cva(
  "", // base styles
  {
    variants: {
      category: {
        identity: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
        entitlement: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300",
        risk: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300",
        metadata: "",
      },
    },
    defaultVariants: {
      category: "metadata",
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
