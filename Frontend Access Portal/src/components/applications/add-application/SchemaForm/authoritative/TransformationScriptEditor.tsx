import {
  ConnectorAttribute,
  MetaSystemAttribute,
} from "@/types/add-application";

import DialogScriptEditor from "@/components/applications/add-application/common/DialogScriptEditor";
import { ScriptEditorContent } from "@/components/script-editor/schema";
import { Code } from "lucide-react";

const typeMap: Record<string, string> = {
  string: "string",
  number: "number",
  boolean: "boolean",
  date: "Date", // JS Date object
};
function getAttributeTypeDefs(
  sourceAttribute: ConnectorAttribute,
  targetAttribute: MetaSystemAttribute
) {
  const srcOverload = `get(key: "${sourceAttribute.name}"): ${
    typeMap[sourceAttribute.type]
  }`;

  const tgtOverload = `set(key: "${targetAttribute.systemKey}", value: ${
    typeMap[targetAttribute.dataType]
  }): void`;

  return `
	interface SourceAttributes {
		${srcOverload}
	}

	interface TargetAttributes {
		${tgtOverload}
	}

	declare const sourceAttributes: SourceAttributes;
	declare const targetAttributes: TargetAttributes;
	`;
}

export default function TransfromationScriptEditor({
  onChange,
  value,
  accountAttribute,
  systemAttribute,
}: {
  onChange: (value: ScriptEditorContent) => void;
  value: ScriptEditorContent | undefined;
  accountAttribute: ConnectorAttribute;
  systemAttribute: MetaSystemAttribute;
}) {
  const attributeTypes = getAttributeTypeDefs(
    accountAttribute,
    systemAttribute
  );
  return (
    <DialogScriptEditor
      onSave={onChange}
      externalValue={value}
      typescriptTypes={attributeTypes}
      variant="outline"
    >
      <Code />
    </DialogScriptEditor>
  );
}
