import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { EmailOutboxItem, EmailOutboxMetadata } from "@/types/email-outbox";
import { SentEmails } from "./Email-Outbox/SentEmails";
import { WaitingEmails } from "./Email-Outbox/WaitingEmails";
import { FailedEmails } from "./Email-Outbox/FailedEmails";

// Mock data for demonstration
export const mockOutboxData: EmailOutboxItem[] = [
  // {
  //   id: "5ce51747-d2dd-4abe-af4e-39917ccf08b9",
  //   recipient: "Dejah99@hotmail.com",
  //   workflowOrigin: "tripudio civis reprehenderit",
  //   status: "waiting",
  //   timestamp: 1759311988723,
  //   emailPreviewData: {
  //     subject: "Videlicet stabilis uberrime crastinus ager acies stillicidium.",
  //     body: "<!doctype html>\n<html>\n  <head>\n    <meta charset=\"utf-8\" />\n    <style>\n      body {\n        font-family: Arial, sans-serif;\n        background: #f9fafb;\n        padding: 20px;\n        color: #111827;\n      }\n      .container {\n        max-width: 600px;\n        margin: 0 auto;\n        background: #ffffff;\n        border-radius: 8px;\n        padding: 24px;\n        box-shadow: 0 2px 6px rgba(0,0,0,0.05);\n      }\n      h1 {\n        font-size: 20px;\n        margin-bottom: 16px;\n        color: #2563eb;\n      }\n      p {\n        font-size: 16px;\n        line-height: 1.5;\n        margin: 0 0 12px;\n      }\n    </style>\n  </head>\n  <body>\n    <div class=\"container\">\n      <h1>Baiulus error cunae ante custodia.</h1>\n      <p>Inflammatio textus verbera aegrotatio.</p>\n      <p>Ullus hic decet substantia.</p>\n    </div>\n  </body>\n</html>"
  //   },
  //   templateId: "67069faf-4ede-46fd-8e6e-82751509ec84",
  //   templateName: "vox solitudo calculus"
  // },
  // {
  //   id: "2",
  //   recipient: "jane.smith@company.com",
  //   workflowOrigin: "Password Reset",
  //   status: "not_sent",
  //   timestamp: "2024-01-15 13:45:00",
  //   emailPreviewData: {
  //     subject: "Password Reset Request",
  //     body: "<div><h2>Password Reset</h2><p>Hello Jane Smith,</p><p>Click the link below to reset your password.</p></div>",
  //   },
  //   error: {
  //     message: "SMTP connection timeout - server unreachable",
  //     retryCount: 3,
  //   },
  //   templateId: "2",
  //   templateName: "Password Reset Request",
  // },
  // {
  //   id: "3",
  //   recipient: "mike.johnson@company.com",
  //   workflowOrigin: "Certification Reminder",
  //   status: "waiting",
  //   timestamp: "2024-01-15 15:00:00",
  //   emailPreviewData: {
  //     subject: "Annual Security Training Due Soon",
  //     body: "<div><h2>Training Reminder</h2><p>Hello Mike Johnson,</p><p>Your annual security training is due in 7 days.</p></div>",
  //   },
  //   templateId: "3",
  //   templateName: "Certification Reminder",
  // },
  // {
  //   id: "4",
  //   recipient: "sarah.wilson@company.com",
  //   workflowOrigin: "Role Assignment",
  //   status: "sent",
  //   timestamp: "2024-01-15 12:15:00",
  //   emailPreviewData: {
  //     subject: "New Role Assignment - Project Manager",
  //     body: "<div><h2>Role Assignment</h2><p>Hello Sarah Wilson,</p><p>You have been assigned the role of Project Manager.</p></div>",
  //   },
  //   templateId: "4",
  //   templateName: "Role Assignment",
  // },
  // {
  //   id: "5",
  //   recipient: "bob.brown@company.com",
  //   workflowOrigin: "Account Locked",
  //   status: "not_sent",
  //   timestamp: "2024-01-15 11:30:00",
  //   emailPreviewData: {
  //     subject: "Account Locked",
  //     body: "<div><h2>Account Locked</h2><p>Hello Bob Brown,</p><p>Your account has been locked due to security concerns.</p></div>",
  //   },
  //   error: {
  //     message: "Invalid recipient email address",
  //     retryCount: 1,
  //   },
  //   templateId: "5",
  //   templateName: "Account Locked",
  // },
  // {
  //   id: "6",
  //   recipient: "lisa.davis@company.com",
  //   workflowOrigin: "Workflow Approval",
  //   status: "waiting",
  //   timestamp: "2024-01-15 16:00:00",
  //   emailPreviewData: {
  //     subject: "Approval Required - Expense Report #2024-001",
  //     body: "<div><h2>Approval Required</h2><p>Hello Lisa Davis,</p><p>An expense report requires your approval.</p></div>",
  //   },
  //   templateId: "6",
  //   templateName: "Workflow Approval",
  // },
];

const EmailOutbox = () => {

  const [metadata, setMetadata] = useState<EmailOutboxMetadata | null>(null);
  const loadedData = useRef(false);

  useEffect(() => {
    if (loadedData.current) return;
    loadMetadata();
    loadedData.current = true;
  }, []);

  const loadMetadata = async () => {
    try {
      const response = await fetch("/api/email/outbox/metadata");
      if (!response.ok) {
        throw new Error("Failed to fetch email outbox metadata");
      }
      const data = await response.json();
      console.log("Email Outbox Metadata:", data);
      // Process metadata as needed
      setMetadata(data.data);
    } catch (error) {
      console.error("Error loading email outbox metadata:", error);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Send className="h-6 w-6 text-brand-teal" />
        <div>
          <h3 className="text-lg font-semibold">Email Outbox</h3>
          <p className="text-sm text-muted-foreground">
            Monitor delivery status of system-generated emails
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{metadata?.sent}</p>
              <p className="text-sm text-muted-foreground">Successfully Sent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertCircle className="h-8 w-8 text-red-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{metadata?.failed}</p>
              <p className="text-sm text-muted-foreground">Failed to Send</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-yellow-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">{metadata?.waiting}</p>
              <p className="text-sm text-muted-foreground">Queued/Waiting</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Tables */}
      <Tabs defaultValue="sent" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sent" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Sent </span>
          </TabsTrigger>
          <TabsTrigger value="not-sent" className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>Not Sent </span>
          </TabsTrigger>
          <TabsTrigger value="waiting" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Waiting </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sent" className="mt-4">
          <SentEmails totalElements={metadata?.sent} />
        </TabsContent>

        <TabsContent value="not-sent" className="mt-4">
          <FailedEmails totalElements={metadata?.failed} />
        </TabsContent>

        <TabsContent value="waiting" className="mt-4">
          <WaitingEmails totalElements={metadata?.waiting} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailOutbox;
