"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApplicationContext } from "@/contexts/ApplicationContext";
import { useTranslations } from "next-intl";

import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import "@catppuccin/highlightjs/css/catppuccin-mocha.css";
import useApplication from "@/hooks/applications/useApplication";
import ExportJsonButton from "../common/export";
import { copyToClipboard } from "@/utils/debug";
import { Copy, Download, Loader2 } from "lucide-react";
import CodeHighlight from "./common/CodeHighlight";

hljs.registerLanguage("json", json);

export default function ExportApplicationModal() {
  const { modalState, closeApplicationDialog } = useApplicationContext();
  const t = useTranslations("application.export-modal");
  const isOpen =
    modalState?.type === "export-application" && modalState.application != null;

  const { data: application, isLoading } = useApplication(
    modalState?.application?.id ?? null,
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeApplicationDialog();
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", {
              application: modalState?.application?.name ?? "",
            })}
          </DialogDescription>
        </DialogHeader>
        {isLoading && (
          <div className="flex items-center justify-center w-full h-full">
            <Loader2 className="w-12 h-12 text-muted-foreground animate-spin my-12" />
          </div>
        )}

        {application && (
          <CodeHighlight code={JSON.stringify(application, null, 2)} />
        )}
        <DialogFooter>
          <Button
            onClick={(e) => {
              e.preventDefault();
              copyToClipboard(JSON.stringify(application, null, 2));
            }}
            variant="outline"
          >
            <Copy className="w-4 h-4" />
            {t("actions.copy")}
          </Button>
          <ExportJsonButton data={application}>
            <Download className="w-4 h-4" />
            {t("actions.export")}
          </ExportJsonButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
