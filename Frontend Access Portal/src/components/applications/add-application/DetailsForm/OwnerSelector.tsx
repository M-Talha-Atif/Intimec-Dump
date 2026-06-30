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
import useOwnerOptions from "@/hooks/applications/add-application/useOwnerOptions";
import clsx from "clsx";
import { useMemo, useState } from "react";
import CustomBadge from "@/components/applications/common/CustomBadge";
import {
  riskBadgeMap,
  userStatusBadgeMap,
} from "@/components/applications/common/badgeMap";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Search,
  User as UserIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import ShowAfterDelay from "../common/Delay";

const identityTypeLabels = {
  employee: "Employee",
  "non-employee": "Non-Employee",
  "non-human": "Non-Human",
};

const PAGE_SIZE = 20;

export default function OwnerSelector({
  value,
  onChange,
  title = "Select Owner",
  description = "Choose an owner from the list.",
  buttonText = "Choose an owner",
}: {
  value:
    | {
        id: string;
        name: string;
        kind: "identity" | "group";
      }[];
  onChange: (
    value:
      | {
          id: string;
          name: string;
          kind: "identity" | "group";
        }[]
  ) => void;
  title?: string;
  description?: string;
  buttonText?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [identityType, setIdentityType] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(0);
  const { data, pagination, isLoading, error, refresh } = useOwnerOptions({
    page,
    size: PAGE_SIZE,
    search: debouncedSearchTerm,
    identityType,
  });

  const [selectedOwners, setSelectedOwners] = useState<typeof data | undefined>(
    undefined
  );

  const selectedOwnerIdsSet = useMemo(
    () => new Set(selectedOwners?.map((owner) => owner.id)),
    [selectedOwners]
  );

  const fieldValueIds = useMemo(
    () => new Set(value.map((val) => val.id)),
    [value]
  );

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const aSelected = fieldValueIds.has(a.id) ? 1 : 0;
      const bSelected = fieldValueIds.has(b.id) ? 1 : 0;
      return bSelected - aSelected || a.name.localeCompare(b.name);
    });
  }, [data, fieldValueIds]);

  function toggleOwner(value: NonNullable<typeof data>[number]) {
    setSelectedOwners((prev) => {
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
          setSelectedOwners(
            data?.filter((owner) => value.some((v) => v.id === owner.id))
          );
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <p className="truncate">
            {value.map((owner) => owner.name).join(", ") || buttonText}
          </p>
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[80vh] sm:max-w-200 flex flex-col overflow-hidden will-change-auto">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="flex flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute w-4 h-4 -translate-y-1/2 text-muted-foreground left-3 top-1/2" />
            <Input
              placeholder="Search by name or department..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={identityType} onValueChange={setIdentityType}>
            <SelectTrigger className="w-50">
              <SelectValue placeholder="Select an Identity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Identity Type</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="non-employee">Non-Employee</SelectItem>
                <SelectItem value="identity-groups">Identity Groups</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {isLoading && <div className="flex-1 min-h-0"><LoaderFallback /></div>}
        {error && !isLoading && (
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>Failed to load details form</CardDescription>
              </CardHeader>
              <CardContent className="text-wrap">
                <CardDescription className="text-destructive">
                  {error?.message || "An unexpected error occurred."}
                </CardDescription>
              </CardContent>
              <CardContent>
                <CardDescription>Please try again later.</CardDescription>
                <Button
                  className="mt-2"
                  onClick={(e) => {
                    e.preventDefault();
                    refresh();
                  }}
                  variant="outline"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        {data && data.length === 0 && !isLoading && (
          <div className="flex items-center justify-center flex-1 min-h-0 text-muted-foreground">
            <p>No users found.</p>
          </div>
        )}
        {data && data.length > 0 && !isLoading && (
          <ShowAfterDelay fallback={<LoaderFallback />}>
            <ScrollArea className="flex-1 min-h-0 rounded-md border">
              {sortedData.map((owner) => (
                <div
                  key={owner.id}
                  onClick={() => toggleOwner(owner)}
                  className="flex flex-row items-center border-b cursor-pointer select-none hover:bg-accent"
                >
                  <div
                    className={clsx(
                      "flex flex-col gap-2 flex-1 p-4",
                      selectedOwnerIdsSet.has(owner.id) &&
                        "border-l-4 border-l-primary"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl">{owner.name}</h1>
                      {owner.kind === "identity" ? (
                        <>
                          <Badge>
                            {identityTypeLabels[owner.identityType] ||
                              "Unknown"}
                          </Badge>
                          <CustomBadge
                            color={
                              userStatusBadgeMap[owner.status || "Unknown"]
                            }
                          >
                            {owner.status}
                          </CustomBadge>
                        </>
                      ) : (
                        <>
                          <Badge
                            variant="outline"
                            className="flex items-center justify-center h-5 px-1 font-mono text-center rounded-full min-w-5"
                          >
                            {owner.memberCount}
                          </Badge>
                          <Badge
                            variant={
                              owner.type === "static" ? "secondary" : "default"
                            }
                          >
                            {owner.type}
                          </Badge>
                          <CustomBadge
                            color={riskBadgeMap[owner.riskLevel || "Unknown"]}
                          >
                            {owner.riskLevel}
                          </CustomBadge>
                        </>
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      {owner.kind === "identity"
                        ? owner.department
                        : owner.description}
                    </div>
                  </div>
                  {selectedOwnerIdsSet.has(owner.id) && (
                    <UserIcon className="mr-4 text-primary" />
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
                    if (selectedOwners) {
                      onChange(selectedOwners);
                    }
                  }}
                >
                  Confirm{" "}
                  <Badge
                    variant="secondary"
                    className="flex items-center justify-center h-5 px-1 font-mono text-white rounded-full text-md min-w-5 bg-black/50 dark:bg-white/50 dark:text-black"
                  >
                    <p>{selectedOwners ? selectedOwners.length : 0}</p>
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
