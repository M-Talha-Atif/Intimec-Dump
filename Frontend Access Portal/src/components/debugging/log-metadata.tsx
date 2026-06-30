import { shortDate } from "@/utils/dateFormat";
import { Button } from "../ui/button";
import { useDebugging } from "@/contexts/debugging-context";

interface LogMetadataProps {
  log: {
    timestamp: string;
    source: string;
    category: string;
    correlationId?: string;
  };
}

export function LogMetadata({ log }: LogMetadataProps) {
  console.log("LogMetadata log:", log);
  const { setSearchQuery, searchQuery } = useDebugging();

  const isCorrelationIdSearched = Boolean(
    log.correlationId &&
      log.correlationId !== "N/A" &&
      searchQuery === log.correlationId
  );

  const isCorrelationIdValid = Boolean(
    log.correlationId &&
      log.correlationId !== "N/A" &&
      log.correlationId.trim() !== ""
  );

  const handleSearchCorrelation = () => {
    console.log("Searching for correlation ID:", log.correlationId);
    if (isCorrelationIdValid && log.correlationId) {
      // Use the debugging context to set the search query directly
      setSearchQuery(log.correlationId);
    }
  };
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">Metadata</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Timestamp:</span>
          <p className="font-mono">{shortDate(Number(log.timestamp))}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Source:</span>
          <p>{log.source}</p>
        </div>
        <div>
          {log.category && (
            <>
              <span className="text-muted-foreground">Category:</span>
              <p className="capitalize">{log.category}</p>
            </>
          )}
        </div>
        {log.correlationId && log.correlationId !== "N/A" && (
          <div>
            <span className="text-muted-foreground">Correlation ID:</span>
            <p className="font-mono">{log.correlationId}</p>
          </div>
        )}
        <div className="">
          {isCorrelationIdValid && (
            <Button
              onClick={handleSearchCorrelation}
              variant="default"
              size="sm"
              disabled={!isCorrelationIdValid || isCorrelationIdSearched}
            >
              {isCorrelationIdSearched
                ? "Currently Viewing"
                : "View Related Logs"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
