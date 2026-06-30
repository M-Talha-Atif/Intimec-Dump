import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save, FileText, Trash2, Calendar, User } from 'lucide-react';
import { shortDate } from '@/utils/dateFormat';
import { GlobalImportState } from './GlobalImportModal';
import { useToast } from '@/hooks/use-toast';

interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  appCount: number;
  configuration: Partial<GlobalImportState>;
}

interface ImportTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: GlobalImportState;
  onLoadTemplate: (template: ImportTemplate) => void;
}

export function ImportTemplates({ isOpen, onClose, currentState, onLoadTemplate }: ImportTemplatesProps) {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templates, setTemplates] = useState<ImportTemplate[]>([
    {
      id: 'tpl-001',
      name: 'Standard Employee Onboarding Import',
      description: 'Full account and entitlement import for new employees across all core systems',
      createdBy: 'admin@company.com',
      createdAt: '2024-01-15T10:30:00Z',
      appCount: 5,
      configuration: {
        selectedApps: ['active-directory', 'salesforce', 'workday', 'jira', 'confluence'],
        importConfig: {
          'active-directory': {
            accounts: true,
            entitlements: true,
            aggregationMode: 'full',
            filters: {
              dateFilters: {},
              statusFilters: ['active'],
              ownerFilters: []
            }
          }
        }
      }
    },
    {
      id: 'tpl-002',
      name: 'Quarterly Compliance Scan',
      description: 'Delta import for compliance reporting across high-risk applications',
      createdBy: 'compliance@company.com',
      createdAt: '2024-01-10T14:00:00Z',
      appCount: 3,
      configuration: {
        selectedApps: ['sap', 'oracle-hrms', 'privileged-access'],
        importConfig: {
          'sap': {
            accounts: true,
            entitlements: true,
            aggregationMode: 'delta',
            filters: {
              dateFilters: { lastSeenAfter: '2024-01-01' },
              statusFilters: ['active', 'disabled'],
              ownerFilters: []
            }
          }
        }
      }
    }
  ]);
  const { toast } = useToast();

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Template Name Required",
        description: "Please enter a name for the template.",
        variant: "destructive"
      });
      return;
    }

    const newTemplate: ImportTemplate = {
      id: `tpl-${Date.now()}`,
      name: templateName,
      description: templateDescription,
      createdBy: 'current-user@company.com',
      createdAt: new Date().toISOString(),
      appCount: currentState.selectedApps.length,
      configuration: {
        selectedApps: currentState.selectedApps,
        importConfig: currentState.importConfig
      }
    };

    setTemplates(prev => [newTemplate, ...prev]);
    setTemplateName('');
    setTemplateDescription('');
    setShowSaveForm(false);

    toast({
      title: "Template Saved",
      description: `"${templateName}" has been saved and can be reused for future imports.`
    });
  };

  const handleLoadTemplate = (template: ImportTemplate) => {
    onLoadTemplate(template);
    toast({
      title: "Template Loaded",
      description: `Configuration from "${template.name}" has been applied to the current import.`
    });
    onClose();
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({
      title: "Template Deleted",
      description: "The template has been removed."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <span>Import Templates</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Save Current Configuration */}
          <div className="border-b pb-4">
            {!showSaveForm ? (
              <Button onClick={() => setShowSaveForm(true)} disabled={currentState.selectedApps.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                Save Current Configuration as Template
              </Button>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g., Monthly Compliance Import"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-description">Description (Optional)</Label>
                    <Textarea
                      id="template-description"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      placeholder="Describe when and how this template should be used..."
                      rows={2}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveTemplate}>Save Template</Button>
                    <Button variant="outline" onClick={() => setShowSaveForm(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Existing Templates */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Saved Templates</h3>
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No import templates saved yet</p>
                <p className="text-sm">Save your current configuration to create reusable templates</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="outline">{template.appCount} apps</Badge>
                          </div>
                          {template.description && (
                            <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{template.createdBy}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{shortDate(template.createdAt)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => handleLoadTemplate(template)}>
                            Load Template
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
