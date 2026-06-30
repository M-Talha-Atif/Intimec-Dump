import { ScriptEditorContent } from "@/components/script-editor/schema";
import ScriptEditor from "@/components/script-editor/ScriptEditor";
import { useAddApplicationContext } from "@/contexts/AddApplicationContext";
import { ConnectorAttribute, MetaSystemAttribute } from "@/types/add-application";
import { useMemo } from "react";

function getAttributesTypeDefs(
  sourceAttributes: MetaSystemAttribute[],
  targetAttributes: ConnectorAttribute[]
) {
  const typeMap: Record<string, string> = {
    string: "string",
    number: "number",
    boolean: "boolean",
    date: "Date", // JS Date object
  };

  const srcOverloads = sourceAttributes
    .map((attr) => `get(key: "${attr.systemKey}"): ${typeMap[attr.dataType]}`)
    .join("\n");

  const tgtOverloads = targetAttributes
    .map((attr) => `get(key: "${attr.name}"): ${typeMap[attr.type]}`)
    .join("\n");

  return `
	interface SourceAttributes {
		${srcOverloads}
	}
	
	interface TargetAttributes {
		${tgtOverloads}
	}
	
	declare const sourceAttributes: SourceAttributes;
	declare const targetAttributes: TargetAttributes;
			`;
}

export default function CoorelationEditor({
  onChange,
  value,
}: {
  onChange: (value: ScriptEditorContent) => void;
  value: ScriptEditorContent | undefined;
}) {
  const { systemAttributes, accountAttributes } = useAddApplicationContext();
  const attributeTypes = useMemo(() => {
    if (systemAttributes && accountAttributes)
      return getAttributesTypeDefs(systemAttributes, accountAttributes);
    else return "";
  }, [systemAttributes, accountAttributes]);

  return (
    <ScriptEditor
      scriptValue={value?.data}
      lang={value?.lang || "typescript"}
      onScriptChange={(script) =>
        onChange({ data: script, lang: value?.lang || "typescript" })
      }
      onLangChange={(lang) => onChange({ data: value?.data || "", lang })}
      typescriptTypes={attributeTypes}
    />
  );
}
