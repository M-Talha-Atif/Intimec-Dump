"use client";
import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import RadioBoxPanel from "./RadioBoxPanel";
import CheckboxPanel from "./CheckboxPanel";
import { useRouter, useSearchParams } from "next/navigation"; // Adjust the import path as needed

import type { FilterOptionGroup, NormalizedFilterState } from "@/types/filters"; // Adjust the import path as needed

function calculateFilteredCount(
  normalizedFilter: NormalizedFilterState
): number {
  const output = Object.keys(normalizedFilter).reduce((count, key) => {
    const values = normalizedFilter[key];
    if (!values || values.length === 0) return count;
    // Ignore "all" values
    const nonAllValues = values.filter((v) => v.toLowerCase() !== "all");
    if (nonAllValues.length > 0) {
      count += nonAllValues.length;
    }
    return count;
  }, 0);
  return output;
}

export default function FiltersWithParams({
  filters,
  resetPageOnChange = true, // Optional prop to reset page on filter change
  isLoading = false, // Optional prop to indicate if filters are loading
}: {
  filters: FilterOptionGroup[];
  resetPageOnChange?: boolean; // Optional prop to reset page on filter change
  isLoading?: boolean; // Optional prop to indicate if filters are loading
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentFilters, setCurrentFilters] = useState<NormalizedFilterState>(
    {}
  );

  useEffect(() => {
    const initialFilters: NormalizedFilterState = {};
    for (const filter of filters) {
      if (filter.defaultValue) {
        // If filter has a default value, initialize it with that
        initialFilters[filter.key] = [filter.defaultValue];
      } else {
        // Otherwise, initialize with an empty array
        initialFilters[filter.key] = [];
      }
    }
    for (const [key, value] of searchParams) {
      if (key.startsWith("filter_")) {
        const strippedKey = key.slice(7); // remove "filter_"
        if (!filters.some((f) => f.key === strippedKey)) {
          continue; // Skip if the filter key is not in the provided filters
        }
        const type = filters.find((f) => f.key === strippedKey)?.type;
        if (type === "radio") {
          initialFilters[strippedKey] = [value]; // For radio, only one value
        } else if (type === "checkbox") {
          initialFilters[strippedKey].push(value); // For checkbox, allow multiple values
        }
      }
    }
    setCurrentFilters(initialFilters);
  }, [searchParams, filters]);

  const filteredCount = calculateFilteredCount(currentFilters);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const normalizedFilter: NormalizedFilterState = {};

    filters.forEach((filter) => {
      const values = formData.getAll(filter.key).map((v) => v.toString());
      if (values.length > 0) {
        normalizedFilter[filter.key] = values;
      }
    });

    const currentParams = new URLSearchParams(searchParams.toString());
    Array.from(currentParams.entries()).forEach(([key]) => {
      if (key.startsWith("filter_")) {
        currentParams.delete(key); // Remove existing filter keys
      }
    });
    Object.entries(normalizedFilter).forEach(([key, values]) => {
      if (values.length > 0) {
        values.forEach((value) => {
          currentParams.append(`filter_${key}`, value); // Add new values
        });
      }
    });
    if (resetPageOnChange) {
      currentParams.set("page", "0"); // Reset page if specified
    }
    router.push(`?${currentParams.toString()}`);
  }

  function clearFilters() {
    const currentParams = new URLSearchParams(searchParams.toString());

    // Remove all filter_ keys
    Array.from(currentParams.keys()).forEach((key) => {
      if (key.startsWith("filter_")) {
        currentParams.delete(key);
      }
    });
    router.push(`?${currentParams.toString()}`);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {filteredCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 w-5 flex items-center justify-center text-xs "
            >
              {filteredCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="space-y-0 min-w-80 max-h-96 z-[60] p-0 flex flex-col"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="p-4 border-b">
          <header className="font-medium">Filters</header>
        </div>
        {isLoading && (
          <div className="flex items-center justify-center h-12 p-4">
            <span className="text-sm text-gray-500">Loading filters...</span>
          </div>
        )}
        {!isLoading && (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col h-full"
            key={JSON.stringify(currentFilters)}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-64">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <header className="text-sm mb-2 font-medium">
                    {filter.title}
                  </header>
                  {filter.type === "radio" ? (
                    <RadioBoxPanel
                      filter={filter}
                      defaultValue={currentFilters[filter.key]?.[0] || ""}
                    />
                  ) : (
                    <CheckboxPanel
                      filter={filter}
                      defaultValues={currentFilters[filter.key] || []}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-background border-t p-4">
              <div className="flex justify-start gap-2">
                <Button variant="default" type="submit">
                  Apply Filters
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              </div>
            </div>
          </form>
        )}
      </PopoverContent>
    </Popover>
  );
}
