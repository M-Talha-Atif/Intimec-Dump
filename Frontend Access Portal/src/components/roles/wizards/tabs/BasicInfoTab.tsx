import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CharacterCounter from "@/components/shared/util/CharacterCounter";
import BadgeEditor from "@/components/applications/add-application/ComplianceBadgeEditor";
import { RoleFormState, ROLE_TYPES, BUS_UNITS, MAX_FIELD_LENGTH } from "../types";

interface BasicInfoTabProps {
  form: RoleFormState;
  update: (key: string, value: any) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ form, update }) => {
  const removeClassification = (tag: string) => {
    update("classification", form.classification.filter((c) => c !== tag));
  };

  const getTagColor = (tag: string): string => {
    const colors: Record<string, string> = {
      "Admin Role": "border-red-300 text-red-700 bg-red-50",
      Privileged: "border-orange-300 text-orange-700 bg-orange-50",
      Sensitive: "border-yellow-300 text-yellow-700 bg-yellow-50",
      Standard: "border-blue-300 text-blue-700 bg-blue-50",
    };
    return colors[tag] || "border-gray-300 text-gray-700 bg-gray-50";
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>
          Role Name <span className="text-destructive">*</span>
        </Label>
        <Input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="e.g. Finance Manager"
          maxLength={MAX_FIELD_LENGTH}
          className="mt-1"
        />
        <CharacterCounter current={form.name} max={MAX_FIELD_LENGTH} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>
            Type <span className="text-destructive">*</span>
          </Label>
          <Select value={form.type} onValueChange={(v) => update("type", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-md">
              {ROLE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Business Unit</Label>
          <Select
            value={form.businessUnit}
            onValueChange={(v) => update("businessUnit", v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-md">
              {BUS_UNITS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>
            Status <span className="text-destructive">*</span>
          </Label>
          <Select value={form.status} onValueChange={(v) => update("status", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-md">
              <SelectItem value="enabled">Enabled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Business Function</Label>
          <Input
            value={form.businessFunction}
            onChange={(e) => update("businessFunction", e.target.value)}
            placeholder="e.g. Financial Reporting"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="mb-2 block">Classifications</Label>
          <div className="flex flex-wrap items-center gap-2">
            {form.classification.map((tag) => (
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
                  onClick={() => removeClassification(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <BadgeEditor
              complianceTags={form.classification}
              setComplianceTags={(tags) => update("classification", tags)}
              placeholder="Add classification"
              maxLength={30}
              className="w-full max-w-60"
            />
          </div>
          {form.classification.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              No classifications assigned.
            </p>
          )}
        </div>
      </div>

      <div>
        <Label>
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Describe the role's purpose..."
          maxLength={MAX_FIELD_LENGTH}
          className="mt-1 min-h-[80px]"
        />
        <CharacterCounter current={form.description} max={MAX_FIELD_LENGTH} />
      </div>
    </div>
  );
};

export default BasicInfoTab;