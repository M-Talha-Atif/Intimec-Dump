"use client"
import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, FileText, Send } from 'lucide-react';
import EmailServerConfiguration, { EmailServerConfigurationRef } from './notificationsConfigurations/EmailServerConfiguration';
import { SimpleConfirmDialog } from "@/components/ui/ConfirmDialog";
import EmailTemplateManager from './notificationsConfigurations/Email-Template/EmailTemplateManager';
import EmailOutbox from './notificationsConfigurations/EmailOutbox';

const NotificationManagement = () => {
  // Track which tab is currently active
  const [currentTab, setCurrentTab] = useState("email-server");

  // References to forms so we can check if they have unsaved changes
  const emailServerRef = useRef<EmailServerConfigurationRef>(null);

  // State for our custom tab switching confirmation dialog
  const [showTabSwitchDialog, setShowTabSwitchDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  /**
   * Enhanced tab change handler that checks for unsaved changes
   * before allowing tab switches
   */
  const handleTabChange = (newTab: string) => {
    // If it's the same tab, no need to check
    if (newTab === currentTab) return;

    // Check if current form has unsaved changes
    let hasUnsavedChanges = false;

    if (currentTab === "email-server" && emailServerRef.current?.hasUnsavedChanges()) {
      hasUnsavedChanges = true;
    }

    if (hasUnsavedChanges) {
      // Show confirmation dialog
      setPendingTab(newTab);
      setShowTabSwitchDialog(true);
    } else {
      // No unsaved changes, switch immediately
      setCurrentTab(newTab);
    }
  };

  /**
   * Handle user choosing to ignore unsaved changes and switch tabs
   */
  const handleIgnoreChanges = () => {
    if (pendingTab) {
      setCurrentTab(pendingTab);
    }
    setShowTabSwitchDialog(false);
    setPendingTab(null);
  };

  /**
   * Handle user choosing to cancel tab switch (stay on current tab)
   */
  const handleCancelTabSwitch = () => {
    setShowTabSwitchDialog(false);
    setPendingTab(null);
  };

  return (
    <>
      <div className="space-y-6">
        <Tabs value={currentTab} onValueChange={handleTabChange} defaultValue="email-server" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email-server" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Email Server Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="email-templates" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email Template Manager</span>
            </TabsTrigger>
            <TabsTrigger value="email-outbox" className="flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Email Outbox</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email-server" className="mt-4">
            <EmailServerConfiguration ref={emailServerRef} />
          </TabsContent>

          <TabsContent value="email-templates" className="mt-4">
            <EmailTemplateManager />
          </TabsContent>

          <TabsContent value="email-outbox" className="mt-4">
            <EmailOutbox />
          </TabsContent>
        </Tabs>
      </div>
      <SimpleConfirmDialog
        open={showTabSwitchDialog}
        message="You have unsaved email server changes. If you switch tabs now, your changes will be lost."
        onIgnoreChanges={handleIgnoreChanges}
        onCancel={handleCancelTabSwitch}
      />
    </>
  );
};

export default NotificationManagement;
