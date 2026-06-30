import { useState, useEffect } from 'react';
import { Search, X, History, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { searchOrganization, getRecentSearches, saveSearchToHistory, clearSearchHistory } from '@/utils/orgSearch';
import { OrgNodeData } from '@/types/organization';

interface OrgSearchBarProps {
  tree: OrgNodeData;
  onSelectNode: (nodeId: string) => void;
  className?: string;
}

export function OrgSearchBar({ tree, onSelectNode, className }: OrgSearchBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof searchOrganization>>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      const searchResults = searchOrganization(tree, query, {
        fuzzy: true,
        maxResults: 10,
      });
      setResults(searchResults);
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
  }, [query, tree]);

  const handleSelect = (nodeId: string, searchQuery: string) => {
    onSelectNode(nodeId);
    saveSearchToHistory(searchQuery);
    setRecentSearches(getRecentSearches());
    setQuery('');
    setOpen(false);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setRecentSearches([]);
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations by name, head, location, cost center..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setQuery('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-0" align="start">
          <Command>
            <CommandList>
              {results.length === 0 && query.length > 1 && (
                <CommandEmpty>No organizations found.</CommandEmpty>
              )}

              {results.length > 0 && (
                <CommandGroup heading="Search Results">
                  {results.map((result) => (
                    <CommandItem
                      key={result.node.id}
                      onSelect={() => handleSelect(result.node.id, query)}
                      className="flex items-start gap-3 py-3"
                    >
                      <TrendingUp className="w-4 h-4 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{result.node.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.path.join(' > ')}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {result.node.type}
                          </Badge>
                          {result.node.riskLevel && (
                            <Badge
                              variant={
                                result.node.riskLevel === 'High'
                                  ? 'destructive'
                                  : result.node.riskLevel === 'Medium'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {result.node.riskLevel} Risk
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {result.matchedFields.join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex-shrink-0">
                        Score: {result.score.toFixed(1)}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {recentSearches.length > 0 && query.length === 0 && (
                <CommandGroup heading="Recent Searches">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-xs text-muted-foreground">Recent</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearHistory}
                      className="h-6 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                  {recentSearches.map((search, idx) => (
                    <CommandItem key={idx} onSelect={() => setQuery(search)} className="py-2">
                      <History className="w-4 h-4 mr-2" />
                      {search}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
