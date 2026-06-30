import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { RenderEmailTable } from "./RenderEmailTable";
import { EmailOutboxItem } from "@/types/email-outbox";
import { EmailPreviewModel } from "./EmailPreviewModel";
import CustomPagination from "@/components/applications/common/CustomPagination";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { getFetcher } from "@/hooks/applications/fetcher";

// Filter the mock data to only include sent emails


export const SentEmails: React.FC<{
  totalElements?: number;
}> = ({ totalElements = 0 }) => {

  const [selectedEmail, setSelectedEmail] = useState<EmailOutboxItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // const loading = useRef(false);
  const searchParams = useSearchParams();
  const pageSize = parseInt(searchParams.get("size") || "25", 10);

  const url = `/api/email/outbox/sent?${searchParams.toString()}`;
  const { data: response, isLoading } = useSWR(url, getFetcher("Couldnt load sent emails"), {
    keepPreviousData: true,
  });


  const sentEmails = response ? response.data : null;

  const handlePreviewEmail = (email: EmailOutboxItem) => {
    setSelectedEmail(email);
    setIsPreviewOpen(true);
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Successfully Delivered Emails</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RenderEmailTable
            emails={sentEmails}
            showRetry={false}
            handlePreviewEmail={handlePreviewEmail}
            emptyMessage="No sent emails found"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
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
