import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TabCardProps } from "../types";

export const TabCard: React.FC<TabCardProps> = ({
  title,
  description,
  children,
  className,
}) => (
  <Card className={cn("h-fit", className)}>
    <CardHeader className="pb-4">
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      {description && (
        <CardDescription className="text-sm text-slate-500">
          {description}
        </CardDescription>
      )}
    </CardHeader>
    <CardContent className="pt-0">{children}</CardContent>
  </Card>
);

export default TabCard;
