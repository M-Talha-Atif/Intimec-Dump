import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Database, Type } from 'lucide-react';
import { reportService, Field } from '@/services/reportService';
import { ScrollArea } from "@/components/ui/scroll-area";

interface CustomFieldSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataSource: string;
  selectedFields: string[];
  onSave?: (fields: string[]) => void;
}

export const CustomFieldSelectorModal = ({
  open,
  onOpenChange,
  dataSource,
  selectedFields,
  onSave
}: CustomFieldSelectorModalProps) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [selected, setSelected] = useState<string[]>(selectedFields);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open && dataSource) {
      loadFields();
    }
  }, [open, dataSource]);

  const loadFields = async () => {
    const availableFields = await reportService.getAvailableFields(dataSource);
    setFields(availableFields);
  };

  const handleToggle = (fieldName: string) => {
    setSelected(prev =>
      prev.includes(fieldName)
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  };

  const handleSave = () => {
    onSave?.(selected);
    onOpenChange(false);
  };

  const filteredFields = fields.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.description?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedFields = filteredFields.reduce((acc, field) => {
    const category = field.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(field);
    return acc;
  }, {} as Record<string, Field[]>);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'string': return <Type className="h-3 w-3" />;
      case 'number': return <span className="text-xs">#</span>;
      case 'date': return <span className="text-xs">📅</span>;
      case 'boolean': return <span className="text-xs">✓</span>;
      default: return <Type className="h-3 w-3" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Select Fields</span>
            <Badge variant="secondary">{selected.length} selected</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search fields..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {Object.entries(groupedFields).map(([category, categoryFields]) => (
              <div key={category} className="mb-4">
                <h4 className="font-semibold text-sm mb-2">{category}</h4>
                <div className="space-y-2">
                  {categoryFields.map((field) => (
                    <div
                      key={field.name}
                      className="flex items-start space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                      onClick={() => handleToggle(field.name)}
                    >
                      <Checkbox
                        checked={selected.includes(field.name)}
                        onCheckedChange={() => handleToggle(field.name)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{field.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {getTypeIcon(field.type)}
                            <span className="ml-1">{field.type}</span>
                          </Badge>
                        </div>
                        {field.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {field.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={selected.length === 0}>
            Apply Selection ({selected.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
