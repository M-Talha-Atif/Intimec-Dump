
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles } from "lucide-react";

const PROMPT_TYPES = [
  { value: 'default', label: 'Default', description: 'Main prompt template for the feature' },
  { value: 'system', label: 'System', description: 'System message for AI persona & context' },
  { value: 'fallback', label: 'Fallback', description: 'Used when primary prompt fails' },
  { value: 'extraction', label: 'Extraction', description: 'Data extraction from content' },
  { value: 'evaluation', label: 'Evaluation', description: 'Scoring and assessment' },
  { value: 'classification', label: 'Classification', description: 'Categorization and labeling' },
  { value: 'output_schema', label: 'Output Schema', description: 'JSON schema for response format' },
  { value: 'sentiment', label: 'Sentiment', description: 'Sentiment analysis instructions' },
];

const STARTER_TEMPLATES: Record<string, string> = {
  default: `You are an AI assistant for {feature_name}.

## Context
- User: {user.name} ({user.role})
- Module: {context.module}

Input: {query}

Provide a clear, actionable response.`,
  system: `You are an expert IAM analyst specializing in {feature_name}.

## Behavioral Rules
- Always prioritize security over convenience
- Cite specific compliance framework controls when applicable
- If confidence is below 70%, recommend manual review
- Never recommend disabling security controls
- Use structured output formats for machine-parseable responses

## Domain Expertise
- SOX Section 404, GDPR Articles 25/32, ISO 27001 Annex A, NIST 800-53
- Identity lifecycle management and access governance
- Risk-based decision making and least privilege enforcement`,
  fallback: `Provide a simplified analysis of the following:

{query}

Focus on:
1. Key findings (top 3)
2. Risk level (Critical/High/Medium/Low)
3. Recommended next steps

Keep your response concise and actionable.`,
  extraction: `Extract structured data from the following content:

{content}

Return JSON with the extracted fields, including:
- key entities and their attributes
- relationships between entities
- confidence scores for each extraction`,
  evaluation: `Evaluate the following against governance standards:

{content}

Scoring criteria:
- Compliance alignment (0-100)
- Risk exposure (Critical/High/Medium/Low)
- Maturity level (1-5)
- Gap count and severity

Return structured JSON with scores and justifications.`,
  classification: `Classify the following into appropriate categories:

{content}

Categories: {categories}

Return JSON with:
- primary_category
- confidence (0-1)
- secondary_categories[]
- reasoning`,
  output_schema: `{
  "type": "object",
  "properties": {
    "summary": { "type": "string" },
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "severity": { "enum": ["critical", "high", "medium", "low"] },
          "description": { "type": "string" },
          "remediation": { "type": "string" }
        }
      }
    },
    "risk_score": { "type": "number", "minimum": 0, "maximum": 100 },
    "recommendations": { "type": "array", "items": { "type": "string" } }
  }
}`,
  sentiment: `Analyze the sentiment and confidence of the following response:

Response: {response_text}

Return JSON with:
- sentiment: "positive" | "neutral" | "negative" | "confused"
- confidence: number (0-1)
- needsFollowUp: boolean
- reasoning: brief explanation`,
};

interface AIPromptTypeCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureId: string;
  featureName: string;
  existingTypes: string[];
  onCreatePrompt: (data: {
    prompt_type: string;
    prompt_template: string;
    variables: string[];
  }) => void;
}

export function AIPromptTypeCreator({
  open,
  onOpenChange,
  featureName,
  existingTypes,
  onCreatePrompt
}: AIPromptTypeCreatorProps) {
  const [promptType, setPromptType] = useState<string>("");
  const [customType, setCustomType] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");

  const availableTypes = PROMPT_TYPES.filter(t => !existingTypes.includes(t.value));
  const isCustomType = promptType === 'custom';
  const finalType = isCustomType ? customType.toLowerCase().replace(/\s+/g, '_') : promptType;

  const handleTypeChange = (type: string) => {
    setPromptType(type);
    if (type !== 'custom' && STARTER_TEMPLATES[type]) {
      setPromptTemplate(STARTER_TEMPLATES[type]);
    }
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{[^}]+\}/g) || [];
    return [...new Set(matches)];
  };

  const handleCreate = () => {
    if (!finalType || !promptTemplate.trim()) return;
    onCreatePrompt({
      prompt_type: finalType,
      prompt_template: promptTemplate,
      variables: extractVariables(promptTemplate)
    });
    onOpenChange(false);
    setPromptType("");
    setCustomType("");
    setPromptTemplate("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Prompt Type
          </DialogTitle>
          <DialogDescription>
            Create a new prompt type for <strong>{featureName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Prompt Type</Label>
            <Select value={promptType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a prompt type..." />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span className="capitalize">{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Custom Type</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCustomType && (
            <div className="space-y-2">
              <Label>Custom Type Name</Label>
              <Input
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="e.g., risk_assessment"
              />
              <p className="text-xs text-muted-foreground">
                Use lowercase with underscores. Example: risk_assessment, gap_analysis
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Prompt Template</Label>
              {promptTemplate && (
                <Badge variant="secondary" className="text-xs">
                  {extractVariables(promptTemplate).length} variables
                </Badge>
              )}
            </div>
            <Textarea
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              placeholder="Enter your prompt template..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {promptTemplate && extractVariables(promptTemplate).length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Detected Variables</Label>
              <div className="flex flex-wrap gap-1">
                {extractVariables(promptTemplate).map((v) => (
                  <Badge key={v} variant="outline" className="text-xs">
                    {v}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!finalType || !promptTemplate.trim()}
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Prompt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
