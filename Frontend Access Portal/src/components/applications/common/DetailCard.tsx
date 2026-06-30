"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import clsx from "clsx";

interface DetailCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  details: { label: string; value: React.ReactNode | string }[];
  bottomActions?: React.ReactNode;
  showMoreCount?: number;
  className?: string;
}

export default function DetailCard({
  title,
  details,
  bottomActions,
  showMoreCount = 0,
  className = "",
  ...props
}: DetailCardProps) {
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const showMoreDetailsButton: boolean =
    showMoreCount > 0 && details.length > showMoreCount;

  if (showMoreCount > 0 && !showMoreDetails) {
    details = details.slice(0, showMoreCount);
  }
  return (
    <Card
      className={clsx(
        "flex-[1_1_calc(33.3333%_-_1.5rem)] box-border min-w-80 flex flex-col",
        className
      )}
      {...props}
    >
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <dl>
          {details.map((detail) => (
            <div
              key={detail.label}
              className="flex justify-between py-2 border-b last:border-b-0"
            >
              <dt className="text-sm text-muted-foreground">{detail.label}</dt>
              <dd className="text-sm font-medium text-right flex flex-wrap gap-2 justify-end pl-2">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
        {showMoreDetailsButton && (
          <Button
            variant="link"
            onClick={() => setShowMoreDetails((prev) => !prev)}
            className="ps-0"
          >
            {showMoreDetails ? "Show less" : "Show more"}
          </Button>
        )}
      </CardContent>
      {bottomActions && (
        <CardFooter className="flex flex-wrap">
          <div className="flex flex-wrap gap-2">{bottomActions}</div>
        </CardFooter>
      )}
    </Card>
  );
}
