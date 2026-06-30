'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; 
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSearch } from '@/contexts/SearchContext';
import {
  Search,
  Settings,
  Users,
  AppWindow,
  Shield,
  BarChart,
  Workflow,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';

const categoryIcons = {
  Settings: Settings,
  Users: Users,
  Applications: AppWindow,
  Entitlements: Shield,
  Reports: BarChart,
  Workflows: Workflow,
  Actions: Zap,
};

const categoryColors = {
  Settings: 'bg-gray-100 text-gray-700',
  Users: 'bg-blue-100 text-blue-700',
  Applications: 'bg-green-100 text-green-700',
  Entitlements: 'bg-purple-100 text-purple-700',
  Reports: 'bg-orange-100 text-orange-700',
  Workflows: 'bg-pink-100 text-pink-700',
  Actions: 'bg-yellow-100 text-yellow-700',
};

export const GlobalSearchButton = () => {
  const { setIsSearchOpen } = useSearch();

  return (
    <Button
      variant="ghost"
      onClick={() => setIsSearchOpen(true)}
      className="relative w-64 justify-start text-sm text-muted-foreground bg-white/20 hover:bg-white/30 border border-white/30"
    >
      <Search className="mr-2 h-4 w-4" />
      Search anything...
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
};

export const GlobalSearchDialog = () => {
  const router = useRouter(); 
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    performSearch,
    isLoading,
    searchHistory,
    addToHistory
  } = useSearch();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const handleSelect = (result: any) => {
    addToHistory(searchQuery);
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(result.path); 
  };

  const handleHistorySelect = (query: string) => {
    setSearchQuery(query);
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, typeof searchResults>);

  return (
    <CommandDialog
      open={isSearchOpen}
      onOpenChange={setIsSearchOpen}
    >
      <CommandInput
        ref={inputRef}
        placeholder="Search features, settings, users, apps..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        {!searchQuery && searchHistory.length > 0 && (
          <>
            <CommandGroup heading="Recent Searches">
              {searchHistory.slice(0, 5).map((query, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => handleHistorySelect(query)}
                  className="cursor-pointer"
                >
                  <Clock className="mr-2 h-4 w-4 text-gray-400" />
                  {query}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {!searchQuery && (
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => router.push('/identities/human?action=create')}>
              <Users className="mr-2 h-4 w-4" />
              Create New User
            </CommandItem>
            <CommandItem onSelect={() => router.push('/access-review?action=create')}>
              <Workflow className="mr-2 h-4 w-4" />
              Launch Access Review Campaign
            </CommandItem>
            <CommandItem onSelect={() => router.push('/applications?action=onboard')}>
              <AppWindow className="mr-2 h-4 w-4" />
              Onboard New Application
            </CommandItem>
          </CommandGroup>
        )}

        {searchQuery && !isLoading && searchResults.length === 0 && (
          <CommandEmpty>
            <div className="text-center py-8">
              <Search className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search terms</p>
            </div>
          </CommandEmpty>
        )}

        {searchQuery && isLoading && (
          <div className="px-2 py-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-teal mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Searching...</p>
          </div>
        )}

        {Object.entries(groupedResults).map(([category, results]) => {
          const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];

          return (
            <CommandGroup key={category} heading={category}>
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center w-full">
                    <CategoryIcon className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.title}</span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${categoryColors[result.category]}`}
                        >
                          {result.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{result.description}</p>
                    </div>
                    {result.weight > 8 && (
                      <TrendingUp className="h-3 w-3 text-green-500 ml-2" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
};
