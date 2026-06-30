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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import clsx from "clsx";
import { useMemo, useState, useEffect } from "react";
import CustomPagination from "@/components/applications/common/CustomPagination";
import CustomBadge from "@/components/applications/common/CustomBadge";
import { userStatusBadgeMap } from "@/components/applications/common/badgeMap";
import { LoaderCircle, Search, User as UserIcon } from "lucide-react";
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
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { ApiUser } from "@/components/app-permissions/role-management/types";
import ShowAfterDelay from "./Delay";

const identityTypeLabels = {
  employee: "Employee",
  "non-employee": "Non-Employee",
  "non-human": "Non-Human",
};

const PAGE_SIZE = 5;

interface OwnerSelectorProps {
  value: ApiUser[];
  onChange: (value: ApiUser[]) => void;
  data: ApiUser[];
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
  showNamesInButton?: boolean;
  maxNamesInButton?: number;
}

export default function OwnerSelector({
  value,
  onChange,
  data,
  isLoading = false,
  error = null,
  onRefresh,
  title = "Select Owner",
  description = "Choose an owner from the list.",
  buttonText = "Choose an owner",
  showNamesInButton = true,
  maxNamesInButton = 2,
}: OwnerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [identityType, setIdentityType] = useState("all");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(PAGE_SIZE);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Filter data based on search term and identity type
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((user) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        user.displayName.toLowerCase().includes(searchLower) ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower);

      // Identity type filter (currently all users are treated as employees)
      const matchesIdentityType =
        identityType === "all" || identityType === "employee";

      return matchesSearch && matchesIdentityType;
    });
  }, [data, searchTerm, identityType]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = page * size;
    const endIndex = startIndex + size;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, size]);

  const totalFilteredPages = Math.ceil(filteredData.length / size);

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setPage(0); // Reset to first page on search
  };

  const handleIdentityTypeChange = (newIdentityType: string) => {
    setIdentityType(newIdentityType);
    setPage(0); // Reset to first page on filter change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0);
  };

  const [selectedOwners, setSelectedOwners] = useState<ApiUser[]>(value || []);
  
  // Sync internal state with external value prop
  useEffect(() => {
    setSelectedOwners(value || []);
  }, [value]);

  const selectedOwnerIdsSet = useMemo(
    () => new Set(selectedOwners.map((owner) => owner.id)),
    [selectedOwners]
  );

  const fieldValueIds = useMemo(
    () => new Set(value.map((val) => val.id)),
    [value]
  );

  // Use paginated data as-is since backend already sorts owners first
  const sortedData = paginatedData;

  function toggleOwner(user: ApiUser) {
    setSelectedOwners((prev) => {
      if (selectedOwnerIdsSet.has(user.id)) {
        return prev.filter((owner) => owner.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  }

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    const currentIds = new Set(selectedOwners.map(o => o.id));
    const originalIds = new Set(value.map(o => o.id));
    
    if (currentIds.size !== originalIds.size) return true;
    
    for (const id of currentIds) {
      if (!originalIds.has(id)) return true;
    }
    
    return false;
  }, [selectedOwners, value]);

  const handleCancelClick = () => {
    if (hasChanges) {
      setShowDiscardConfirm(true);
    } else {
      setIsDialogOpen(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardConfirm(false);
    setSelectedOwners(value || []);
    setIsDialogOpen(false);
  };

  const handleConfirmSelection = () => {
    onChange(selectedOwners);
    setIsDialogOpen(false);
  };

  const getButtonText = () => {
    if (value.length === 0) return buttonText;

    if (!showNamesInButton) {
      return `${value.length} selected`;
    }

    const names = value.map(
      (owner) =>
        owner.displayName || `${owner.firstName} ${owner.lastName}`.trim()
    );

    if (names.length <= maxNamesInButton) {
      return names.join(", ");
    }

    return `${names.slice(0, maxNamesInButton).join(", ")} +${
      names.length - maxNamesInButton
    } more`;
  };

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open && hasChanges) {
            setShowDiscardConfirm(true);
          } else {
            setIsDialogOpen(open);
            if (!open) {
              setSelectedOwners(value || []);
            }
          }
        }}
      >
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsDialogOpen(true)}
          >
            <p className="truncate">{getButtonText()}</p>
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
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Select value={identityType} onValueChange={handleIdentityTypeChange}>
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
        {isLoading && <LoaderFallback />}
        {error && !isLoading && (
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Error</CardTitle>
                <CardDescription>Failed to load users</CardDescription>
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
                    onRefresh?.();
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
          <div className="flex items-center justify-center flex-1 text-muted-foreground">
            <p>No users found.</p>
          </div>
        )}
        {data && data.length > 0 && !isLoading && (
          <ShowAfterDelay fallback={<LoaderFallback />}>
            <ScrollArea className="flex h-full rounded-md border-1">
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
                      <h1 className="text-xl">
                        {owner.displayName ||
                          `${owner.firstName} ${owner.lastName}`.trim()}
                      </h1>
                      <Badge>{identityTypeLabels["employee"]}</Badge>
                      <CustomBadge
                        color={
                          owner.status === "ACTIVE"
                            ? userStatusBadgeMap["Active"]
                            : userStatusBadgeMap["Inactive"]
                        }
                      >
                        {owner.status}
                      </CustomBadge>
                    </div>
                    <div className="text-muted-foreground">
                      {owner.email || "No email available"}
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
          <div className="flex flex-col w-full gap-2">
            <CustomPagination
              totalElements={filteredData.length}
              totalPages={totalFilteredPages}
              useCallbackMode={true}
              page={page}
              size={size}
              onPageChange={handlePageChange}
              onSizeChange={handleSizeChange}
              siblingCount={1}
              boundaryCount={1}
            />
            <div className="flex flex-row justify-end w-full gap-2">
              <Button 
                variant="outline"
                onClick={handleCancelClick}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSelection}
              >
                Confirm{" "}
                <Badge
                  variant="secondary"
                  className="flex items-center justify-center h-5 px-1 font-mono text-white rounded-full text-md min-w-5 bg-black/50 dark:bg-white/50 dark:text-black"
                >
                  <p>{selectedOwners.length}</p>
                </Badge>
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Discard Changes Confirmation */}
    <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes to the owner selection. Are you sure you want to discard these changes?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowDiscardConfirm(false)}>
            Continue Editing
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDiscardChanges}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Discard Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

function LoaderFallback() {
  return (
    <div className="flex items-center justify-center flex-1">
      <LoaderCircle className="w-12 h-12 animate-spin text-muted-foreground" />
    </div>
  );
}
