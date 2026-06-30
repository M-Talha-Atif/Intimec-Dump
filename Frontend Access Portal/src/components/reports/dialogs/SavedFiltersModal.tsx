import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, Trash2, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SavedFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply?: (filterId: string) => void;
}

export const SavedFiltersModal = ({ open, onOpenChange, onApply }: SavedFiltersModalProps) => {
  const { toast } = useToast();
  const savedFilters = JSON.parse(localStorage.getItem('filter_presets') || '[]');

  const handleApply = (filterId: string) => {
    onApply?.(filterId);
    toast({ title: "Filter Applied" });
    onOpenChange(false);
  };

  const handleDelete = (filterId: string) => {
    const updated = savedFilters.filter((f: any) => f.id !== filterId);
    localStorage.setItem('filter_presets', JSON.stringify(updated));
    toast({ title: "Filter Deleted" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Saved Filters</span>
            <Badge variant="secondary">{savedFilters.length}</Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {savedFilters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No saved filters yet
            </div>
          ) : (
            <div className="space-y-2">
              {savedFilters.map((filter: any) => (
                <div key={filter.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted">
                  <div className="flex-1">
                    <h4 className="font-medium">{filter.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {filter.filters?.conditions?.length || 0} conditions
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleApply(filter.id)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Apply
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(filter.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
