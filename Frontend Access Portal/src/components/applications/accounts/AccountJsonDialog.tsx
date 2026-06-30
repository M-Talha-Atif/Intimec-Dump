import type { Dispatch, SetStateAction } from "react";

import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Copy } from "lucide-react";

import SyntaxHighlighter from "react-syntax-highlighter";
import { custonTheme } from "./JSONTheme";

import { toast } from "sonner";
import { JetBrains_Mono } from "next/font/google";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jetbrains-mono",
});

interface AccountJsonDialogProps {
  isOpen: boolean;
  onClose: Dispatch<SetStateAction<boolean>>;
  accountData: Record<string, unknown>;
}

export default function AccountJsonDialog({
  isOpen,
  onClose,
  accountData,
}: AccountJsonDialogProps) {
  const handleCopyJson = () => {
    navigator.clipboard
      .writeText(JSON.stringify(accountData, null, 2))
      .then(() => {
        toast("JSON copied to clipboard", {
          description: "You can now paste it wherever you need.",
        });
      })
      .catch(() => {
        toast.error("Failed to copy JSON", {
          description: "Please try again.",
        });
      });
  };
  if (!isOpen) return null; // Don't render if dialog is not open
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-y-hidden max-w-[90vw] w-auto ">
        <DialogHeader>
          <DialogTitle>Account JSON</DialogTitle>
          <DialogDescription>
            This is the raw JSON data for the selected account.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] w-fit max-w-[70vw] rounded-md border-1">
          <SyntaxHighlighter
            language="json"
            style={custonTheme}
            showLineNumbers
            customStyle={{
              padding: "1rem",
            }}
            codeTagProps={{
              style: { fontFamily: jetBrainsMono.style.fontFamily },
            }}
          >
            {JSON.stringify(accountData, null, 2)}
          </SyntaxHighlighter>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <DialogFooter>
          <Button onClick={handleCopyJson}>
            {" "}
            <Copy />
            Copy JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
