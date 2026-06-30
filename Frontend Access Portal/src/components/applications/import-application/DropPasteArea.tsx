import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { File, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DropPasteArea<T>({
  className,
  onData,
}: {
  className?: string;
  onData: (data: T) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const tErrors = useTranslations("errors");

  const parseJson = useCallback(
    (text: string) => {
      try {
        onData(JSON.parse(text) as T);
      } catch {
        toast.error(tErrors("json.parse-failed.title"), {
          description: tErrors("json.parse-failed.description"),
        });
      }
    },
    [onData, tErrors],
  );

  const handleFile = (file: File | Blob | undefined) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        parseJson(reader.result);
      }
    };
    reader.onerror = () => {
      toast.error(tErrors("file.read-fail.title"), {
        description: tErrors("file.read-fail.description"),
      });
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const t = useTranslations("common.drag-drop-area");

  return (
    <div
      tabIndex={0}
      className={cn(
        "border-2 border-dashed rounded-md p-4 h-full flex flex-col items-center justify-center gap-2 cursor-pointer text-muted-foreground",
        className,
        isHovered ? "border-primary" : "border-muted",
      )}
      onDragOver={(e) => {
        const fileItems = [...e.dataTransfer.items].filter(
          (item) => item.kind === "file",
        );
        if (fileItems.length > 0) {
          e.preventDefault();
          if (
            fileItems.some((item) => item.type.startsWith("application/json"))
          ) {
            e.dataTransfer.dropEffect = "copy";
            setIsHovered(true);
          } else {
            e.dataTransfer.dropEffect = "none";
            setIsHovered(false);
          }
        }
      }}
      onDragLeave={() => {
        setIsHovered(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        handleFile(file);
        setIsHovered(false);
      }}
      onPaste={(e) => {
        // Check for file first
        const file = e.clipboardData.files[0];
        if (file) {
          handleFile(file);
          return;
        }

        // Check for text data (JSON string)
        const text = e.clipboardData.getData("text/plain");
        if (text) {
          parseJson(text);
        }
      }}
    >
      <FileText className="size-15 mb-2 text-muted-foreground" />
      <Input
        type="file"
        accept=".json"
        id="file-input"
        onChange={handleFileChange}
        className="max-w-80"
        parentClassName="w-fit"
      />
      <div className="flex flex-col items-center">
        <p className="text-sm">{t("title")}</p>
        <p className="text-sm">
          {t("supported-file-types", { files: "*.json" })}
        </p>
      </div>
    </div>
  );
}
