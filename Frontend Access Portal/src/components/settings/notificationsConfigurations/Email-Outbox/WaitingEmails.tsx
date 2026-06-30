import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import { RenderEmailTable } from "./RenderEmailTable";
import { EmailOutboxItem } from "@/types/email-outbox";
import { EmailPreviewModel } from "./EmailPreviewModel";
import CustomPagination from "@/components/applications/common/CustomPagination";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { getFetcher } from "@/hooks/applications/fetcher";


export const WaitingEmails: React.FC<{
  totalElements?: number;
}> = ({ totalElements = 0 }) => {
  const [selectedEmail, setSelectedEmail] = useState<EmailOutboxItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);


  const searchParams = useSearchParams();
  const pageSize = parseInt(searchParams.get("size") || "25", 10);

  const url = `/api/email/outbox/queued?${searchParams.toString()}`;
  const { data: response, isLoading } = useSWR(url, getFetcher("Couldnt load queued emails"), {
    keepPreviousData: true,
  });


  const queuedEmails = response ? response.data : null;

  const handlePreviewEmail = (email: EmailOutboxItem) => {
    setSelectedEmail(email);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <span>Queued Email Deliveries</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RenderEmailTable
            emails={queuedEmails}
            showRetry={false}
            handlePreviewEmail={handlePreviewEmail}
            emptyMessage="No queued emails found"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
      {/* Email Preview Modal */}
      <EmailPreviewModel
        selectedEmail={selectedEmail}
        isPreviewOpen={isPreviewOpen}
        setIsPreviewOpen={setIsPreviewOpen}
      />
      <CustomPagination
        totalPages={Math.ceil(totalElements / pageSize)}
        totalElements={totalElements}
      />
    </>
  );
};
