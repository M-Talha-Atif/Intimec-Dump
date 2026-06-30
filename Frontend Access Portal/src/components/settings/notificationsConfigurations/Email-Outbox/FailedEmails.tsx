import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { RenderEmailTable } from "./RenderEmailTable";
import { EmailOutboxItem } from "@/types/email-outbox";
import { EmailPreviewModel } from "./EmailPreviewModel";
import CustomPagination from "@/components/applications/common/CustomPagination";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { getFetcher } from "@/hooks/applications/fetcher";


export const FailedEmails: React.FC<{
  totalElements?: number;
}> = ({ totalElements = 0 }) => {

  const [selectedEmail, setSelectedEmail] = useState<EmailOutboxItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const searchParams = useSearchParams();
  const pageSize = parseInt(searchParams.get("size") || "25", 10);

  const url = `/api/email/outbox/failed?${searchParams.toString()}`;
  const { data: response, isLoading } = useSWR(url, getFetcher("Couldnt load failed emails"), {
    keepPreviousData: true,
  });


  const failedEmails = response ? response.data : null;

  const handlePreviewEmail = (email: EmailOutboxItem) => {
    setSelectedEmail(email);
    setIsPreviewOpen(true);
  };
  const handleRetryEmail = async (emailId: string) => {
    console.log(emailId)
    try {
      // Simulate retry operation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // toast({
      //   description: "Email queued for retry",
      //   duration: 3000,
      // });
    } catch (error) {
      console.error(error);
      // toast({
      //   variant: "destructive",
      //   description: "Failed to retry email",
      //   duration: 3000,
      // });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>Failed Email Deliveries</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RenderEmailTable
            emails={failedEmails}
            showRetry={true}
            handlePreviewEmail={handlePreviewEmail}
            handleRetryEmail={handleRetryEmail}
            emptyMessage="No failed emails found"
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
