import { ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Option = {
  label: string;
  value: string;
};

interface DateRangeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  tooltip?: string;
  placeholder?: string;
  triggerClassName?: string;
  icon?: ReactNode;
}

const DateRangeSelect = ({
  value,
  onChange,
  options,
  tooltip,
  placeholder = "Select range",
  triggerClassName = "w-[160px]",
  icon,
}: DateRangeSelectProps) => {
  const selectComponent = (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={triggerClassName}>
        {icon ?? (
          <CalendarDays className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
        )}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (!tooltip) return selectComponent;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{selectComponent}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DateRangeSelect;