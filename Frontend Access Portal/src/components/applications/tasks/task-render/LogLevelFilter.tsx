import { levelConfig, LogLevelBadge } from "./LogViewer";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { TaskLog } from "@/types/task";

export default function LogLevelFilter({
  logLevels,
  onChange,
}: {
  logLevels: TaskLog["level"][];
  onChange: React.Dispatch<React.SetStateAction<TaskLog["level"][]>>;
}) {
  const t = useTranslations("ApplicationsPage.Import.ImportRender.LogLevelFilter");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {t("buttonLabel")}
          <Separator orientation="vertical" className="mx-2 h-4" />
          {logLevels.length === 0
            ? t("none")
            : logLevels
                .sort((a, b) => a.localeCompare(b))
                .map((level) => (
                  <LogLevelBadge
                    key={level}
                    className="h-4"
                    level={level as keyof typeof levelConfig}
                  />
                ))}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-1 w-48">
        <Command>
          <CommandList>
            <CommandGroup>
              {levelConfig &&
                Object.keys(levelConfig).map((level) => (
                  <CommandItem
                    key={level}
                    value={level}
                    onSelect={(value) => {
                      if (logLevels.includes(value as TaskLog["level"])) {
                        onChange((prev) =>
                          [...prev].filter((l) => l !== value)
                        );
                      } else {
                        onChange((prev) => [
                          ...prev,
                          value as TaskLog["level"],
                        ]);
                      }
                    }}
                  >
                    <LogLevelBadge
                      className="h-4"
                      level={level as keyof typeof levelConfig}
                    />
                    <Check
                      className={cn(
                        "ml-auto",
                        logLevels.includes(level as TaskLog["level"])
                          ? "opacity-100"
                          : "opacity-0"
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
