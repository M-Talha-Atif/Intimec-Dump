import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Database, ArrowRight } from 'lucide-react';
import { getNodeSchema, FieldDefinition, NODE_OUTPUT_SCHEMAS } from './node-schemas';

interface FieldPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectField: (fieldPath: string) => void;
  upstreamNodes: Array<{ id: string; type: string; label: string }>;
  currentValue?: string;
}

export const FieldPicker: React.FC<FieldPickerProps> = ({
  open,
  onOpenChange,
  onSelectField,
  upstreamNodes,
  currentValue,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Build available fields from ALL node types (complete catalog)
  const availableFields = useMemo(() => {
    const fields: Array<{
      nodeId: string;
      nodeLabel: string;
      nodeType: string;
      nodeIcon: string;
      field: FieldDefinition;
    }> = [];

    // Show ALL possible fields from all node type schemas
    NODE_OUTPUT_SCHEMAS.forEach(schema => {
      schema.fields.forEach(field => {
        fields.push({
          nodeId: schema.nodeType,
          nodeLabel: schema.displayName,
          nodeType: schema.nodeType,
          nodeIcon: schema.icon,
          field,
        });
      });
    });

    return fields;
  }, []); // No dependencies - catalog is static

  // Filter fields based on search
  const filteredFields = useMemo(() => {
    if (!searchQuery.trim()) return availableFields;

    const query = searchQuery.toLowerCase();
    return availableFields.filter(
      ({ field, nodeLabel }) =>
        field.name.toLowerCase().includes(query) ||
        field.description.toLowerCase().includes(query) ||
        nodeLabel.toLowerCase().includes(query)
    );
  }, [availableFields, searchQuery]);

  // Group fields by node
  const fieldsByNode = useMemo(() => {
    const grouped = new Map<string, typeof filteredFields>();
    
    filteredFields.forEach(fieldData => {
      const key = `${fieldData.nodeId}::${fieldData.nodeLabel}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(fieldData);
    });

    return grouped;
  }, [filteredFields]);

  const handleSelectField = (fieldName: string) => {
    onSelectField(fieldName);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Browse Available Fields
          </DialogTitle>
          <DialogDescription>
            Browse all possible fields from different node types - use them in your conditions
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Current Value */}
        {currentValue && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground border rounded-md p-2 bg-muted/50">
            <span>Current:</span>
            <code className="px-2 py-1 bg-background rounded text-xs">{currentValue}</code>
          </div>
        )}

        {/* Fields List */}
        <ScrollArea className="h-[400px] pr-4">
          {fieldsByNode.size === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Database className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium">No fields found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? 'No fields match your search' : 'No fields available'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(fieldsByNode.entries()).map(([nodeKey, fields]) => {
                const firstField = fields[0];
                return (
                  <div key={nodeKey} className="space-y-3">
                    {/* Node Header */}
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <span className="text-lg">{firstField.nodeIcon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{firstField.nodeLabel}</div>
                        <div className="text-xs text-muted-foreground">{firstField.nodeType}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {fields.length} {fields.length === 1 ? 'field' : 'fields'}
                      </Badge>
                    </div>

                    {/* Fields */}
                    <div className="space-y-2 pl-2">
                      {fields.map(({ field }) => (
                        <button
                          key={field.name}
                          onClick={() => handleSelectField(field.name)}
                          className="w-full flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-colors text-left group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono font-semibold">{field.name}</code>
                              <Badge variant="secondary" className="text-xs">
                                {field.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {field.description}
                            </p>
                            {field.example && (
                              <div className="mt-2 text-xs">
                                <span className="text-muted-foreground">Example: </span>
                                <code className="px-1.5 py-0.5 bg-muted rounded">
                                  {field.example}
                                </code>
                              </div>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0 mt-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer Help */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
          <span className="text-blue-500">ℹ️</span>
          <div>
            <strong>Tip:</strong> Fields are populated from nodes that execute before this condition. 
            For nested fields, use dot notation like <code className="px-1 bg-background rounded">user.email</code> or <code className="px-1 bg-background rounded">response.data.id</code>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
