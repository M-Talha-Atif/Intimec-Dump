import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Mail,
} from "lucide-react";
import { EmailOutboxItem } from "@/types/email-outbox";
import { formatTimestampToLocal } from "@/utils/timestamp-utils";
import { Skeleton } from "@/components/ui/skeleton";




export const getStatusBadge = (status: EmailOutboxItem["status"]) => {
  switch (status) {
    case "sent":
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Sent
        </Badge>
      );
    case "not_sent":
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    case "waiting":
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Queued
        </Badge>
      );
    default:
      return null;
  }
};

interface PasswordPolicyCardProps {
  emails: EmailOutboxItem[] | null;
  showRetry: boolean;
  isLoading?: boolean;
  handlePreviewEmail: (email: EmailOutboxItem) => void;
  handleRetryEmail?: (emailId: string) => void;
  emptyMessage: string;
}

export const RenderEmailTable: React.FC<PasswordPolicyCardProps> = ({
  emails,
  showRetry = false,
  handlePreviewEmail,
  handleRetryEmail,
  emptyMessage,
  isLoading
}) => {

  console.log("Email count:", emails?.length);

  const SkeletonRow = () => (
    <TableRow className="cursor-not-allowed">
      <TableCell>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
      <TableCell>
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          {showRetry && <Skeleton className="h-8 w-8" />}
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recipient</TableHead>
            <TableHead>Workflow Origin</TableHead>
            <TableHead>Template Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeletons
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : !emails || emails.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            emails.map((email) => (
              <TableRow key={email.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{email.recipient}</span>
                  </div>
                </TableCell>
                <TableCell>{email.workflowOrigin}</TableCell>
                <TableCell>{email.templateName}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {getStatusBadge(email.status)}
                    {email.error?.message && (
                      <div
                        className="text-xs text-red-600 max-w-xs truncate"
                        title={email.error.message}
                      >
                        {email.error.message}
                      </div>
                    )}
                    {email.error?.retryCount && email.error.retryCount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Retry attempts: {email.error.retryCount}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">
                      {formatTimestampToLocal(email.timestamp)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreviewEmail(email)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {showRetry && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetryEmail && handleRetryEmail(email.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
};
