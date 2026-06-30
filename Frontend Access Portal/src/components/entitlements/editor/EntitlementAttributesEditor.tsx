import React from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import BadgeEditor from "@/components/applications/add-application/ComplianceBadgeEditor";

interface EntitlementAttributesEditorProps {
  entitlement: EntitlementResponseDto;
  isEditing: boolean;
  onChange: (updates: Partial<EntitlementResponseDto>) => void;
}

const classificationColors: Record<string, string> = {
  "HIGH RISK": "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
  PII: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
  GDPR: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  SOX: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
};

const getTagColor = (tag: string): string => {
  return classificationColors[tag.toUpperCase()] ??
    "bg-muted text-muted-foreground border-muted-foreground/20";
};

const EntitlementAttributesEditor: React.FC<EntitlementAttributesEditorProps> = ({
  entitlement,
  isEditing,
  onChange,
}) => {
  const classification = entitlement.classification ?? [];

  const removeTag = (tagToRemove: string): void => {
    if (!isEditing) return;
    onChange({
      classification: classification.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleTagsChange = (tags: string[]): void => {
    onChange({ classification: tags });
  };

  const riskLabel = entitlement.riskLevel ?? "Low";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risk Level */}
          {/* <div>
            <Label htmlFor="riskLevel">Risk Level</Label>
            <Select
              value={riskLabel}
              onValueChange={(value) => onChange({ riskLevel: value })}
              disabled={!isEditing}
            >
              <SelectTrigger id="riskLevel">
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* Classification Tags */}
          <div>
            <Label className="mb-2 block">Classifications</Label>

            <div className="flex flex-wrap items-center gap-2">
              {/* Existing tags */}
              {classification.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`flex items-center gap-1 px-3 py-1 text-xs uppercase ${getTagColor(tag)}`}
                >
                  {tag}
                  {isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Badge>
              ))}

              {/* Add new tag */}
              {isEditing && (
                <BadgeEditor
                  complianceTags={classification}
                  setComplianceTags={handleTagsChange}
                  placeholder="Add classification"
                  maxLength={30}
                  className="w-full max-w-60"
                />
              )}
            </div>

            {classification.length === 0 && !isEditing && (
              <p className="text-sm text-muted-foreground mt-2">
                No classifications assigned.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntitlementAttributesEditor;