import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";

interface ExpandableRowProps {
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

export const ExpandableRow: React.FC<ExpandableRowProps> = ({
  children,
  expandedContent,
  isExpanded,
  onToggle,
  className,
}) => (
  <>
    <TableRow
      className={`cursor-pointer hover:bg-slate-50/50 transition-colors ${className}`}
      onClick={onToggle}
    >
      <TableCell className="w-8">
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400" />
        )}
      </TableCell>
      {children}
    </TableRow>
    {isExpanded && expandedContent}
  </>
);

export default ExpandableRow;
