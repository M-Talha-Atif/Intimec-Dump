import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormControl } from "@/components/ui/form";
import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { DropDownOption } from "@/types/add-application";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from "next/image";

interface FormComboBoxProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, "onSelect"> {
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundText?: string;
  options: DropDownOption[];
  selectedValue: string;
  onSelect: (selected: string) => void;
  className?: string;
  autoSort?: boolean;
}

export default function FormComboBox({
  placeholder = "Select a value",
  searchPlaceholder = "Search...",
  notFoundText = "Option not found.",
  autoSort = true,
  options: unsortedOptions,
  selectedValue,
  onSelect,
  className,
  ...props
}: FormComboBoxProps) {
  const [open, setOpen] = useState(false);
  const options = useMemo(
    () =>
      [...unsortedOptions].sort((a, b) =>
        autoSort ? a.label.localeCompare(b.label) : 0
      ),
    [unsortedOptions, autoSort]
  );
  const buttonData = useMemo(
    () =>
      options.find((option) => option.id === selectedValue) ?? {
        label: placeholder,
        id: "",
      },
    [options, selectedValue, placeholder]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={clsx(
              "flex justify-between w-full font-normal",
              !selectedValue && "text-muted-foreground",
              className
            )}
            {...props}
          >
            <div className="flex-1 overflow-x-auto text-left flex items-center">
              {"iconUrl" in buttonData && (
                <div className="size-6 bg-muted flex items-center justify-center rounded-md mr-2 overflow-hidden">
                  <Image
                    src={buttonData.iconUrl as string}
                    alt={buttonData.label}
                    width={16}
                    height={16}
                    className="size-4 rounded-sm dark:invert"
                  />
                </div>
              )}
              {buttonData.label}
              {"bundle_version" in buttonData && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {buttonData.bundle_version as string}
                </span>
              )}
            </div>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={4}
        className="w-[var(--radix-popover-trigger-width)] p-0"
        portal={false}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="overflow-hidden">
            <ScrollArea className="w-full h-75">
              <CommandEmpty>{notFoundText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    onSelect={(value) => {
                      onSelect(value);
                      setOpen(false);
                    }}
                    keywords={[option.label]}
                  >
                    {"iconUrl" in option && (
                      <div className="size-6 bg-muted flex items-center justify-center rounded-md mr-2 overflow-hidden">
                        <Image
                          src={option.iconUrl as string}
                          alt={option.label}
                          width={16}
                          height={16}
                          className="size-4 rounded-sm dark:invert"
                        />
                      </div>
                    )}
                    <p>{option.label}</p>
                    {"bundle_version" in option && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {option.bundle_version as string}
                      </span>
                    )}
                    <Check
                      className={clsx(
                        "ml-auto text-muted-foreground",
                        option.id === selectedValue
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
