import React from 'react';
import { Role } from '@/types/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Building } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CharacterCounter from '@/components/shared/util/CharacterCounter';
import BadgeEditor from '@/components/applications/add-application/ComplianceBadgeEditor';

interface RoleOverviewEditorProps {
  role: Role;
  isEditing: boolean;
  onChange: (updates: Partial<Role>) => void;
}

const MAX_FIELD_LENGTH = 255;

const ROLE_TYPES = [
  "Business Role",
  "Technical Role",
  "Application Role",
  "Functional Role",
];

const BUS_UNITS = [
  "Finance",
  "Human Resources",
  "Engineering",
  "Marketing",
];

const getTagColor = (tag: string): string => {
  const colors: Record<string, string> = {
    "Admin Role": "border-red-300 text-red-700 bg-red-50",
    Privileged: "border-orange-300 text-orange-700 bg-orange-50",
    Sensitive: "border-yellow-300 text-yellow-700 bg-yellow-50",
    Standard: "border-blue-300 text-blue-700 bg-blue-50",
  };
  return colors[tag] || "border-gray-300 text-gray-700 bg-gray-50";
};

/**
 * Resolves classification tags from the role object.
 *
 * The role.classification field can be:
 *   - string[]  (from adapter or after user edits)
 *   - string    (legacy single value)
 *   - undefined
 */
function resolveClassificationTags(role: Role): string[] {
  const raw = role.classification;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw) return [raw];
  return [];
}

const RoleOverviewEditor: React.FC<RoleOverviewEditorProps> = ({
  role,
  isEditing,
  onChange,
}) => {
  const classificationTags = resolveClassificationTags(role);

  const updateClassifications = (tags: string[]) => {
    onChange({ classification: tags } as any);
  };

  const removeClassification = (tag: string) => {
    updateClassifications(classificationTags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Role Name */}
          <div>
            <Label>
              Role Name <span className="text-destructive">*</span>
            </Label>
            {isEditing ? (
              <>
                <Input
                  value={role.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  placeholder="e.g. Finance Manager"
                  maxLength={MAX_FIELD_LENGTH}
                  className="mt-1"
                />
                <CharacterCounter current={role.name} max={MAX_FIELD_LENGTH} />
              </>
            ) : (
              <div className="p-2 bg-slate-50 rounded mt-1">{role.name}</div>
            )}
          </div>

          {/* Type + Business Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                Type <span className="text-destructive">*</span>
              </Label>
              {isEditing ? (
                <Select
                  value={role.type}
                  onValueChange={(value: Role['type']) => onChange({ type: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-md">
                    {ROLE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-slate-50 rounded mt-1">{role.type}</div>
              )}
            </div>
            <div>
              <Label>Business Unit</Label>
              {isEditing ? (
                <Select
                  value={role.businessUnit}
                  onValueChange={(value: Role['businessUnit']) => onChange({ businessUnit: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-md">
                    {BUS_UNITS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-slate-50 rounded mt-1">{role.businessUnit}</div>
              )}
            </div>
          </div>

          {/* Business Function + Classifications */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Business Function</Label>
              {isEditing ? (
                <Input
                  value={role.businessFunction || ''}
                  onChange={(e) => onChange({ businessFunction: e.target.value })}
                  placeholder="e.g. Financial Reporting"
                  className="mt-1"
                />
              ) : (
                <div className="p-2 bg-slate-50 rounded mt-1">{role.businessFunction || 'Not specified'}</div>
              )}
            </div>
            <div>
              <Label className="mb-2 block">Classifications</Label>
              {isEditing ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    {classificationTags.map((tag) => (
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
                      complianceTags={classificationTags}
                      setComplianceTags={updateClassifications}
                      placeholder="Add classification"
                      maxLength={30}
                      className="w-full max-w-60"
                    />
                  </div>
                  {classificationTags.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      No classifications assigned.
                    </p>
                  )}
                </>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {classificationTags.length > 0 ? (
                    classificationTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={`px-3 py-1 text-xs uppercase ${getTagColor(tag)}`}
                      >
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No classifications</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              {isEditing ? (
                <Select
                  value={role.status}
                  onValueChange={(value: Role['status']) => onChange({ status: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-md">
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-slate-50 rounded mt-1">{role.status}</div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>
              Description <span className="text-destructive">*</span>
            </Label>
            {isEditing ? (
              <>
                <Textarea
                  value={role.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  placeholder="Describe the role's purpose..."
                  maxLength={MAX_FIELD_LENGTH}
                  className="mt-1 min-h-[80px]"
                />
                <CharacterCounter current={role.description} max={MAX_FIELD_LENGTH} />
              </>
            ) : (
              <div className="p-2 bg-slate-50 rounded mt-1 min-h-[80px]">{role.description}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleOverviewEditor;