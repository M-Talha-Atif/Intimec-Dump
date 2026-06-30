import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleFilters as RoleFiltersType } from "@/types/roleManagement";
import { fetchRoleTags } from "./utils/roleUtils";

interface RoleFiltersProps {
  filters: RoleFiltersType;
  onFiltersChange: (filters: Partial<RoleFiltersType>) => void;
  onClearFilters: () => void;
}

export const RoleFilters: React.FC<RoleFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Fetch tags on mount
  useEffect(() => {
    const loadTags = async () => {
      const tags = await fetchRoleTags();
      setAvailableTags(tags);
    };
    loadTags();
  }, []);

  const roleTypes = [
    { value: "ADMINISTRATOR", label: "Administrator", color: "destructive" },
    { value: "REVIEWER", label: "Reviewer", color: "default" },
    { value: "OPERATOR", label: "Operator", color: "secondary" },
    { value: "VIEWER", label: "Viewer", color: "outline" },
  ] as const;

  const roleStatuses = [
    { value: "active", label: "Active", color: "default" },
    { value: "inactive", label: "Inactive", color: "secondary" },
  ] as const;

  const riskLevels = [
    { value: "Low", label: "Low Risk", color: "default" },
    { value: "Medium", label: "Medium Risk", color: "secondary" },
    { value: "High", label: "High Risk", color: "destructive" },
  ] as const;

  const handleCheckboxChange = (
    filterKey: keyof RoleFiltersType,
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[filterKey] as string[];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);

    onFiltersChange({ [filterKey]: newValues });
  };

  const getActiveFilterCount = () => {
    return (
      filters.types.length +
      filters.statuses.length +
      filters.riskLevels.length +
      filters.tags.length
    );
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <Badge 
                variant="secondary" 
                className="px-3 py-1.5 inline-flex items-center justify-center"
              >
                <span className="inline-block">{getActiveFilterCount()} active</span>
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              disabled={getActiveFilterCount() === 0}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Role Types */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-foreground">Role Type</h4>
            <div className="space-y-2">
              {roleTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={filters.types.includes(type.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "types",
                        type.value,
                        checked as boolean
                      )
                    }
                  />
                  <Label htmlFor={`type-${type.value}`} className="text-sm">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-foreground">Status</h4>
            <div className="space-y-2">
              {roleStatuses.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={filters.statuses.includes(status.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "statuses",
                        status.value,
                        checked as boolean
                      )
                    }
                  />
                  <Label htmlFor={`status-${status.value}`} className="text-sm">
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Level */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-foreground">Risk Level</h4>
            <div className="space-y-2">
              {riskLevels.map((risk) => (
                <div key={risk.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`risk-${risk.value}`}
                    checked={filters.riskLevels.includes(risk.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "riskLevels",
                        risk.value,
                        checked as boolean
                      )
                    }
                  />
                  <Label htmlFor={`risk-${risk.value}`} className="text-sm">
                    {risk.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-foreground">Tags</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={filters.tags.includes(tag)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("tags", tag, checked as boolean)
                    }
                  />
                  <Label htmlFor={`tag-${tag}`} className="text-sm">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium text-sm text-foreground mb-3">
              Active Filters:
            </h4>
            <div className="flex flex-wrap gap-2">
              {filters.types.map((type) => (
                <Badge key={`active-type-${type}`} variant="secondary">
                  Type: {roleTypes.find((t) => t.value === type)?.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleCheckboxChange("types", type, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.statuses.map((status) => (
                <Badge key={`active-status-${status}`} variant="secondary">
                  Status: {roleStatuses.find((s) => s.value === status)?.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() =>
                      handleCheckboxChange("statuses", status, false)
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.riskLevels.map((risk) => (
                <Badge key={`active-risk-${risk}`} variant="secondary">
                  Risk: {riskLevels.find((r) => r.value === risk)?.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() =>
                      handleCheckboxChange("riskLevels", risk, false)
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.tags.map((tag) => (
                <Badge key={`active-tag-${tag}`} variant="secondary">
                  Tag: {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleCheckboxChange("tags", tag, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
