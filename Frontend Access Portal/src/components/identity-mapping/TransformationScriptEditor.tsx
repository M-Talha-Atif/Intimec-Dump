import React from "react";
import { Label } from "@/components/ui/label";
import { IdentityType } from "./IdentityAttributeMappingContent";

interface TransformationScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  sourceAttribute: string;
  identityType: IdentityType;
}

export const TransformationScriptEditor = ({
  value,
  onChange,
  sourceAttribute,
  identityType,
}: TransformationScriptEditorProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-slate-600">Transformation Script</Label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`// Transform ${sourceAttribute} for ${identityType}\nreturn value.toLowerCase();`}
        className="w-full h-32 p-3 text-sm font-mono border rounded-md resize-none"
      />
    </div>
  );
};
