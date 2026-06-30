import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import React, { useMemo, useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FetchedConnectorObject } from "@/hooks/applications/add-application/useConnectorObjectSchema";

interface AddAttributeComboboxProps
  extends Omit<React.ComponentProps<typeof Button>, "onSelect"> {
  attributes: FetchedConnectorObject["attributes"];
  onSelect: (selected: FetchedConnectorObject["attributes"][number]) => void;
}

export default function AddAttributeCombobox({
  attributes: unsortedAttributes,
  onSelect,
  children,
  ...props
}: AddAttributeComboboxProps) {
  const [open, setOpen] = useState(false);
  const attributesMap = useMemo(
    () => new Map(unsortedAttributes.map((attr) => [attr.name, attr])),
    [unsortedAttributes]
  );

  const attributes = useMemo(() => {
    return [...unsortedAttributes].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }, [unsortedAttributes]);

  function handleSelect(
    value: FetchedConnectorObject["attributes"][number]["name"]
  ) {
    const attr = attributesMap.get(value);
    if (attr) onSelect(attr);
  }
  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button role="combobox" {...props}>
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={4}
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder="Search for attribute" />
          <CommandList className="overflow-hidden">
            <ScrollArea className="w-full h-75">
              <CommandEmpty>No attributes found</CommandEmpty>
              <CommandGroup>
                {attributes?.map((option) => (
                  <CommandItem
                    key={option.name}
                    value={option.name}
                    onSelect={(value) => {
                      handleSelect(value);
                      setOpen(false);
                    }}
                  >
                    {option.name}
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
