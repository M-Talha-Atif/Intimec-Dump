import { TableHead } from "@/components/ui/table";
import { Application } from "@/types/application";
import clsx from "clsx";

export function SortableHeader({
  columnKey,
  children,
  className,
}: {
  columnKey: keyof Application;
  children: React.ReactNode;
  className?: string;
}) {
  const requestSort = (key: keyof Application) => {
    console.log(`Request to sort by ${key}`);
    // redirect to ?sort=${key} or handle sorting logic here
  };

  return (
    <TableHead className={clsx("px-0", className)}>
      <div
        onClick={() => requestSort(columnKey)}
        className="hover:bg-muted p-2 flex items-center cursor-pointer select-none  rounded-md py-2 transition-colors duration-200"
      >
        {children}
        {/* {sortConfig.key === columnKey ? (
          sortConfig.direction === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
          )
        ) : (
          <div className="ml-2 h-4 w-4" />
        )} */}
      </div>
    </TableHead>
  );
}
