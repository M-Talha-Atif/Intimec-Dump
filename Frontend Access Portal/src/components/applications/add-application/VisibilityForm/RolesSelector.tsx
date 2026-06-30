import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import clsx from "clsx";
import { useMemo, useState } from "react";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import ShowAfterDelay from "../common/Delay";
import useRoleOptions from "@/hooks/applications/add-application/useRoleOptions";
import LoadErrorCard from "../common/LoadErrorCard";
import {
  ApplicationRoleType,
  isApplicationType,
  isBusinessType,
} from "@/types/roles";

const PAGE_SIZE = 20;

const ApplicationRoleTypeToBadgeVariant: Record<
  ApplicationRoleType,
  "default" | "destructive" | "outline" | "secondary"
> = {
  administrator: "destructive",
  viewer: "outline",
  reviewer: "default",
  operator: "secondary",
};

export default function RoleSelector({
  value,
  onChange,
  title = "Select Role",
  description = "Choose a role from the list.",
  buttonText = "Choose a role",
  searchPlaceholder = "Search roles...",
  roleType,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  title?: string;
  description?: string;
  buttonText?: string;
  searchPlaceholder?: string;
  roleType: "application" | "business";
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(0);
  const { data, pagination, isLoading, error, refresh } = useRoleOptions({
    page,
    size: PAGE_SIZE,
    search: debouncedSearchTerm,
    roleType,
  });

  const [selectedItems, setSelectedItems] = useState<typeof data | undefined>(
    value && data ? data.filter((item) => value.includes(item.id)) : []
  );

  const selectedOwnerIdsSet = useMemo(
    () => new Set(selectedItems?.map((owner) => owner.id)),
    [selectedItems]
  );

  const fieldValueIds = useMemo(() => new Set(value), [value]);

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const aSelected = fieldValueIds.has(a.id) ? 1 : 0;
      const bSelected = fieldValueIds.has(b.id) ? 1 : 0;
      return bSelected - aSelected || a.name.localeCompare(b.name);
    });
  }, [data, fieldValueIds]);

  function toggleItem(value: NonNullable<typeof data>[number]) {
    setSelectedItems((prev) => {
      const newData = structuredClone(prev);
      if (!newData) {
        return [value];
      }
      if (selectedOwnerIdsSet.has(value.id)) {
        return newData.filter((owner) => owner.id !== value.id);
      } else {
        return [...newData, value];
      }
    });
  }
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setSelectedItems(data?.filter((item) => fieldValueIds.has(item.id)));
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="flex overflow-hidden">
          <p className="truncate flex-1">
            {data
              ?.filter((item) => selectedOwnerIdsSet.has(item.id))
              .map((item) => item.name)
              .join(", ") || buttonText}
          </p>
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[80vh] sm:max-w-200 flex flex-col overflow-hidden will-change-auto">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="flex flex-row gap-2 relative">
          <Search className="absolute w-4 h-4 -translate-y-1/2 text-muted-foreground left-3 top-1/2" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isLoading && <LoaderFallback />}
        {error && !isLoading && (
          <div className="flex-1">
            <LoadErrorCard
              errorTitle="Failed to load roles"
              errorMessage="There was an error while fetching roles. Please try again."
              refresh={refresh}
            />
          </div>
        )}
        {data && data.length === 0 && !isLoading && (
          <div className="flex items-center justify-center flex-1 text-muted-foreground">
            <p>No users found.</p>
          </div>
        )}
        {data && data.length > 0 && !isLoading && (
          <ShowAfterDelay fallback={<LoaderFallback />}>
            <ScrollArea className="flex h-full rounded-md border-1">
              {sortedData.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item)}
                  className="flex flex-row items-center border-b cursor-pointer select-none hover:bg-accent"
                >
                  <div
                    className={clsx(
                      "flex flex-col gap-2 flex-1 p-4",
                      selectedOwnerIdsSet.has(item.id) &&
                        "border-l-4 border-l-primary"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl">{item.name}</h1>
                      {isApplicationType(item.type) ? (
                        <Badge
                          variant={ApplicationRoleTypeToBadgeVariant[item.type]}
                        >
                          {item.type}
                        </Badge>
                      ) : (
                        isBusinessType(item.type) && (
                          <Badge variant="outline">{item.type}</Badge>
                        )
                      )}

                      <Badge variant="outline">
                        {item.userCount} User{item.userCount !== 1 && "s"}
                      </Badge>
                      {"permissionCount" in item && (
                        <Badge variant="outline">
                          {item.permissionCount} Permissions
                        </Badge>
                      )}
                      {"entitlementCount" in item && (
                        <Badge variant="outline">
                          {item.entitlementCount} Entitlements
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                  {selectedOwnerIdsSet.has(item.id) && (
                    <Briefcase className="mr-4 text-primary" />
                  )}
                </div>
              ))}
            </ScrollArea>
          </ShowAfterDelay>
        )}
        <DialogFooter>
          <div className="flex flex-row justify-between w-full gap-2">
            <div className="flex items-center space-x-2">
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
            </div>
            <div className="space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  onClick={() => {
                    if (selectedItems) {
                      onChange(selectedItems.map((item) => item.id));
                    }
                  }}
                >
                  Confirm{" "}
                  <Badge
                    variant="secondary"
                    className="flex items-center justify-center h-5 px-1 font-mono text-white rounded-full text-md min-w-5 bg-black/50 dark:bg-white/50 dark:text-black"
                  >
                    <p>{selectedItems ? selectedItems.length : 0}</p>
                  </Badge>
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LoaderFallback() {
  return (
    <div className="flex items-center justify-center flex-1">
      <LoaderCircle className="w-12 h-12 animate-spin text-muted-foreground" />
    </div>
  );
}
