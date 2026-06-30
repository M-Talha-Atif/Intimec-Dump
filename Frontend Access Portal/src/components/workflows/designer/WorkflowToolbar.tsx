"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Save, Upload, Play, Download, RotateCcw, MoreVertical,
  Copy, Share, Printer, Undo, Redo, Palette, Wand2
} from 'lucide-react';
import { RichTooltip } from './tooltips/RichTooltip';
import { toolbarTooltips } from './tooltips/tooltipContent';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface WorkflowToolbarProps {
  onSave: () => void;
  onSimulate: () => void;
  onExport: () => void;
  onReset: () => void;
  onGenerateAI?: () => void;
  onImport?: () => void;
  onDuplicate?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onAutoLayout?: () => void;
  templateName?: string;
  templateVersion?: string;
  canUndo?: boolean;
  canRedo?: boolean;
  autoSaveEnabled?: boolean;
  onAutoSaveToggle?: (enabled: boolean) => void;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  onSave,
  onSimulate,
  onExport,
  onReset,
  onGenerateAI,
  onImport,
  onDuplicate,
  onShare,
  onPrint,
  onUndo,
  onRedo,
  onAutoLayout,
  templateName,
  templateVersion,
  canUndo = false,
  canRedo = false,
  autoSaveEnabled,
  onAutoSaveToggle
}) => {
  const { toast } = useToast();

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate();
    } else {
      toast({
        title: "Duplicate Workflow",
        description: "Creating a copy of this workflow...",
      });
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      toast({
        title: "Share Workflow",
        description: "Sharing options will be available soon.",
      });
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleAutoLayout = () => {
    if (onAutoLayout) {
      onAutoLayout();
    } else {
      toast({
        title: "Smart Auto Layout",
        description: "Automatically arranging workflow nodes...",
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-background">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <RichTooltip
            title={toolbarTooltips.save.title}
            description={toolbarTooltips.save.description}
            bestPractice={toolbarTooltips.save.bestPractice}
            keyboardShortcut="Ctrl+S"
            side="bottom"
          >
            <Button onClick={onSave} size="sm" className="hover-scale">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </RichTooltip>

          <RichTooltip
            title={toolbarTooltips.test.title}
            description={toolbarTooltips.test.description}
            example={toolbarTooltips.test.example}
            bestPractice={toolbarTooltips.test.bestPractice}
            side="bottom"
          >
            <Button onClick={onSimulate} size="sm" variant="outline" className="hover-scale">
              <Play className="h-4 w-4 mr-1" />
              Test
            </Button>
          </RichTooltip>
        </div>
        
        <div className="flex items-center gap-1 border-l pl-2 ml-2">
          <RichTooltip
            title={toolbarTooltips.undo.title}
            description={toolbarTooltips.undo.description}
            bestPractice={toolbarTooltips.undo.bestPractice}
            keyboardShortcut="Ctrl+Z"
            side="bottom"
          >
            <Button onClick={onUndo} size="sm" variant="ghost" disabled={!canUndo} className="hover-scale">
              <Undo className="h-4 w-4" />
            </Button>
          </RichTooltip>

          <RichTooltip
            title={toolbarTooltips.redo.title}
            description={toolbarTooltips.redo.description}
            keyboardShortcut="Ctrl+Y"
            side="bottom"
          >
            <Button onClick={onRedo} size="sm" variant="ghost" disabled={!canRedo} className="hover-scale">
              <Redo className="h-4 w-4" />
            </Button>
          </RichTooltip>
        </div>

        <RichTooltip
          title={toolbarTooltips.autoLayout.title}
          description={toolbarTooltips.autoLayout.description}
          bestPractice={toolbarTooltips.autoLayout.bestPractice}
          side="bottom"
        >
          <Button onClick={handleAutoLayout} size="sm" variant="ghost" className="hover-scale">
            <Palette className="h-4 w-4 mr-1" />
            Auto Layout
          </Button>
        </RichTooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </DropdownMenuItem>
            {onImport && (
              <DropdownMenuItem onClick={onImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onReset} className="text-red-600">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Canvas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <KeyboardShortcutsHelp />
      </div>

      <div className="flex items-center gap-4">
        {templateName && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{templateName}</span>
            {templateVersion && (
              <Badge variant="outline" className="ml-2 text-xs">
                v{templateVersion}
              </Badge>
            )}
          </div>
        )}
        
        {/* Auto-save toggle - only show when onAutoSaveToggle is provided */}
        {onAutoSaveToggle && (
          <div className="flex items-center gap-2 border-l pl-4">
            <Label htmlFor="auto-save-toggle" className="text-sm text-gray-700 cursor-pointer">
              Auto-save {autoSaveEnabled ? '(On)' : '(Off)'}
            </Label>
            <Switch
              id="auto-save-toggle"
              checked={autoSaveEnabled}
              onCheckedChange={onAutoSaveToggle}
            />
          </div>
        )}
        
        {onGenerateAI && (
          <RichTooltip
            title="AI Workflow Generator"
            description="Generate complete workflows from natural language descriptions"
            bestPractice="Describe your workflow requirements clearly for best results"
            side="bottom"
          >
            <Button onClick={onGenerateAI} size="sm" variant="default" className="bg-gradient-to-r from-purple-600 to-blue-600 hover-scale">
              <Wand2 className="h-4 w-4 mr-1" />
              AI Generate
            </Button>
          </RichTooltip>
        )}
      </div>
    </div>
  );
};
