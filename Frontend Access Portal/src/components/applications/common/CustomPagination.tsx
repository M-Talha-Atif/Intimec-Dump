"use client";
import { useCallback, useMemo, useRef } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const DOTS = "...";
function getPaginationArray(
  totalPageCount: number,
  currentPage: number,
  siblingCount = 1,
  boundaryCount = 1,
) {
  const totalPageNumbers = siblingCount * 2 + 3 + boundaryCount * 2;

  if (totalPageNumbers >= totalPageCount) {
    return Array.from({ length: totalPageCount }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(
    currentPage - siblingCount,
    boundaryCount + 2,
  );
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPageCount - boundaryCount - 1,
  );

  const showLeftDots = leftSiblingIndex > boundaryCount + 2;
  const showRightDots = rightSiblingIndex < totalPageCount - boundaryCount - 1;

  const leftRange = Array.from({ length: boundaryCount }, (_, i) => i + 1);
  const rightRange = Array.from(
    { length: boundaryCount },
    (_, i) => totalPageCount - boundaryCount + 1 + i,
  );

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i,
  );

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, DOTS, ...rightRange];
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const start = totalPageCount - rightItemCount + 1;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => start + i,
    );
    return [...leftRange, DOTS, ...rightRange];
  }

  return [...leftRange, DOTS, ...middleRange, DOTS, ...rightRange];
}

interface CustomPaginationProps {
  totalElements?: number;
  totalPages?: number;
  siblingCount?: number;
  boundaryCount?: number;
  defaultSize?: number;

  // New props for callback-driven mode
  useCallbackMode?: boolean;
  onPageChange?: (page: number) => void;
  onSizeChange?: (size: number) => void;

  // Controlled values if using callbacks
  page?: number;
  size?: number;
}

const resultsPerPageOptions = [10, 25, 50, 200];

export default function CustomPagination({
  totalElements = 0,
  totalPages = 0,
  siblingCount = 1,
  boundaryCount = 1,
  defaultSize = 25,
  useCallbackMode = false,
  onPageChange,
  onSizeChange,
  page: controlledPage,
  size: controlledSize,
}: CustomPaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pagesInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("pagination");

  const page = useCallbackMode
    ? (controlledPage ?? 0)
    : Number(searchParams.get("page")) || 0;

  const size = useCallbackMode
    ? (controlledSize ?? defaultSize)
    : Number(searchParams.get("size")) || defaultSize;

  const normalizedPage = Math.min(Math.max(page + 1, 1), totalPages);

  const searchParamsWithoutPage = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    return params;
  }, [searchParams]);

  const paginationRange = getPaginationArray(
    totalPages,
    normalizedPage,
    siblingCount,
    boundaryCount,
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      setPageFromInput();
    }
  }

  const setPageFromInput = useCallback(() => {
    const input = pagesInputRef.current;
    if (!input) return;

    const raw = input.value;
    const num = Number(raw);
    if (!raw || isNaN(num)) return;

    const page = Math.min(Math.max(num, 1), totalPages);
    input.value = page.toString();
    if (useCallbackMode) {
      onPageChange?.(page - 1);
      return;
    }

    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("page", (page - 1).toString());
    // Update the URL with the new page
    router.push(`?${currentParams.toString()}`);
  }, [searchParams, router, totalPages, useCallbackMode, onPageChange]);

  const onResultsPerPageChange = useCallback(
    (newSize: number) => {
      if (useCallbackMode) {
        onSizeChange?.(newSize);
        onPageChange?.(0); // reset to first page
        return;
      }
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set("size", newSize.toString());
      currentParams.set("page", "0"); // Reset to first page when changing size
      // Update the URL with the new size
      router.push(`?${currentParams.toString()}`);
    },
    [searchParams, router, useCallbackMode, onSizeChange, onPageChange],
  );

  const startItem = page * size + 1;
  const endItem = Math.min(startItem + size - 1, totalElements ?? 0);

  return (
    <div className="flex flex-row flex-wrap gap-2 items-center py-2 px-4 bg-background border-t">
      <DropdownMenu>
        <div className="flex items-center gap-4 justify-between">
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="justify-self-start">
              {t("items-per-page", { count: size })}
            </Button>
          </DropdownMenuTrigger>
          {totalElements !== undefined && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{startItem}</span> &#8211;{" "}
              <span className="font-medium">{endItem}</span> of{" "}
              <span className="font-medium">{totalElements}</span>
            </div>
          )}
        </div>
        <DropdownMenuContent align="end">
          {resultsPerPageOptions.map((option) => {
            return (
              <DropdownMenuItem
                key={option}
                onClick={() => {
                  onResultsPerPageChange(Number(option));
                }}
              >
                {option}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Pagination className="justify-self-center w-fit">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className="gap-1 flex items-center"
              label={t("previous")}
              href={
                !useCallbackMode
                  ? `?${searchParamsWithoutPage.toString()}&page=${
                      normalizedPage > 1 ? normalizedPage - 2 : 0
                    }`
                  : "#"
              }
              onClick={(e) => {
                if (useCallbackMode) {
                  e.preventDefault();
                  onPageChange?.(Math.max(normalizedPage - 2, 0));
                }
              }}
            />
          </PaginationItem>

          {paginationRange.map((pageItem, idx) => {
            if (pageItem === DOTS) {
              return (
                <PaginationItem key={`dots-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={pageItem}>
                <PaginationLink
                  isActive={pageItem === normalizedPage}
                  href={
                    !useCallbackMode
                      ? `?${searchParamsWithoutPage.toString()}&page=${
                          Number(pageItem) - 1
                        }`
                      : "#"
                  }
                  onClick={(e) => {
                    if (useCallbackMode) {
                      e.preventDefault();
                      onPageChange?.(Number(pageItem) - 1);
                    }
                  }}
                >
                  {pageItem}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              className="gap-1 flex items-center"
              label={t("next")}
              href={
                !useCallbackMode
                  ? `?${searchParamsWithoutPage.toString()}&page=${
                      normalizedPage < totalPages
                        ? normalizedPage
                        : totalPages - 1
                    }`
                  : "#"
              }
              onClick={(e) => {
                if (useCallbackMode) {
                  e.preventDefault();
                  onPageChange?.(
                    normalizedPage < totalPages
                      ? normalizedPage
                      : totalPages - 1,
                  );
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className=" flex items-center justify-end gap-2">
        <Input
          id="page"
          type="number"
          defaultValue={normalizedPage}
          ref={pagesInputRef}
          onKeyDown={handleKeyDown}
          className="w-20"
          min={1}
          max={totalPages}
        />
        <Button variant="outline" onClick={setPageFromInput}>
          {t("goto-page")}
        </Button>
      </div>
    </div>
  );
}
