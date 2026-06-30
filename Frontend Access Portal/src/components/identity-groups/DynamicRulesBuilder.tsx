import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, AlertCircle, Users, TrendingUp, TrendingDown } from "lucide-react";
import { DynamicRule, PreviewResult, previewDynamicGroup } from "@/services/groups";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DynamicRulesBuilderProps {
  rules: DynamicRule[];
  onChange: (rules: DynamicRule[]) => void;
  onPreview?: (preview: PreviewResult) => void;
}

export function DynamicRulesBuilder({ rules, onChange, onPreview }: DynamicRulesBuilderProps) {
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const addRule = () => {
    const newRule: DynamicRule = {
      id: `rule_${Date.now()}`,
      type: 'attribute',
      attribute: 'department',
      operator: 'equals',
      value: '',
      condition: rules.length > 0 ? 'AND' : undefined
    };
    onChange([...rules, newRule]);
  };

  const removeRule = (id: string) => {
    const filtered = rules.filter(r => r.id !== id);
    // Reset condition on first rule
    if (filtered.length > 0 && filtered[0].condition) {
      filtered[0] = { ...filtered[0], condition: undefined };
    }
    onChange(filtered);
  };

  const updateRule = (id: string, updates: Partial<DynamicRule>) => {
    onChange(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handlePreview = async () => {
    if (rules.length === 0 || !rules.every(r => r.value)) {
      return;
    }

    setIsLoadingPreview(true);
    try {
      const result = await previewDynamicGroup(rules);
      setPreview(result);
      onPreview?.(result);
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-destructive';
    if (score >= 40) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {rules.map((rule, index) => (
          <Card key={rule.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                {index > 0 && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={rule.condition}
                      onValueChange={(value: 'AND' | 'OR') => updateRule(rule.id, { condition: value })}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3">
                    <Label className="text-xs">Rule Type</Label>
                    <Select
                      value={rule.type}
                      onValueChange={(value: 'attribute' | 'entitlement' | 'membership') => 
                        updateRule(rule.id, { type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attribute">Attribute</SelectItem>
                        <SelectItem value="entitlement">Entitlement</SelectItem>
                        <SelectItem value="membership">Group Membership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {rule.type === 'attribute' && (
                    <div className="col-span-3">
                      <Label className="text-xs">Attribute</Label>
                      <Select
                        value={rule.attribute}
                        onValueChange={(value) => updateRule(rule.id, { attribute: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="department">Department</SelectItem>
                          <SelectItem value="title">Title</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                          <SelectItem value="employeeType">Employee Type</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="col-span-3">
                    <Label className="text-xs">Operator</Label>
                    <Select
                      value={rule.operator}
                      onValueChange={(value: any) => updateRule(rule.id, { operator: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="in">In</SelectItem>
                        {rule.type === 'entitlement' && (
                          <>
                            <SelectItem value="has">Has</SelectItem>
                            <SelectItem value="not">Does Not Have</SelectItem>
                          </>
                        )}
                        {rule.type === 'membership' && (
                          <>
                            <SelectItem value="includes">Includes</SelectItem>
                            <SelectItem value="excludes">Excludes</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Value</Label>
                    <Input
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                      placeholder="Enter value"
                    />
                  </div>

                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(rule.id)}
                      className="h-9 w-9 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={addRule} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Rule
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handlePreview}
          size="sm"
          disabled={rules.length === 0 || !rules.every(r => r.value) || isLoadingPreview}
        >
          <Users className="h-4 w-4 mr-1" />
          Preview Members
        </Button>
      </div>

      {isLoadingPreview && (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {preview && !isLoadingPreview && (
        <div className="space-y-3">
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Matches</div>
                  <div className="text-2xl font-bold">{preview.totalMatched}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    Will Be Added
                  </div>
                  <div className="text-2xl font-bold text-success">{preview.delta.adds}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-destructive" />
                    Will Be Removed
                  </div>
                  <div className="text-2xl font-bold text-destructive">{preview.delta.removes}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {preview.sodViolations && preview.sodViolations.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-1">SoD Violations Detected</div>
                {preview.sodViolations.map((v, i) => (
                  <div key={i} className="text-xs mt-1">
                    <strong>{v.policy}:</strong> {v.description}
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <div className="text-sm font-medium mb-2">Sample Members ({preview.samples.length} of {preview.totalMatched})</div>
            <div className="space-y-1">
              {preview.samples.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 border rounded-md bg-background">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                    {member.department && (
                      <Badge variant="outline" className="text-xs">{member.department}</Badge>
                    )}
                  </div>
                  <div className={`text-sm font-medium ${getRiskColor(member.riskScore)}`}>
                    Risk: {member.riskScore}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
