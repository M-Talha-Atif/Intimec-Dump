"use client";
import { BookLock, SlidersHorizontal, Activity } from "lucide-react";
import {
  SessionControlsCard,
  SessionControlsCardRef,
} from "./SessionControlsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PasswordPoliciesForm, {
  PasswordPoliciesFormRef,
} from "./PasswordPoliciesForm";
import { ActiveSessionsTab } from "./ActiveSessionsTab";
import { useState, useRef } from "react";
import { SimpleConfirmDialog } from "@/components/ui/ConfirmDialog";

/**
 * Main form component that contains both Password Policies and Session Management tabs
 *
 * This component handles tab switching and coordinates with the PasswordPoliciesForm
 * to check for unsaved changes before allowing tab switches.
 */
export const LoginSecurityForm: React.FC = () => {
  // Track which tab is currently active
  const [currentTab, setCurrentTab] = useState("passwordPolicies");

  // References to both forms so we can check if they have unsaved changes
  const passwordFormRef = useRef<PasswordPoliciesFormRef>(null);
  const sessionFormRef = useRef<SessionControlsCardRef>(null);

  // State for our custom tab switching confirmation dialog
  const [showTabSwitchDialog, setShowTabSwitchDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  /**
   * Handle tab change with unsaved changes protection
   *
   * Before switching tabs, we check if the current tab has unsaved changes.
   * If there are, we show our custom confirmation dialog.
   */
  const handleTabChange = (newTab: string) => {
    let hasUnsavedChanges = false;
    let currentFormName = "";

    // Check for unsaved changes based on current tab
    if (currentTab === "passwordPolicies" && newTab !== "passwordPolicies") {
      hasUnsavedChanges = passwordFormRef.current?.hasUnsavedChanges() || false;
      currentFormName = "password policy";
    } else if (
      currentTab === "sessionManagement" &&
      newTab !== "sessionManagement"
    ) {
      hasUnsavedChanges = sessionFormRef.current?.hasUnsavedChanges() || false;
      currentFormName = "session management";
    }

    if (hasUnsavedChanges) {
      // Store the pending tab and show our custom dialog
      setPendingTab(newTab);
      setShowTabSwitchDialog(true);
      return; // Don't switch tabs yet
    }

    // No unsaved changes, switch to the new tab immediately
    setCurrentTab(newTab);
  };

  /**
   * User confirmed they want to ignore changes and switch tabs
   */
  const handleIgnoreChangesAndSwitchTab = () => {
    setShowTabSwitchDialog(false);
    if (pendingTab) {
      setCurrentTab(pendingTab);
      setPendingTab(null);
    }
  };

  /**
   * User cancelled tab switching, stay on current tab
   */
  const handleCancelTabSwitch = () => {
    setShowTabSwitchDialog(false);
    setPendingTab(null);
  };
  return (
    <div className="space-y-6 gap-6 ">
      <div className="lg:col-span-2">
        {/* 
          Controlled tabs component
          - value: Current active tab
          - onValueChange: Our custom handler that checks for unsaved changes
        */}
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <TabsList className="w-full">
            <TabsTrigger value="passwordPolicies">
              <BookLock className="h-4 w-4 mr-1" />
              Password Policies
            </TabsTrigger>
            <TabsTrigger value="sessionManagement">
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Session Management
            </TabsTrigger>
            <TabsTrigger value="activeSessions">
              <Activity className="h-4 w-4 mr-1" />
              Active Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="passwordPolicies">
            {/* 
              Password Policies Form with navigation guard
              The form automatically protects against:
              - Browser navigation (back/forward, refresh, close tab)
              - Router navigation (clicking links, programmatic navigation)
              
              It will show a confirmation dialog asking the user to either:
              - Cancel (stay on page)
              - Ignore Changes (leave and lose changes)
            */}
            <PasswordPoliciesForm ref={passwordFormRef} />
          </TabsContent>

          <TabsContent value="sessionManagement">
            {/* 
              Session Management Form with navigation guard
              The form automatically protects against:
              - Browser navigation (back/forward, refresh, close tab)
              - Router navigation (clicking links, programmatic navigation)
              
              It will show a confirmation dialog asking the user to either:
              - Cancel (stay on page)
              - Ignore Changes (leave and lose changes)
            */}
            <SessionControlsCard ref={sessionFormRef} />
          </TabsContent>

          <TabsContent value="activeSessions">
            {/* 
              Active Sessions Management
              View and manage all active user sessions across the organization
              - View session details (device, location, IP, login time)
              - Terminate individual or multiple sessions
              - Export session data
            */}
            <ActiveSessionsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* 
        Custom confirmation dialog for tab switching with unsaved changes
        This replaces the browser's confirm dialog with our styled dialog
      */}
      <SimpleConfirmDialog
        open={showTabSwitchDialog}
        message="You have unsaved changes. If you switch tabs now, your changes will be lost."
        onIgnoreChanges={handleIgnoreChangesAndSwitchTab}
        onCancel={handleCancelTabSwitch}
      />
    </div>
  );
};
