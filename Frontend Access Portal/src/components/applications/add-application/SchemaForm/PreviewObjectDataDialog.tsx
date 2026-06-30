import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  TableIcon,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import useConnectorObjectPreview from "@/hooks/applications/add-application/useConnectorObjectSchemaPreview";
import PreviewTable from "./PreviewTable";
import ShowAfterDelay from "@/components/applications/add-application/common/Delay";
import LoadErrorCard from "@/components/applications/add-application/common/LoadErrorCard";
import { SearchInput } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { SortingState } from "@/types/shared";

interface PreviewObjectDataDialogProps
  extends React.ComponentProps<typeof Button> {
  attributes: string[];
  name: string;
  children: React.ReactNode;
  displayName: string;
}
export default function PreviewObjectDataDialog({
  attributes,
  name,
  children,
  displayName,
  ...props
}: PreviewObjectDataDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { finalFormData } = useAddApplicationContext();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [sortConfig, setSortConfig] = useState<SortingState | null>(null);

  function handleSort(column: string) {
    setSortConfig((prev) =>
      prev?.sortBy === column
        ? {
            sortBy: column,
            direction: prev.direction === "asc" ? "desc" : "asc",
          }
        : { sortBy: column, direction: "asc" }
    );
  }
  const {
    isLoading: loadingPreviewData,
    data,
    error,
    refresh,
    pagination,
  } = useConnectorObjectPreview({
    connectorId: finalFormData?.details?.connectorId,
    objectName: name,
    pagination: {
      page,
      size: pageSize,
    },
    search: debouncedSearchTerm,
    sort: sortConfig,
    dataArgs: {
      attributesToInclude: attributes.map((attr) => attr),
      configuration: finalFormData.connector ?? {},
    },
    options: {
      onSuccess: () => {
        setSelected((prev) => {
          const newSet = new Set(
            [...prev].filter((val) => attributes.some((attr) => attr === val))
          );
          if (newSet.size === 0) {
            return new Set(attributes.slice(0, 4).map((attr) => attr));
          }
          return newSet;
        });
      },
    },
  });

  const toggle = (value: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(value);
      else next.delete(value);
      return next;
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button {...props}>{children}</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[90svw] max-h-[90svh] flex flex-col"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="h-fit">
          <DialogTitle>Preview {displayName}</DialogTitle>
          <DialogDescription>
            This is a preview of the object data with attributes selected.
          </DialogDescription>
        </DialogHeader>
        {!loadingPreviewData && error && (
          <LoadErrorCard
            refresh={refresh}
            errorMessage={error.message || "An unexpected error occurred."}
            errorTitle="Failed to load preview data"
          />
        )}

        <div className="flex flex-col flex-1 gap-2 overflow-hidden">
          <div className="flex flex-row justify-between items-center gap-2 p-1">
            <SearchInput
              placeholder="Search..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="self-end text-left w-60">
                  <span className="w-full">
                    Columns{" "}
                    <Badge
                      variant="secondary"
                      className="h-5 px-1 font-mono rounded-full min-w-5 tabular-nums"
                    >
                      {selected.size}
                    </Badge>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
              >
                <DropdownMenuLabel>Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {attributes.map((attr) => (
                  <DropdownMenuCheckboxItem
                    key={attr}
                    checked={selected.has(attr)}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(checked) => toggle(attr, checked)}
                  >
                    {attr}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {selected.size === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="p-4 mb-4 rounded-full bg-muted">
                <TableIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No Columns Selected</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Please select columns to preview data.
              </p>
            </div>
          ) : (
            // Delayed is used to delegate table rendering
            // for after dialog is rendered
            <ShowAfterDelay fallback={<LoaderFallback />}>
              <PreviewTable
                selectedHeaders={Array.from(selected)}
                data={data}
                sortConfig={sortConfig}
                handleSort={handleSort}
                loadingPreviewData={loadingPreviewData}
                rowsCount={pageSize}
              />
            </ShowAfterDelay>
          )}
          <div className="flex items-center justify-between py-2">
            <div className="text-sm text-muted-foreground">
              Page {page + 1}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!pagination?.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          {/* <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant="outline"
              disabled={page <= 0}
              onClick={() => setPage((page) => page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              disabled={
                pagination?.totalPages
                  ? page + 1 >= pagination.totalPages
                  : false
              }
              onClick={() => setPage((page) => page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{PAGE_SIZE * page + 1}</span>{" "}
              &#8211;{" "}
              <span className="font-medium">
                {Math.min(
                  PAGE_SIZE * (page + 1),
                  pagination?.totalElements || 0
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium">{pagination?.totalElements}</span>
            </div>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const LoaderFallback = () => (
  <div className="flex items-center justify-center w-full h-full text-center">
    <LoaderCircle className="w-12 h-12 mr-2 animate-spin text-muted-foreground" />
  </div>
);
