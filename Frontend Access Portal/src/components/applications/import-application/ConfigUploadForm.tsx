import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { useImportApplicationContext } from "@/contexts/ImportApplicationContext";
import React, { useState } from "react";
import DropPasteArea from "./DropPasteArea";
import { FinalFormDataOutput } from "@/types/add-application";
import CodeHighlight from "../common/CodeHighlight";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export default function ConfigUploadForm() {
  const { submitConfig, nextStep,config:savedConfig } = useImportApplicationContext();
  const [config, setConfig] = useState<FinalFormDataOutput | null>(savedConfig);

  const tCommon = useTranslations("common");

  return (
    <>
      <div className="flex flex-col gap-4 flex-1 px-4 overflow-hidden">
        <DropPasteArea<FinalFormDataOutput>
          onData={(data) => setConfig(data)}
          className={cn("flex-1/5", !config && "flex-1/2")}
        />
        <CodeHighlight
          code={config ? JSON.stringify(config, null, 2) : ""}
          className={cn("flex-4/5", !config && "flex-1/2")}
        />
      </div>
      <SheetFooter className="flex-row-reverse">
        <Button
          className="w-fit"
          disabled={!config}
          onClick={() => {
            if (config) {
              submitConfig(config);
							nextStep();
            }
          }}
        >
          {tCommon("actions.next")}
        </Button>
      </SheetFooter>
    </>
  );
}
