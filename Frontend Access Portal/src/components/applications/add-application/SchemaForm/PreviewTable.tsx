import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
  StickyTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { memo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function formatCellValue(value: unknown): string {
  if (value == null) return "-";
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

import { ArrowDownAZ, ArrowUpAZ, GripVertical } from "lucide-react"; // or any small grip icon
import { SortingState } from "@/types/shared";
import { Skeleton } from "@/components/ui/skeleton";

function DraggableColumn({
  id,
  children,
  onClick,
}: {
  id: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  // useSortable returns setActivatorNodeRef in recent versions — if yours doesn't, listeners on the handle still works
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableHead ref={setNodeRef} style={style} className="whitespace-nowrap">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          asChild
          ref={setActivatorNodeRef} /* optional, but recommended */
          {...listeners}
          {...attributes}
          aria-label="Drag column"
          className=" cursor-grab"
        >
          <GripVertical className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          onClick={onClick}
          className="flex-1 justify-start px-2 py-1"
        >
          {children}
        </Button>
      </div>
    </TableHead>
  );
}

const PreviewTable = memo(function PreviewTable({
  selectedHeaders,
  data,
  sortConfig,
  handleSort,
  loadingPreviewData,
  rowsCount,
}: {
  selectedHeaders: string[];
  data: Record<string, string[]>[] | undefined;
  sortConfig: SortingState | null;
  handleSort: (column: string) => void;
  loadingPreviewData?: boolean;
  rowsCount?: number;
}) {
  const [columns, setColumns] = useState(selectedHeaders);
  useEffect(() => {
    setColumns(selectedHeaders);
  }, [selectedHeaders]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <ScrollArea className="flex-1 rounded-md border-1">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (over && active.id !== over.id) {
            const oldIndex = columns.findIndex((c) => c === active.id);
            const newIndex = columns.findIndex((c) => c === over.id);
            setColumns((cols) => arrayMove(cols, oldIndex, newIndex));
          }
        }}
      >
        <StickyTable className="relative table-auto">
          <TableHeader className="sticky top-0 z-1">
            <SortableContext
              items={columns}
              strategy={horizontalListSortingStrategy}
            >
              <TableRow>
                {Array.from(columns).map((col) => (
                  <DraggableColumn
                    key={col}
                    id={col}
                    onClick={() => {
                      handleSort(col);
                    }}
                  >
                    {col}
                    {sortConfig?.sortBy === col && (
                      <span>
                        {sortConfig?.direction === "asc" ? (
                          <ArrowDownAZ />
                        ) : (
                          <ArrowUpAZ />
                        )}
                      </span>
                    )}
                  </DraggableColumn>
                ))}
              </TableRow>
            </SortableContext>
          </TableHeader>
          <TableBody>
            {loadingPreviewData &&
              Array.from({ length: rowsCount || 5 }).map((_, index) => (
                <TableRow key={index} className="odd:bg-muted/50 h-10">
                  {Array.from(columns).map((header) => (
                    <TableCell key={header} className="truncate max-w-64">
                      <Skeleton className="h-4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!loadingPreviewData &&
              data &&
              data.map((item, index) => (
                <TableRow key={index} className="odd:bg-muted/50 h-10">
                  {Array.from(columns).map((header) => (
                    <TableCell key={header} className="truncate max-w-64">
                      {formatCellValue(item[header])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </StickyTable>
      </DndContext>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
});

export default PreviewTable;
