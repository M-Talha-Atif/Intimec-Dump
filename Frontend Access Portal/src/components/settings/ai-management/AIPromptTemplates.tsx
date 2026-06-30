
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bot, Save, RotateCcw, Copy, Plus, Eye, Code,
  Search, Sparkles, Hash, ChevronRight, History,
  HelpCircle, Info, Check, Clock, Lightbulb, Zap
} from 'lucide-react';
import { AIPromptTemplate } from './types/ai-management-types';
import { AI_PROMPT_TEMPLATES } from './data/ai-prompt-templates-data';
import { AI_FEATURES_REGISTRY } from './data/ai-features-registry';
import { AIPromptTypeCreator } from './AIPromptTypeCreator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PROMPT_TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  default: { bg: 'bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  system: { bg: 'bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  fallback: { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  extraction: { bg: 'bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
  evaluation: { bg: 'bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
  classification: { bg: 'bg-pink-500/10', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800' },
  output_schema: { bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  sentiment: { bg: 'bg-green-500/10', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
};

const PROMPT_TYPE_DESCRIPTIONS: Record<string, { title: string; description: string; usage: string }> = {
  default: { title: 'Default Prompt', description: 'The primary prompt template used for standard feature operations.', usage: 'Used for the main AI interaction when no specialized prompt type is specified.' },
  system: { title: 'System Prompt', description: "Sets the AI's persona, behavior rules, and overall context.", usage: "Always executed first to establish the AI's role and constraints." },
  fallback: { title: 'Fallback Prompt', description: 'Backup template used when the primary prompt fails.', usage: 'Ensures graceful degradation and provides alternative responses.' },
  extraction: { title: 'Data Extraction', description: 'Template optimized for extracting structured data.', usage: 'Parses documents, responses, or logs to extract specific fields.' },
  evaluation: { title: 'Evaluation', description: 'Template for scoring and assessment.', usage: 'Produces maturity scores, risk ratings, and compliance evaluations.' },
  classification: { title: 'Classification', description: 'Template for categorizing content.', usage: 'Sorts content into categories like risk levels or compliance statuses.' },
  output_schema: { title: 'Output Schema', description: 'JSON schema defining the exact response structure.', usage: 'Appended to prompts to ensure consistent, parseable JSON responses.' },
  sentiment: { title: 'Sentiment Analysis', description: 'Analyzes tone and confidence in responses.', usage: 'Evaluates response quality, attitude, and certainty levels.' },
};

const SYSTEM_VARIABLES = [
  { name: '{query}', description: 'User query or input text', example: '"What are the best practices for IAM?"' },
  { name: '{user.name}', description: 'Current user\'s full name', example: '"John Doe"' },
  { name: '{user.role}', description: 'Current user\'s role', example: '"Security Analyst"' },
  { name: '{context.module}', description: 'Active module name', example: '"Access Review"' },
  { name: '{context.tenant}', description: 'Tenant identifier', example: '"acme-corp"' },
];

const CONTEXT_VARIABLES = [
  { name: '{user.id}', description: 'Unique user identifier', example: '"usr_12345"' },
  { name: '{user.department}', description: 'User\'s department', example: '"Engineering"' },
  { name: '{user.title}', description: 'User\'s job title', example: '"Software Engineer"' },
  { name: '{timestamp}', description: 'Current ISO timestamp', example: '"2025-12-10T14:30:00Z"' },
  { name: '{session.id}', description: 'Current session ID', example: '"sess_abc123"' },
];

const ADVANCED_VARIABLES = [
  { name: '{content}', description: 'Full document or data content', example: '[Document text here]' },
  { name: '{framework}', description: 'Compliance framework reference', example: '"ISO 27001"' },
  { name: '{response_text}', description: 'AI or user response text', example: '"Our current process is..."' },
  { name: '{categories}', description: 'Available classification categories', example: '"risk, compliance, operational"' },
];

const SAMPLE_VALUES: Record<string, string> = {
  '{query}': 'What are the best practices for IAM?',
  '{user.name}': 'John Doe',
  '{user.role}': 'Security Analyst',
  '{context.module}': 'Access Review',
  '{context.tenant}': 'acme-corp',
  '{user.id}': 'usr_12345',
  '{user.department}': 'Engineering',
  '{user.title}': 'Software Engineer',
  '{timestamp}': new Date().toISOString(),
  '{session.id}': 'sess_abc123',
  '{content}': '[Document content here]',
  '{framework}': 'ISO 27001',
  '{response_text}': 'The current access management process is adequate.',
  '{categories}': 'risk, compliance, operational',
};

const extractVariablesFromPrompt = (text: string): string[] => {
  const matches = text.match(/\{[^}]+\}/g) || [];
  return [...new Set(matches)];
};

const AIPromptTemplates = () => {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [selectedPromptType, setSelectedPromptType] = useState<string>('default');
  const [editedPrompt, setEditedPrompt] = useState("");
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');
  const [showHistory, setShowHistory] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [featureSearch, setFeatureSearch] = useState("");
  const [templates, setTemplates] = useState<AIPromptTemplate[]>(AI_PROMPT_TEMPLATES);

  const features = AI_FEATURES_REGISTRY;

  const filteredFeatures = features.filter(f =>
    f.name.toLowerCase().includes(featureSearch.toLowerCase()) ||
    f.category.toLowerCase().includes(featureSearch.toLowerCase())
  );

  const promptsByType = useMemo(() => {
    const result: Record<string, AIPromptTemplate[]> = {};
    templates.filter(t => t.featureId === selectedFeatureId).forEach(t => {
      const type = t.promptType || 'default';
      if (!result[type]) result[type] = [];
      result[type].push(t);
    });
    return result;
  }, [templates, selectedFeatureId]);

  const availablePromptTypes = Object.keys(promptsByType);
  const activePrompt = promptsByType[selectedPromptType]?.find(p => p.isActive) || promptsByType[selectedPromptType]?.[0];

  const selectedFeature = features.find(f => f.id === selectedFeatureId);
  const displayPrompt = editedPrompt || activePrompt?.template || '';
  const tokenEstimate = Math.ceil(displayPrompt.length / 4);
  const extractedVariables = extractVariablesFromPrompt(displayPrompt);
  const hasUnsavedChanges = editedPrompt && editedPrompt !== (activePrompt?.template || '');

  const handleFeatureSelect = (featureId: string) => {
    setSelectedFeatureId(featureId);
    setSelectedPromptType('default');
    setEditedPrompt("");
    setActiveView('edit');
  };

  const handlePromptChange = (value: string) => {
    setEditedPrompt(value);
  };

  const handleSave = () => {
    if (!selectedFeatureId || !editedPrompt.trim()) return;
    setTemplates(prev => prev.map(t =>
      t.id === activePrompt?.id
        ? { ...t, template: editedPrompt, version: t.version + 1, updatedAt: new Date().toISOString() }
        : t
    ));
    toast.success('Prompt saved successfully');
  };

  const handleReset = () => {
    setEditedPrompt(activePrompt?.template || '');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayPrompt);
    toast.success('Copied to clipboard');
  };

  const insertVariable = (variable: string) => {
    setEditedPrompt(prev => (prev || activePrompt?.template || '') + variable);
  };

  const handleCreatePrompt = (data: { prompt_type: string; prompt_template: string; variables: string[] }) => {
    const newTemplate: AIPromptTemplate = {
      id: `${selectedFeatureId}-${data.prompt_type}-${Date.now()}`,
      featureId: selectedFeatureId!,
      name: `${selectedFeature?.name} ${data.prompt_type}`,
      template: data.prompt_template,
      macros: data.variables,
      outputFormat: selectedFeature?.outputFormat || 'markdown',
      promptType: data.prompt_type,
      isActive: true,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates(prev => [...prev, newTemplate]);
    setSelectedPromptType(data.prompt_type);
    toast.success('Prompt type created');
  };

  const renderPreview = () => {
    let rendered = displayPrompt;
    Object.entries(SAMPLE_VALUES).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(key.replace(/[{}().]/g, '\\$&'), 'g'), value);
    });
    return rendered;
  };

  const getPromptTypeStyle = (type: string) => PROMPT_TYPE_STYLES[type] || PROMPT_TYPE_STYLES.default;
  const getPromptTypeInfo = (type: string) => PROMPT_TYPE_DESCRIPTIONS[type] || { title: type.charAt(0).toUpperCase() + type.slice(1), description: 'Custom prompt type', usage: 'Used for specialized AI operations' };

  // When switching prompt type, clear edited prompt
  const handlePromptTypeSelect = (type: string) => {
    setSelectedPromptType(type);
    setEditedPrompt("");
    setActiveView('edit');
  };

  return (
    <TooltipProvider>
      <div className="flex gap-6 h-[calc(100vh-280px)]">
        {/* Left Panel - Feature Selection */}
        <div className="w-80 flex-shrink-0">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold">AI Features</CardTitle>
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-4 h-4 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-medium mb-1">AI Features</p>
                      <p className="text-xs text-muted-foreground">Each feature represents a specific AI capability. Select one to view and edit its prompt templates.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge variant="secondary" className="text-xs">{features.length}</Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search features..." value={featureSearch} onChange={(e) => setFeatureSearch(e.target.value)} className="pl-9 h-9" />
              </div>
              <p className="text-xs text-muted-foreground">Select a feature to customize its AI prompts</p>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {filteredFeatures.map((feature) => {
                    const isSelected = selectedFeatureId === feature.id;
                    const promptCount = templates.filter(t => t.featureId === feature.id).length;
                    return (
                      <Tooltip key={feature.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleFeatureSelect(feature.id)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                              isSelected
                                ? "bg-primary/10 border border-primary/20 shadow-sm"
                                : "hover:bg-muted/60 border border-transparent"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                              isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                              <Bot className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn("text-sm font-medium truncate", isSelected && "text-primary")}>{feature.name}</span>
                                {feature.enabled && <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />}
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground truncate">{feature.category}</p>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{promptCount}</Badge>
                              </div>
                            </div>
                            <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", isSelected && "text-primary rotate-90")} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-medium">{feature.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <Badge variant="secondary">{feature.category}</Badge>
                            <span className={feature.enabled ? 'text-green-500' : 'text-muted-foreground'}>
                              {feature.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Prompt Editor */}
        <div className="flex-1 min-w-0">
          {!selectedFeatureId ? (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Select a Feature</h3>
                <p className="text-muted-foreground text-sm max-w-xs mb-4">
                  Choose an AI feature from the list to view and edit its prompt templates
                </p>
                <Alert className="max-w-sm mx-auto text-left">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <strong>Tip:</strong> Each feature can have multiple prompt types (default, system, fallback) for different scenarios.
                  </AlertDescription>
                </Alert>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex flex-col">
              {/* Header */}
              <CardHeader className="pb-4 border-b">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{selectedFeature?.name}</CardTitle>
                      {activePrompt && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="font-mono text-xs cursor-help">v{activePrompt.version}</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Current active version</p>
                            <p className="text-xs text-muted-foreground">Click History to view previous versions</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {hasUnsavedChanges && (
                        <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 border-amber-200">Unsaved</Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 cursor-help"><Hash className="w-3 h-3" />~{tokenEstimate} tokens</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">Token Estimate</p>
                          <p className="text-xs text-muted-foreground mt-1">~4 characters = 1 token. Shorter prompts cost less and respond faster.</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 cursor-help"><Sparkles className="w-3 h-3" />{extractedVariables.length} variables</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">Detected Variables</p>
                          <p className="text-xs text-muted-foreground mt-1">Variables like {'{query}'} are replaced with actual values at runtime.</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handleCopy}><Copy className="w-4 h-4" /></Button></TooltipTrigger>
                      <TooltipContent>Copy prompt to clipboard</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setShowHistory(true)}><History className="w-4 h-4" /></Button></TooltipTrigger>
                      <TooltipContent>
                        <p>Version History</p>
                        <p className="text-xs text-muted-foreground">View and restore previous versions</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Prompt Type Pills */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Prompt Type</span>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent side="right" className="max-w-sm">
                        <p className="font-medium mb-2">Prompt Types</p>
                        <div className="space-y-1 text-xs">
                          <p><strong>Default:</strong> Main prompt for standard operations</p>
                          <p><strong>System:</strong> Sets AI persona and behavior rules</p>
                          <p><strong>Fallback:</strong> Backup when primary fails</p>
                          <p><strong>Others:</strong> Specialized analysis prompts</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {availablePromptTypes.length > 0 ? (
                      availablePromptTypes.map((type) => {
                        const style = getPromptTypeStyle(type);
                        const info = getPromptTypeInfo(type);
                        const isActive = selectedPromptType === type;
                        return (
                          <Tooltip key={type}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handlePromptTypeSelect(type)}
                                className={cn(
                                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize border",
                                  isActive
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : `${style.bg} ${style.text} ${style.border} hover:opacity-80`
                                )}
                              >
                                {type.replace(/_/g, ' ')}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs">
                              <p className="font-medium">{info.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                              <p className="text-xs mt-2"><strong>Usage:</strong> {info.usage}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No prompts configured</span>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setShowCreateDialog(true)} className="h-7 text-xs">
                          <Plus className="w-3 h-3 mr-1" />Add Type
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Create a new prompt type</p>
                        <p className="text-xs text-muted-foreground">Add specialized prompts for different scenarios</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>

              {/* Content */}
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <div className="flex-1 flex overflow-hidden">
                  {/* Editor Area */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 p-3 border-b bg-muted/30">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant={activeView === 'edit' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveView('edit')} className="h-8">
                            <Code className="w-4 h-4 mr-1.5" />Edit
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Edit Mode</p><p className="text-xs text-muted-foreground">Write and modify the prompt template</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant={activeView === 'preview' ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveView('preview')} className="h-8">
                            <Eye className="w-4 h-4 mr-1.5" />Preview
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Preview Mode</p><p className="text-xs text-muted-foreground">See prompt with sample values substituted</p></TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Editor/Preview Content */}
                    <div className="flex-1 p-4 overflow-auto">
                      {activeView === 'edit' ? (
                        <div className="h-full flex flex-col">
                          {!displayPrompt && (
                            <Alert className="mb-3">
                              <Lightbulb className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                <strong>Writing Tips:</strong> Be specific about the AI's task. Use variables like {'{query}'} for dynamic content. Include output format expectations.
                              </AlertDescription>
                            </Alert>
                          )}
                          <Textarea
                            value={editedPrompt || activePrompt?.template || ''}
                            onChange={(e) => handlePromptChange(e.target.value)}
                            placeholder="Enter your prompt template here..."
                            className="flex-1 min-h-[300px] font-mono text-sm resize-none border-0 focus-visible:ring-0 p-0 shadow-none"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Alert className="bg-muted/50">
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              This preview shows your prompt with sample values substituted. Actual values will vary at runtime.
                            </AlertDescription>
                          </Alert>
                          <div className="rounded-lg border bg-muted/30 p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                              <Zap className="w-3 h-3" />
                              <span>Rendered with sample values</span>
                            </div>
                            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                              {renderPreview()}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-4 p-4 border-t bg-muted/20">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={handleReset}>
                            <RotateCcw className="w-4 h-4 mr-1.5" />Reset
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Discard changes and revert to last saved version</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button onClick={handleSave} disabled={!editedPrompt.trim()} size="sm">
                            <Save className="w-4 h-4 mr-1.5" />Save Changes
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Save as new version</p>
                          <p className="text-xs text-muted-foreground">Creates a new version and sets it as active</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Variables Sidebar */}
                  <div className="w-64 border-l bg-muted/20 flex flex-col overflow-hidden">
                    <div className="p-3 border-b">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />Variables
                        </h4>
                        <Tooltip>
                          <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs">
                            <p className="font-medium">Template Variables</p>
                            <p className="text-xs text-muted-foreground mt-1">Placeholders replaced with actual values at runtime. Click to insert.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Click to insert at cursor position</p>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-3 space-y-4">
                        {/* System Variables */}
                        <VariableSection title="System" tooltip="Core system variables available in all prompts" variables={SYSTEM_VARIABLES} extractedVariables={extractedVariables} onInsert={insertVariable} />
                        {/* Context Variables */}
                        <VariableSection title="Context" tooltip="Session and user context variables" variables={CONTEXT_VARIABLES} extractedVariables={extractedVariables} onInsert={insertVariable} />
                        {/* Advanced Variables */}
                        <VariableSection title="Advanced" tooltip="Additional variables for specialized prompts" variables={ADVANCED_VARIABLES} extractedVariables={extractedVariables} onInsert={insertVariable} />

                        {/* Detected In Template */}
                        {extractedVariables.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1 mb-2">
                              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Template</h5>
                              <Check className="w-3 h-3 text-green-500" />
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {extractedVariables.map((v) => (
                                <Tooltip key={v}>
                                  <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="text-xs font-mono cursor-help">{v}</Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="left">
                                    <p>Used in your prompt</p>
                                    <p className="text-xs text-muted-foreground">Will be replaced at runtime</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Version History Sheet */}
        <Sheet open={showHistory} onOpenChange={setShowHistory}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />Version History
              </SheetTitle>
              <SheetDescription>
                {selectedPromptType} prompt versions for {selectedFeature?.name}
              </SheetDescription>
            </SheetHeader>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Each save creates a new version. The active version is used in production.
              </AlertDescription>
            </Alert>
            <ScrollArea className="h-[calc(100vh-200px)] mt-4">
              <div className="space-y-3 pr-4">
                {promptsByType[selectedPromptType]?.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      prompt.isActive
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={prompt.isActive ? "default" : "secondary"} className="font-mono text-xs">v{prompt.version}</Badge>
                          {prompt.isActive && (
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                              <Check className="w-3 h-3 mr-1" />Active
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(prompt.updatedAt).toLocaleDateString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 font-mono">{prompt.template.slice(0, 120)}...</p>
                      </div>
                      {!prompt.isActive && (
                        <Button variant="outline" size="sm" onClick={() => {
                          setTemplates(prev => prev.map(t =>
                            t.featureId === selectedFeatureId && t.promptType === selectedPromptType
                              ? { ...t, isActive: t.id === prompt.id }
                              : t
                          ));
                          setEditedPrompt("");
                          toast.success('Version activated');
                          setShowHistory(false);
                        }}>
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Create Prompt Type Dialog */}
        {selectedFeatureId && (
          <AIPromptTypeCreator
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            featureId={selectedFeatureId}
            featureName={selectedFeature?.name || ''}
            existingTypes={availablePromptTypes}
            onCreatePrompt={handleCreatePrompt}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

// Sub-component for variable sections
function VariableSection({ title, tooltip, variables, extractedVariables, onInsert }: {
  title: string;
  tooltip: string;
  variables: { name: string; description: string; example: string }[];
  extractedVariables: string[];
  onInsert: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</h5>
        <Tooltip>
          <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
          <TooltipContent side="left">{tooltip}</TooltipContent>
        </Tooltip>
      </div>
      <div className="space-y-1">
        {variables.map((v) => (
          <Tooltip key={v.name}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onInsert(v.name)}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-colors",
                  extractedVariables.includes(v.name)
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {v.name}
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="font-medium">{v.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{v.description}</p>
              <p className="text-xs mt-2"><strong>Example:</strong> {v.example}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

export default AIPromptTemplates;
