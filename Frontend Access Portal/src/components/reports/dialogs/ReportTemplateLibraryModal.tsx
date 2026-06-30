import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Star } from 'lucide-react';
import { reportTemplateService } from '@/services/reportTemplateService';
import { useToast } from "@/hooks/use-toast";

interface ReportTemplateLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply?: (templateId: string) => void;
}

export const ReportTemplateLibraryModal = ({ open, onOpenChange, onApply }: ReportTemplateLibraryModalProps) => {
  const templates = reportTemplateService.getAllTemplates();
  const { toast } = useToast();

  const handleApply = (templateId: string) => {
    onApply?.(templateId);
    toast({ title: "Template Applied", description: "Report created from template" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Report Template Library</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg hover:bg-muted">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{template.name}</h4>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{template.rating}</span>
                    <span className="text-muted-foreground">({template.usageCount} uses)</span>
                  </div>
                  <Button size="sm" onClick={() => handleApply(template.id)}>
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
