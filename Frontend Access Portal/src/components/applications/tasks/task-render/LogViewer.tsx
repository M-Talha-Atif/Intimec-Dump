import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TaskLog } from "@/types/task";
import { formatTimestampToLocal } from "@/utils/timestamp-utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslations } from "next-intl";

export const levelConfig: Record<
  TaskLog["level"],
  {
    row: string;
    badge: string;
    labelKey: "ERROR" | "WARNING" | "INFO" | "SUCCESS";
  }
> = {
  ERROR: {
    row: "bg-destructive/10 hover:bg-destructive/20",
    badge: "text-destructive bg-destructive/20",
    labelKey: "ERROR" as const,
  },
  WARN: {
    row: "bg-yellow-500/10 hover:bg-yellow-500/20",
    badge: "text-yellow-500 bg-yellow-500/20",
    labelKey: "WARNING" as const,
  },
  INFO: {
    row: "bg-transparent hover:bg-blue-500/20",
    badge: "text-blue-500 bg-blue-500/20",
    labelKey: "INFO" as const,
  },
};

export default function LogViewer({ logs }: { logs: TaskLog[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const rowVirtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 24, // rough row height in px, tweak as needed
    overscan: 10, // render a few extra rows for smoother scrolling
  });
  const items = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (logs.length === 0) {
        setIsAtBottom(true);
        return;
      }

      const lastLogEl = el.querySelector<HTMLElement>(
        `[data-index="${logs.length - 1}"]`
      );

      if (!lastLogEl) return;

      const threshold = lastLogEl.offsetHeight + 10; // row height threshold
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;

      setIsAtBottom(distanceFromBottom <= threshold);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [logs.length]);

  useEffect(() => {
    if (isAtBottom && logs.length > 0) {
      rowVirtualizer.scrollToIndex(logs.length - 1, {
        align: "end",
      });
    }
  }, [logs, isAtBottom, rowVirtualizer]);

  return (
    <div
      ref={containerRef}
      className="h-132 w-full overflow-y-auto border border-muted rounded-md font-mono text-[0.8125rem] bg-background dark:bg-black"
    >
      <div
        className="w-full relative"
        style={{
          height: rowVirtualizer.getTotalSize(),
        }}
      >
        <div
          className="absolute top-0 left-0 w-full"
          style={{
            transform: `translateY(${items[0]?.start ?? 0}px)`,
          }}
        >
          {items.map((virtualRow) => {
            const log = logs[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                data-index={virtualRow.index}
              >
                <LogEntry log={log} measureCb={rowVirtualizer.measure} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const LogEntry = ({
  log,
  measureCb,
}: {
  log: TaskLog;
  measureCb: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const cfg = levelConfig[log.level];

  const handleOnOpenChange = (open: boolean) => {
    setIsOpen(open);
    requestAnimationFrame(() => measureCb());
  };

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        handleOnOpenChange(!isOpen);
      }}
      className={cn(
        "px-1 py-0.5 flex items-start gap-2 text-left w-full min-h-6",
        cfg.row
      )}
    >
      <div className="flex items-center gap-2 h-5 py-0.5 shrink-0">
        <div
          className={cn(
            "px-1 text-xs w-2 h-4 rounded-full shrink-0",
            cfg.badge
          )}
        />
        <span className="text-muted-foreground shrink-0">
          [{formatTimestampToLocal(log.timestamp)}]
        </span>
        <LogLevelBadge level={log.level} />
      </div>

      <span
        className={cn(
          "flex-1 whitespace-pre-wrap text-left transition-all",
          !isOpen && "truncate overflow-hidden text-ellipsis line-clamp-1"
        )}
      >
        {log.message}
      </span>
    </div>
  );
};

export const LogLevelBadge = ({
  level,
  className,
}: {
  level: TaskLog["level"];
  className?: string;
}) => {
  const t = useTranslations("ApplicationsPage.Import.ImportRender.LogViewer");
  const cfg = levelConfig[level] ?? levelConfig.INFO;
  return (
    <Badge
      className={cn(
        "text-[0.72rem] w-16 h-full flex justify-center",
        cfg.badge,
        className
      )}
    >
      {t(`levels.${cfg.labelKey}`)}
    </Badge>
  );
};
