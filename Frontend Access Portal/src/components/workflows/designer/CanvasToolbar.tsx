
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, RotateCcw, Save, Upload, Play, 
  Tag, Award, Star, MoreHorizontal 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

interface CanvasToolbarProps {
  onExport: () => void;
  onReset: () => void;
  onSave?: () => void;
  onSimulate?: () => void;
  templateId?: string;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ 
  onExport, 
  onReset, 
  onSave,
  onSimulate,
  templateId 
}) => {
  const [rating, setRating] = useState(0);
  const { toast } = useToast();

  const handleSaveAsDraft = () => {
    toast({
      title: "Saved as Draft",
      description: "Workflow has been saved to your drafts",
    });
  };

  const handleSaveAsTemplate = () => {
    toast({
      title: "Template Created",
      description: "New template has been created from this workflow",
    });
  };

  const handleAttachTags = () => {
    toast({
      title: "Tags Updated",
      description: "Workflow tags have been updated",
    });
  };

  const handleRateTemplate = (stars: number) => {
    setRating(stars);
    toast({
      title: "Rating Submitted",
      description: `You rated this template ${stars} stars`,
    });
  };

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-md p-2">
      <Button size="sm" variant="outline" onClick={onSave}>
        <Save className="h-4 w-4 mr-1" />
        Save
      </Button>
      
      <Button size="sm" variant="outline" onClick={onSimulate}>
        <Play className="h-4 w-4 mr-1" />
        Simulate
      </Button>

      <Button size="sm" variant="outline" onClick={onExport}>
        <Download className="h-4 w-4 mr-1" />
        Export
      </Button>

      <Button size="sm" variant="outline" onClick={onReset}>
        <RotateCcw className="h-4 w-4 mr-1" />
        Reset
      </Button>

      <KeyboardShortcutsHelp />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleSaveAsDraft}>
            <Upload className="h-4 w-4 mr-2" />
            Save as Draft
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSaveAsTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Save as Template
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleAttachTags}>
            <Tag className="h-4 w-4 mr-2" />
            Attach Tags
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Award className="h-4 w-4 mr-2" />
            Set Framework
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {templateId && (
            <>
              <div className="px-2 py-1 text-sm font-medium">Rate Template</div>
              <div className="flex items-center justify-center gap-1 p-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 cursor-pointer ${
                      star <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                    onClick={() => handleRateTemplate(star)}
                  />
                ))}
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
