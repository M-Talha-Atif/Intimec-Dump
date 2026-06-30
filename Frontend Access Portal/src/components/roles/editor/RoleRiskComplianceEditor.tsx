import React from "react";
import { Role } from "@/types/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BadgeEditor from "@/components/applications/add-application/ComplianceBadgeEditor";

interface RoleRiskComplianceEditorProps {
  role: Role;
  isEditing: boolean;
  onChange: (updates: Partial<Role>) => void;
}

const getTagColor = (tag: string): string => {
  const colors: Record<string, string> = {
    SOX: "border-red-300 text-red-700 bg-red-50",
    GDPR: "border-blue-300 text-blue-700 bg-blue-50",
    "PII Access": "border-purple-300 text-purple-700 bg-purple-50",
    HIPAA: "border-green-300 text-green-700 bg-green-50",
    "ISO 27001": "border-yellow-300 text-yellow-700 bg-yellow-50",
  };
  return colors[tag] || "border-gray-300 text-gray-700 bg-gray-50";
};

const RoleRiskComplianceEditor: React.FC<RoleRiskComplianceEditorProps> = ({
  role,
  isEditing,
  onChange,
}) => {
  // ComplianceTags stored on the role (may not exist on the Role type, hence cast)
  const complianceTags: string[] = (role as any).complianceTags || [];

  const RISK_LEVEL_MAP: Record<string, string> = { low: "Low", medium: "Medium", high: "High" };
  const rawRiskLevel: string = (role as Record<string, unknown>).riskLevel as string || "Low";
  const riskLevel: string = RISK_LEVEL_MAP[rawRiskLevel.toLowerCase()] ?? rawRiskLevel;

  const removeComplianceTag = (tag: string) => {
    onChange({
      complianceTags: complianceTags.filter((t) => t !== tag),
    } as any);
  };

  return (
    <div className="space-y-4">
      {/* Risk Level */}
      <div>
        <Label>Risk Level</Label>
        {isEditing ? (
          <Select
            value={riskLevel}
            onValueChange={(v) => onChange({ riskLevel: v } as any)}
          >
            <SelectTrigger className="mt-1 w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-md">
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="p-2 bg-slate-50 rounded mt-1 w-[200px]">
            {riskLevel}
          </div>
        )}
      </div>

      {/* Compliance Tags */}
      <div>
        <Label className="mb-2 block">Compliance Tags</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Add applicable compliance frameworks.
        </p>
        {isEditing ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {complianceTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`flex items-center gap-1 px-3 py-1 text-xs uppercase ${getTagColor(tag)}`}
                >
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => removeComplianceTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              <BadgeEditor
                complianceTags={complianceTags}
                setComplianceTags={(tags) =>
                  onChange({ complianceTags: tags } as any)
                }
                placeholder="Add compliance tag"
                maxLength={30}
                className="w-full max-w-60"
              />
            </div>
            {complianceTags.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                No compliance tags assigned.
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            {complianceTags.length > 0 ? (
              complianceTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`px-3 py-1 text-xs uppercase ${getTagColor(tag)}`}
                >
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                No compliance tags assigned.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleRiskComplianceEditor;