"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { AppWindow } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

export default function ApplicationIcon({
  iconPath,
  name,
}: {
  iconPath?: string;
  name: string;
}) {
  const [error, setError] = useState(false);
  return (
    <div className="flex-shrink-0 p-2 rounded-md bg-muted">
      {iconPath && iconPath.trim() && !error ? (
        <Image
          src={iconPath}
          alt={`${name} Icon`}
          className="size-6 rounded object-cover overflow-hidden text-ellipsis whitespace-nowrap"
          width={32}
          height={32}
          onError={() => setError(true)}
        />
      ) : (
        <AppWindow className="size-6 text-black" />
      )}
    </div>
  );
}

export function ApplicationIconSkeleton() {
  return <Skeleton className="w-8 h-8 rounded animate-pulse" />;
}
