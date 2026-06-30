"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { TruncatedText } from "../role-management/components/TruncatedText";
import { useDebounce } from "@/hooks/useDebounce";

interface Role {
  id: string;
  roleName: string;
  role: string;
  userCount: number;
}

interface PaginatedResponse {
  content: Role[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface PaginatedRoleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const PaginatedRoleSelect: React.FC<PaginatedRoleSelectProps> = ({
  value,
  onValueChange,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300); // 300ms debounce
  const [page, setPage] = useState(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRoleName, setSelectedRoleName] = useState<string>("");

  const fetchRoles = useCallback(async (currentPage: number, searchTerm: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: "5",
      });
      
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const response = await fetch(
        `/api/granular-permissions/available-roles?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      const data: PaginatedResponse = await response.json();
      console.log("Fetched roles response:", {
        requestPage: currentPage,
        responsePage: data.page,
        search: searchTerm,
        content: data.content.length,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious,
        roleNames: data.content.map(r => r.roleName)
      });
      setRoles(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setHasNext(data.hasNext);
      setHasPrevious(data.hasPrevious);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch roles when open, page, or debouncedSearch changes
  useEffect(() => {
    if (open) {
      fetchRoles(page, debouncedSearch);
    }
  }, [open, page, debouncedSearch, fetchRoles]);

  // Reset page to 0 when search changes (debounced)
  useEffect(() => {
    if (open && page !== 0 && debouncedSearch) {
      console.log("Resetting page to 0 due to search change");
      setPage(0);
    }
  }, [debouncedSearch, open, page]);

  // Reset state when dropdown opens
  const handleOpenChange = (newOpen: boolean) => {
    console.log("Dropdown open state changing:", newOpen);
    setOpen(newOpen);
    if (newOpen) {
      console.log("Resetting to initial state");
      setPage(0);
      setSearch("");
    }
  };

  // Fetch selected role name when value changes
  useEffect(() => {
    const fetchSelectedRole = async () => {
      if (!value) {
        setSelectedRoleName("");
        return;
      }
      
      // First check if the role is in current page
      const currentRole = roles.find(r => r.id === value);
      if (currentRole) {
        setSelectedRoleName(currentRole.roleName);
        return;
      }
      
      // If not found in current page, fetch all roles to find it
      try {
        const response = await fetch(
          `/api/granular-permissions/available-roles?page=0&size=1000`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data: PaginatedResponse = await response.json();
          const selected = data.content.find(r => r.id === value);
          if (selected) {
            setSelectedRoleName(selected.roleName);
          }
        }
      } catch (error) {
        console.error("Error fetching selected role:", error);
      }
    };

    fetchSelectedRole();
  }, [value, roles]);

  const handleNextPage = () => {
    console.log("Next page clicked, current page:", page, "hasNext:", hasNext);
    if (hasNext) {
      setPage(prev => {
        console.log("Setting page from", prev, "to", prev + 1);
        return prev + 1;
      });
    }
  };

  const handlePreviousPage = () => {
    console.log("Previous page clicked, current page:", page, "hasPrevious:", hasPrevious);
    if (hasPrevious) {
      setPage(prev => {
        console.log("Setting page from", prev, "to", prev - 1);
        return prev - 1;
      });
    }
  };

  return (
    <Select value={value} onValueChange={onValueChange} open={open} onOpenChange={handleOpenChange}>
      <SelectTrigger className="w-full">
        <SelectValue>
          {selectedRoleName ? (
            <TruncatedText text={selectedRoleName} maxLength={30} />
          ) : (
            "Select a role"
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="p-2 space-y-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>

          {/* Loading State with Skeletons */}
          {loading && (
            <div className="space-y-1">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-2 p-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {/* Roles List */}
          {!loading && roles.length > 0 && (
            <div className="space-y-1">
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  <div className="flex items-center space-x-2 w-full">
                    <TruncatedText text={role.roleName} maxLength={50} />
                    <Badge variant="secondary" className="text-xs">
                      {role.userCount} users
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && roles.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No roles found
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages} ({totalElements} total)
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviousPage();
                  }}
                  disabled={!hasPrevious}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPage();
                  }}
                  disabled={!hasNext}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
};
