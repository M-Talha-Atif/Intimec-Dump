import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";
import { Check, Hash } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

export default function LinesNumFilter({
  lines,
  onChange,
}: {
  lines: number;
  onChange: (num: number) => void;
}) {
  const t = useTranslations("ApplicationsPage.Import.ImportRender.LinesNumFilter");
  const debouncedOnChange = useMemo(() => debounce(onChange, 300), [onChange]);
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let num = parseInt(value, 10);
    if (!isNaN(num)) {
      if (num <= 0) {
        e.target.value = "0";
        num = 0;
        return;
      }
      if (num > 10000) {
        e.target.value = "50000";
        num = 50000;
      }
      debouncedOnChange(num);
    }
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {t("buttonLabel")}
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Badge variant="secondary" className="h-4">
            {lines}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-1 w-42">
        <Command shouldFilter={false}>
          <CommandInput
            onInput={handleInput}
            icon={<Hash className="size-4 shrink-0 opacity-50" />}
            placeholder={t("placeholder")}
          />
          <CommandList>
            <CommandGroup>
              {[100, 300, 500, 1000, 5000, 10000, 50000].map((num) => (
                <CommandItem
                  key={num}
                  value={num.toString()}
                  onSelect={() => onChange(num)}
                >
                  {num}
                  <Check
                    className={cn(
                      "ml-auto",
                      lines === num ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
