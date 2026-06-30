
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Mail } from 'lucide-react';
import { EmailTemplate, TriggerTypeVariable } from '../../../../types/emailTemplateTypes';
import { mockVersionHistory } from './constants';
import { createNewTemplate, cloneTemplate } from '../../../../utils/emailTemplate-utils';
import { EmailTemplateService } from './emailTemplateService';
import { EmailTemplateTable } from './EmailTemplateTable';
import { EmailTemplateForm } from './EmailTemplateForm';
import { VersionHistoryModal } from './VersionHistoryModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import CustomPagination from '@/components/applications/common/CustomPagination';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const EmailTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [originalTemplate, setOriginalTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [editMode, setEditMode] = useState<'visual' | 'html'>('html');
  const [triggerTypeVariables, setTriggerTypeVariables] = useState<TriggerTypeVariable[]>([]);
  const [versionHistory, setVersionHistory] = useState(mockVersionHistory);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showCloseConfirmDialog, setShowCloseConfirmDialog] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const loadedData = useRef(false);

  // Calculate if there are unsaved changes by comparing current with original
  const hasUnsavedChanges = currentTemplate && originalTemplate ?
    JSON.stringify(currentTemplate) !== JSON.stringify(originalTemplate) : false;


  const searchParams = useSearchParams();
  const pageSize = parseInt(searchParams.get("size") || "25", 10);

  const handleNewTemplate = () => {
    const newTemplate = createNewTemplate();
    setCurrentTemplate(newTemplate);
    setOriginalTemplate(JSON.parse(JSON.stringify(newTemplate))); // Deep copy
    setIsEditing(false);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges) {
      setShowCloseConfirmDialog(true);
    } else {
      // Close without confirmation if no changes
      setIsEditModalOpen(false);
      setIsRestoring(false);
      setCurrentTemplate(null);
      setOriginalTemplate(null);
    }
  };

  const handleForceClose = () => {
    setShowCloseConfirmDialog(false);
    setIsEditModalOpen(false);
    setIsRestoring(false);
    setCurrentTemplate(null);
    setOriginalTemplate(null);
  };

  const handleCancelClose = () => {
    setShowCloseConfirmDialog(false);
  };

  const handleReview = async (templateId: string, versionNumber: string) => {
    // 1) i want to get the template version details and load it into the form for review
    const res = await EmailTemplateService.getTemplateVersionDetails(templateId, versionNumber);
    setCurrentTemplate(res);
    setOriginalTemplate(JSON.parse(JSON.stringify(res))); // Deep copy
    setIsVersionModalOpen(false);
    setIsEditModalOpen(true);
    setIsRestoring(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    const templateCopy = { ...template };
    setCurrentTemplate(templateCopy);
    setOriginalTemplate(JSON.parse(JSON.stringify(templateCopy))); // Deep copy
    setIsEditing(true);
    setIsEditModalOpen(true);
  };

  const handleCloneTemplate = (template: EmailTemplate) => {
    const clonedTemplate = cloneTemplate(template);
    setCurrentTemplate(clonedTemplate);
    setOriginalTemplate(JSON.parse(JSON.stringify(clonedTemplate))); // Deep copy
    setIsEditing(false);
    setIsEditModalOpen(true);
  };

  const loadTemplateVersions = async () => {
    const versions = await EmailTemplateService.getTemplateVersions(currentTemplate?.id);
    setVersionHistory(versions);
  }

  useEffect(() => {
    if (isEditModalOpen) {
      loadTemplateVersions();
    }
  }, [isEditModalOpen])

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await EmailTemplateService.deleteTemplate(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
    } catch (error) {
      console.error("Error deleting template:", error);
      // Error handling is done in the service
    }
  };

  const handleToggleStatus = async (templateId: string, checked: boolean) => {
    try {
      await EmailTemplateService.updateTemplateStatus(templateId, checked);
      setTemplates(templates.map(t =>
        t.id === templateId ? { ...t, status: checked } : t
      ));
    } catch (error) {
      console.error("Error updating template status:", error);
      // Error handling is done in the service
    }
  };

  const handleSaveTemplate = () => {
    // Show confirmation dialog before saving
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (!currentTemplate) return;

    setShowSaveConfirm(false);
    setIsSaving(true);

    try {
      if (isEditing) {
        await EmailTemplateService.updateTemplate(currentTemplate);
        setTemplates(templates.map(t =>
          t.id === currentTemplate.id
            ? { ...currentTemplate, version: currentTemplate.version + 1 }
            : t
        ));
      } else {
        await EmailTemplateService.createTemplate(currentTemplate);
        const templatesData = await EmailTemplateService.fetchTemplates();
        setTemplates(templatesData);
        // In a real app, you'd refetch the templates or get the ID from the response
      }

      // Reset the original template to current after successful save
      setOriginalTemplate(JSON.parse(JSON.stringify(currentTemplate)));
      setIsEditModalOpen(false);
      setCurrentTemplate(null);
      setOriginalTemplate(null);
    } catch (error) {
      console.error("Error saving template:", error);
      // Error handling is done in the service
    } finally {
      setIsSaving(false);
    }
  };

  const loadTemplatesFromApi = async () => {
    setIsLoading(true);
    try {
      const [templatesData, variablesData] = await Promise.all([
        EmailTemplateService.fetchTemplates(),
        EmailTemplateService.fetchVariables(),
      ]);

      setTemplates(templatesData);
      setTriggerTypeVariables(variablesData);
    } catch (error) {
      console.error("Error loading templates:", error);
      // Error handling is done in the service
      // Fallback to empty array on error
      setTemplates([]);
      setTriggerTypeVariables([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!currentTemplate || !testRecipient) {
      toast.error("Please provide a test recipient email address");
      return;
    }

    setIsTesting(true);
    try {
      await EmailTemplateService.sendTestEmail(
        currentTemplate.subject,
        currentTemplate.body,
        testRecipient
      );
    } catch (error) {
      console.error("Error sending test email:", error);
      // Error handling is done in the service
    } finally {
      setIsTesting(false);
    }
  };

  const handleRestoreVersion = async (versionNumber: string) => {
    await EmailTemplateService.restoreTemplateVersion(currentTemplate?.id, versionNumber);
    const templatesData = await EmailTemplateService.fetchTemplates();
    setTemplates(templatesData);
    setIsVersionModalOpen(false);
    setIsEditModalOpen(false);
    setCurrentTemplate(null);
    setOriginalTemplate(null);
    setIsRestoring(false);
  };

  useEffect(() => {
    if (!loadedData.current) {
      loadTemplatesFromApi();
      loadedData.current = true;
    }
  }, []);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="h-6 w-6 text-brand-teal" />
            <h2 className="text-2xl font-bold">Email Template Manager</h2>
          </div>
          <Button onClick={handleNewTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        <EmailTemplateTable
          templates={templates}
          onEdit={handleEditTemplate}
          onClone={handleCloneTemplate}
          onDelete={handleDeleteTemplate}
          onToggleStatus={handleToggleStatus}
          isLoading={isLoading}
        />

        {currentTemplate && (
          <EmailTemplateForm
            isOpen={isEditModalOpen}
            onClose={handleCloseModal}
            currentTemplate={currentTemplate}
            onTemplateChange={setCurrentTemplate}
            isEditing={isEditing}
            isSaving={isSaving}
            onSave={handleSaveTemplate}
            triggerTypeVariables={triggerTypeVariables}
            testRecipient={testRecipient}
            onTestRecipientChange={setTestRecipient}
            onSendTest={handleSendTest}
            isTesting={isTesting}
            editMode={editMode}
            onEditModeChange={setEditMode}
            onVersionHistoryClick={() => setIsVersionModalOpen(true)}
            versionHistory={versionHistory}
            isRestoring={isRestoring}
            onRestore={handleRestoreVersion}
          />
        )}

        <VersionHistoryModal
          isOpen={isVersionModalOpen}
          onClose={() => setIsVersionModalOpen(false)}
          versionHistory={versionHistory}
          onRestore={handleRestoreVersion}
          onReview={handleReview}
          hasUnsavedChanges={hasUnsavedChanges}
        />

        {/* Save Confirmation Dialog */}
        <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
          <AlertDialogContent className="sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isEditing ? "Update Email Template?" : "Create Email Template?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isEditing
                  ? "Are you sure you want to update this email template? This will create a new version and may affect automated emails."
                  : "Are you sure you want to create this email template? It will be available for use in automated emails."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSave}>
                {isEditing ? "Update Template" : "Create Template"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Discard Changes Dialog */}
        <AlertDialog open={showCloseConfirmDialog} onOpenChange={setShowCloseConfirmDialog}>
          <AlertDialogContent className="sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes to the email template. Are you sure you want to close? All changes will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Editing</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleForceClose}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Discard Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <CustomPagination
        totalPages={Math.ceil(templates.length / pageSize)}
        totalElements={templates.length}
      />
    </>
  );
};

export default EmailTemplateManager;
