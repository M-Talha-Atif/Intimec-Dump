import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, Loader2, Send, Code, Type, ArchiveRestore } from 'lucide-react';
import { EmailTemplate, TemplateVersion, TriggerTypeVariable } from '../../../../types/emailTemplateTypes';
import { triggerTypes, locales } from './constants';
import { VariablesSidebar } from './VariablesSidebar';
import ScriptEditor from '@/components/script-editor/ScriptEditor';
import { Badge } from '@/components/ui/badge';

interface EmailTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: EmailTemplate;
  onTemplateChange: (template: EmailTemplate) => void;
  isEditing: boolean;
  isSaving: boolean;
  onSave: () => void;
  triggerTypeVariables: TriggerTypeVariable[];
  testRecipient: string;
  onTestRecipientChange: (recipient: string) => void;
  onSendTest: () => void;
  isTesting: boolean;
  editMode: 'visual' | 'html';
  onEditModeChange: (mode: 'visual' | 'html') => void;
  onVersionHistoryClick: () => void;
  versionHistory: TemplateVersion[];
  isRestoring: boolean;
  onRestore: (versionNumber: string) => void;
  hasUnsavedChanges: boolean;
}

export const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({
  isOpen,
  onClose,
  currentTemplate,
  onTemplateChange,
  isEditing,
  isSaving,
  onSave,
  triggerTypeVariables,
  testRecipient,
  onTestRecipientChange,
  onSendTest,
  isTesting,
  editMode,
  onEditModeChange,
  onVersionHistoryClick,
  versionHistory,
  isRestoring,
  onRestore,
  hasUnsavedChanges
}) => {
  const handleInsertVariable = (variable: string) => {
    const newBody = currentTemplate.body + variable;
    onTemplateChange({ ...currentTemplate, body: newBody });
  };

  const handleFieldChange = (field: keyof EmailTemplate, value: any) => {
    onTemplateChange({ ...currentTemplate, [field]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        // When dialog tries to close, call our onClose handler instead
        // This will trigger the confirmation logic in the parent
        onClose();
      }
    }}>
      <DialogContent className="max-w-[95vw] lg:max-w-5xl w-[90vw] p-6 max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle>{isRestoring ? 'Review Template Version' : isEditing ? 'Edit Template' : 'New Template'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={currentTemplate.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="triggerType">Trigger Type</Label>
                <Select
                  value={currentTemplate.triggerType}
                  onValueChange={(value) => handleFieldChange('triggerType', value)}
                >
                  <SelectTrigger id="triggerType">
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="locale">Language/Locale</Label>
                <Select
                  value={currentTemplate.locale}
                  onValueChange={(value) => handleFieldChange('locale', value)}
                >
                  <SelectTrigger id="locale">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locales.map((locale) => (
                      <SelectItem key={locale.value} value={locale.value}>
                        {locale.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  checked={currentTemplate.status}
                  onCheckedChange={(checked) => handleFieldChange('status', checked)}
                />
                <Label>Enable Template</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={currentTemplate.subject}
                onChange={(e) => handleFieldChange('subject', e.target.value)}
                placeholder="Enter email subject (variables supported)"
              />
            </div>

            <div className="flex flex-row items-center justify-between mb-3 w-full">
              <Tabs
                value={editMode}
                onValueChange={(value) => onEditModeChange(value as 'visual' | 'html')}
                className="w-full"
                defaultValue='html'
              >
                <div className="flex items-center justify-between space-x-4">
                  <Label>Email Body</Label>
                  <TabsList>
                    <TabsTrigger value="html">
                      <Code className="h-4 w-4 mr-1" />
                      HTML
                    </TabsTrigger>
                    <TabsTrigger value="visual">
                      <Type className="h-4 w-4 mr-1" />
                      Visual
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="html" forceMount className="data-[state=inactive]:hidden">
                  <ScriptEditor
                    className="h-96 w-full"
                    lang="html"
                    scriptValue={currentTemplate.body}
                    disableLangSelection
                    onScriptChange={(val) => handleFieldChange('body', val || '')}
                  />
                </TabsContent>
                <TabsContent value="visual" className="data-[state=inactive]:hidden">
                  <iframe
                    srcDoc={currentTemplate.body}
                    className='w-full border rounded min-h-96 overflow-auto'
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <Label htmlFor="testRecipient">Test Recipient</Label>
              <div className="flex space-x-2">
                <Input
                  id="testRecipient"
                  value={testRecipient}
                  onChange={(e) => onTestRecipientChange(e.target.value)}
                  placeholder="test@example.com"
                  type="email"
                />
                <Button onClick={onSendTest} disabled={isTesting} variant="outline">
                  {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <VariablesSidebar
            currentTemplate={currentTemplate}
            triggerTypeVariables={triggerTypeVariables}
            isEditing={isEditing}
            onInsertVariable={handleInsertVariable}
            onVersionHistoryClick={onVersionHistoryClick}
            versionHistory={versionHistory}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          {hasUnsavedChanges && (
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800"
            >
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          {isRestoring ? (
            <Button
              onClick={() => onRestore(`${currentTemplate.version}`)}
              variant="default" disabled={isSaving}
            >
              <ArchiveRestore className="h-4 w-4 mr-1 " />
              Restore Version {currentTemplate.version}
            </Button>
          ) :
            (<Button onClick={onSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save Template
            </Button>)}
        </div>
      </DialogContent>
    </Dialog>
  );
};