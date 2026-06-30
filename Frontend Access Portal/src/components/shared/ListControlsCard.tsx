'use client';

import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search } from 'lucide-react';

export type FilterOption = { label: string; value: string };

export type FilterConfig = {
    key: string;
    placeholder: string;
    tooltip: string;
    options: FilterOption[];
    icon?: React.ReactNode;
};

export type PageSizeOption = 5 | 10 | 20 | 30 | 50;

interface ActiveFilter {
    key: string;
    label: string;
    value: string;
}

interface ListControlsCardProps {
    /** Title shown top-left */
    title: string;
    
    /** "Showing X of Y items" counts */
    totalItems: number;
    displayCount: number;
    itemLabel?: string; // default "items"
    /** Search */
    searchQuery: string;
    onSearchChange: (v: string) => void;
    searchPlaceholder?: string;
    searchTooltip?: string;
    /** Dynamic filter dropdowns */
    filters: FilterConfig[];
    filterValues: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
    /** Items per page */
    pageSize: number;
    pageSizeOptions?: PageSizeOption[];
    onPageSizeChange: (size: number) => void;
    pageSizeLabel?: string;
    /** Optional right-side actions (buttons etc.) */
    actions?: React.ReactNode;
}

export const ListControlsCard: React.FC<ListControlsCardProps> = ({
    title,
    totalItems,
    displayCount,
    itemLabel = 'items',
    searchQuery,
    onSearchChange,
    searchPlaceholder = 'Search...',
    searchTooltip = 'Search items',
    filters,
    filterValues,
    onFilterChange,
    pageSize,
    pageSizeOptions = [10, 20, 30, 50],
    onPageSizeChange,
    pageSizeLabel = 'Per page:',
    actions,
}) => {
    // Build active filters list (excludes 'all' and empty)
    const activeFilters: ActiveFilter[] = [
        ...(searchQuery
            ? [{ key: '__search', label: 'Search', value: `"${searchQuery}"` }]
            : []),
        ...filters
            .filter(f => filterValues[f.key] && filterValues[f.key] !== 'all')
            .map(f => ({
                key: f.key,
                label: f.placeholder,
                value: filterValues[f.key],
            })),
    ];

    const clearAll = () => {
        onSearchChange('');
        filters.forEach(f => onFilterChange(f.key, 'all'));
    };

    return (
        <TooltipProvider>
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    {/* Top row: title + right actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                            {totalItems > 0 && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Showing <span className="font-medium">{displayCount}</span> of{' '}
                                    <span className="font-medium">{totalItems}</span> {itemLabel}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Items per page */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                                            {pageSizeLabel}
                                        </span>
                                        <Select
                                            value={pageSize.toString()}
                                            onValueChange={(v) => onPageSizeChange(Number(v))}
                                        >
                                            <SelectTrigger className="w-[70px] h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent align="end">
                                                {pageSizeOptions.map(size => (
                                                    <SelectItem key={size} value={size.toString()}>
                                                        {size}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>Number of {itemLabel} displayed per page</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Caller-supplied actions (export button, add button, etc.) */}
                            {actions}
                        </div>
                    </div>

                    {/* Filter bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3">
                        {/* Search */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative flex-1 min-w-[240px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={searchPlaceholder}
                                        value={searchQuery}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                        className="pl-9 h-9"
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs">
                                <p>{searchTooltip}</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Dynamic filters */}
                        {filters.map(filter => (
                            <Tooltip key={filter.key}>
                                <TooltipTrigger asChild>
                                    <div className="w-full sm:w-[180px] max-w-[180px] min-w-0">
                                        <Select
                                            value={filterValues[filter.key] ?? "all"}
                                            onValueChange={(v) => onFilterChange(filter.key, v)}
                                        >
                                            <SelectTrigger className="w-full h-9 overflow-hidden">
                                                <div className="flex items-center gap-2 w-full min-w-0">
                                                    {filter.icon}
                                                    <span className="truncate flex-1">
                                                        <SelectValue placeholder={filter.placeholder} />
                                                    </span>
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent align="end" className="max-w-[320px]">
                                                {filter.options.map(opt => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                        className="max-w-[320px]"
                                                    >
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="block truncate max-w-[240px]">
                                                                    {opt.label}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-md break-words">
                                                                {opt.label}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>{filter.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>

                    {/* Active filters summary */}
                    {activeFilters.length > 0 && (
                        <div className="flex items-center gap-2 pt-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">Active filters:</span>
                            {activeFilters.map(af => (
                                <Badge key={af.key} variant="secondary" className="text-xs gap-1">
                                    {af.label}: {af.value}
                                    <button
                                        onClick={() =>
                                            af.key === '__search'
                                                ? onSearchChange('')
                                                : onFilterChange(af.key, 'all')
                                        }
                                        className="ml-1 hover:text-destructive focus:outline-none"
                                        aria-label={`Remove ${af.label} filter`}
                                    >
                                        ×
                                    </button>
                                </Badge>
                            ))}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={clearAll}
                            >
                                Clear all
                            </Button>
                        </div>
                    )}
                </CardHeader>
            </Card>
        </TooltipProvider>
    );
};