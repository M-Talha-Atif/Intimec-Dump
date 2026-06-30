import React from "react";

import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

export default function SekeletonRow({ cols = 8 }) {
  return (
    <TableRow className="cursor-not-allowed">
      <TableCell className="w-10">
        <div className="flex items-center justify-center h-8">
          <Checkbox
            disabled
          />
        </div>
      </TableCell>
      {Array.from({ length: cols - 2 }).map((_, index) => (
        <TableCell key={index}>
          <Skeleton className="p-2.5 rounded-md"></Skeleton>
        </TableCell>
      ))}
      <TableCell className="w-10">
        <span className="sr-only">loading</span>
      </TableCell>
    </TableRow>
  );
}
