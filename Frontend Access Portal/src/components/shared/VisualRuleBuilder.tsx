import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Code, Eye, ToggleLeft } from "lucide-react";

const ATTRIBUTES = ["Department", "Job Title", "Location", "Level", "Cost Center", "Manager", "Employment Type"];
const OPERATORS = ["equals", "not equals", "contains", "starts with", "in"];

export interface RuleCondition {
  id: string;
  attribute: string;
  operator: string;
  value: string;
}

interface VisualRuleBuilderProps {
  conditions: RuleCondition[];
  onChange: (conditions: RuleCondition[]) => void;
  logicOperator: "AND" | "OR";
  onLogicChange: (logic: "AND" | "OR") => void;
  scriptValue?: string;
  onScriptChange?: (script: string) => void;
  label?: string;
  description?: string;
}

const generateScript = (conditions: RuleCondition[], logic: "AND" | "OR"): string => {
  if (conditions.length === 0) return "// No conditions defined";
  const parts = conditions.filter(c => c.attribute && c.value).map(c => {
    const attr = `user.${c.attribute.toLowerCase().replace(/\s+/g, "")}`;
    switch (c.operator) {
      case "equals": return `${attr} == "${c.value}"`;
      case "not equals": return `${attr} != "${c.value}"`;
      case "contains": return `${attr}.includes("${c.value}")`;
      case "starts with": return `${attr}.startsWith("${c.value}")`;
      case "in": return `["${c.value.split(",").map(v => v.trim()).join('","')}"].includes(${attr})`;
      default: return `${attr} == "${c.value}"`;
    }
  });
  if (parts.length === 0) return "// Incomplete conditions";
  const connector = logic === "AND" ? " && " : " || ";
  return parts.join(connector);
};

const VisualRuleBuilder: React.FC<VisualRuleBuilderProps> = ({
  conditions, onChange, logicOperator, onLogicChange, scriptValue, onScriptChange, label, description
}) => {
  const [mode, setMode] = useState<"visual" | "script">("visual");

  const addCondition = () => {
    onChange([...conditions, { id: `c-${Date.now()}`, attribute: "", operator: "equals", value: "" }]);
  };

  const removeCondition = (id: string) => {
    onChange(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, field: keyof RuleCondition, value: string) => {
    onChange(conditions.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const generatedScript = generateScript(conditions, logicOperator);

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium">{label}</p>}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={mode === "visual" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("visual")}
        >
          <Eye className="h-3.5 w-3.5 mr-1" /> Visual Builder
        </Button>
        <Button
          type="button"
          variant={mode === "script" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("script")}
        >
          <Code className="h-3.5 w-3.5 mr-1" /> Script Editor
        </Button>
      </div>

      {mode === "visual" ? (
        <div className="space-y-3">
          {conditions.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Logic:</span>
              <Badge
                variant={logicOperator === "AND" ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => onLogicChange("AND")}
              >
                AND
              </Badge>
              <Badge
                variant={logicOperator === "OR" ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => onLogicChange("OR")}
              >
                OR
              </Badge>
            </div>
          )}

          {conditions.map((condition, idx) => (
            <div key={condition.id} className="flex items-center gap-2">
              {idx > 0 && (
                <span className="text-xs font-medium text-muted-foreground w-8 text-center">
                  {logicOperator}
                </span>
              )}
              {idx === 0 && conditions.length > 1 && <span className="w-8" />}
              <Select value={condition.attribute} onValueChange={v => updateCondition(condition.id, "attribute", v)}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Attribute" />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-md">
                  {ATTRIBUTES.map(a => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={condition.operator} onValueChange={v => updateCondition(condition.id, "operator", v)}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-md">
                  {OPERATORS.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                value={condition.value}
                onChange={e => updateCondition(condition.id, "value", e.target.value)}
                placeholder="Value"
                className="h-8 text-xs flex-1"
              />
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeCondition(condition.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addCondition}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Condition
          </Button>

          {conditions.length > 0 && conditions.some(c => c.attribute && c.value) && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Generated Expression</p>
              <code className="text-xs font-mono block">{generatedScript}</code>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Textarea
              value={onScriptChange ? (scriptValue ?? generatedScript) : generatedScript}
              onChange={e => onScriptChange?.(e.target.value)}
              rows={6}
              className="font-mono text-xs leading-5 pl-10"
              placeholder="Enter assignment rule script..."
            />
            <div className="absolute left-0 top-0 w-8 h-full border-r bg-muted/50 rounded-l-md flex flex-col items-center pt-2 text-[10px] text-muted-foreground">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="leading-5">{i + 1}</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Use the script editor for complex logic. Variables: user.department, user.jobtitle, user.location, user.level, user.costcenter</p>
        </div>
      )}
    </div>
  );
};

export default VisualRuleBuilder;
