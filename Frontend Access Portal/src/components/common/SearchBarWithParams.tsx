"use client";

import { Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface SearchBarWithParamsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  searchPlaceholder: string;
  debouncedSearchDelay?: number;
  resetPageOnChange?: boolean;
  contextSearchQuery?: string; // External search query from context
  onSearchChange?: (query: string) => void; // Callback for external search updates
}

export default function SearchBarWithParams({
  searchPlaceholder = "Search...",
  debouncedSearchDelay = 300,
  resetPageOnChange = true, // Reset page when search changes
  contextSearchQuery,
  onSearchChange,
  className,
  ...props
}: SearchBarWithParamsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    contextSearchQuery || searchParams.get("search") || ""
  );
  const debouncedSearchTerm = useDebounce(searchTerm, debouncedSearchDelay);

  // Sync with external context search query
  useEffect(() => {
    if (contextSearchQuery !== undefined && contextSearchQuery !== searchTerm) {
      setSearchTerm(contextSearchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextSearchQuery]); // Intentionally excluding searchTerm to prevent circular updates

  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString());
    const newSearch = debouncedSearchTerm.trim();
    if (newSearch === currentParams.get("search")) return; // No change in search term

    if (newSearch !== "") {
      currentParams.set("search", newSearch);
      if (resetPageOnChange) currentParams.set("page", "0"); // Reset page when search changes
    } else {
      currentParams.delete("search");
    }
    router.push(`?${currentParams.toString()}`);

    // Also notify external handler if provided
    if (onSearchChange) {
      onSearchChange(newSearch);
    }
  }, [
    debouncedSearchTerm,
    router,
    searchParams,
    resetPageOnChange,
    onSearchChange,
  ]);

  useEffect(() => {
    const urlSearchValue = searchParams.get("search") ?? "";
    // Only update if URL search is different and we don't have a context override
    if (contextSearchQuery === undefined && urlSearchValue !== searchTerm) {
      setSearchTerm(urlSearchValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, contextSearchQuery]); // Intentionally excluding searchTerm to prevent circular updates

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchTerm(value);
  }

  function handleClearSearch() {
    setSearchTerm("");
    if (onSearchChange) {
      onSearchChange("");
    }
  }

  return (
    <div className={clsx("relative", className)} {...props}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={handleSearchChange}
        className="pl-10"
      />
      {searchTerm && (
        <div className="absolute right-0 top-0 bottom-0 aspect-square flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      )}
    </div>
  );
}
