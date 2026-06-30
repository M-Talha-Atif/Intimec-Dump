import { ScriptEditorContent } from "@/components/script-editor/schema";
import ScriptEditor from "@/components/script-editor/ScriptEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface DialogScriptEditorProps extends React.ComponentProps<typeof Button> {
  onSave: (data: ScriptEditorContent) => void;
  externalValue: ScriptEditorContent | undefined;
  typescriptTypes?: string;
}

export default function DialogScriptEditor({
  onSave,
  children,
  externalValue,
  typescriptTypes,
  ...props
}: DialogScriptEditorProps) {
  const [lang, setLang] = useState<ScriptEditorContent["lang"]>(
    externalValue?.lang || "typescript"
  ); // use default ts
  const [value, setValue] = useState<ScriptEditorContent["data"]>(
    externalValue?.data || ""
  );
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          // reset script data to external value
          setLang(externalValue?.lang || "typescript");
          setValue(externalValue?.data || "");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button {...props}>{children}</Button>
      </DialogTrigger>
      <DialogContent
        className="flex flex-col h-[70svh] sm:max-w-[70svw]"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Script Editor</DialogTitle>
          <DialogDescription>
            Write your script in the editor below.
          </DialogDescription>
        </DialogHeader>
        <ScriptEditor
          scriptValue={value}
          onScriptChange={setValue}
          lang={lang}
          onLangChange={setLang}
          className="flex-1"
          typescriptTypes={typescriptTypes}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" onClick={() => onSave({ lang, data: value })}>
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
