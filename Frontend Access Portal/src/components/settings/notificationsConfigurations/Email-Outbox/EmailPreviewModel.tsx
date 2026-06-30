import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { EmailOutboxItem } from "@/types/email-outbox";
import { formatTimestampToLocal } from "@/utils/timestamp-utils";
import { getStatusBadge } from "./RenderEmailTable";

interface EmailPreviewModelProps {
  selectedEmail: EmailOutboxItem | null;
  isPreviewOpen: boolean;
  setIsPreviewOpen: (open: boolean) => void;
}



export const EmailPreviewModel: React.FC<EmailPreviewModelProps> = ({
  selectedEmail,
  isPreviewOpen,
  setIsPreviewOpen,
}) => {

  return (
    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <DialogContent className="max-w-6xl max-h-[95vh] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Email Preview</span>
          </DialogTitle>
        </DialogHeader>

        {selectedEmail && (
          <div className="space-y-6">
            {/* Email Details */}
            <div className="space-y-4 p-6 bg-muted rounded-lg">
              <div className="flex items-center space-x-3 py-2">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium min-w-fit">Recipient:</span>
                <span className="text-sm break-all">{selectedEmail.recipient}</span>
              </div>
              <div className="flex items-center space-x-3 py-2">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium min-w-fit">Sent:</span>
                <span className="text-sm">
                  {formatTimestampToLocal(selectedEmail.timestamp)}
                </span>
              </div>
              <div className="flex items-center space-x-3 py-2">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium min-w-fit">Origin:</span>
                <span className="text-sm break-all">
                  {selectedEmail.workflowOrigin}
                </span>
              </div>
              <div className="flex items-center space-x-3 py-2">
                <span className="text-sm font-medium min-w-fit">Status:</span>
                {getStatusBadge(selectedEmail.status)}
              </div>
            </div>

            <Separator />

            {/* Email Content */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Subject:
                </label>
                <div className="mt-2 p-4 bg-muted rounded border text-sm font-medium">
                  {selectedEmail.emailPreviewData.subject}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Message Body:
                </label>
                <ScrollArea className="mt-2 h-[400px] border rounded">
                  <iframe
                    // className="prose prose-sm max-w-none w-full h-full"
                    className="w-full h-full min-h-[400px]"
                    srcDoc={selectedEmail.emailPreviewData.body}
                    sandbox=""
                  />
                </ScrollArea>
              </div>

              {selectedEmail.error?.message && (
                <div>
                  <label className="text-sm font-medium text-red-600 mb-2 block">
                    Error Details:
                  </label>
                  <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {selectedEmail.error.message}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}