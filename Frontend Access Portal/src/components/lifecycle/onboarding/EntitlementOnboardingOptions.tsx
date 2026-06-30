
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, Upload, FileText, Download, 
  Shield, Workflow, Database 
} from 'lucide-react';

interface EntitlementOnboardingOptionsProps {
  entitlementType: 'standard' | 'sensitive' | 'admin';
}

export function EntitlementOnboardingOptions({ entitlementType }: EntitlementOnboardingOptionsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const getTemplateOptions = () => {
    switch (entitlementType) {
      case 'standard':
        return [
          { id: 'read-access', name: 'Read Access', description: 'Basic read-only permission template' },
          { id: 'user-data', name: 'User Data Access', description: 'Standard user data access rights' },
          { id: 'report-view', name: 'Report Viewer', description: 'Report viewing permissions' },
          { id: 'basic-app', name: 'Basic App Access', description: 'Standard application access' }
        ];
      case 'sensitive':
        return [
          { id: 'financial-data', name: 'Financial Data Access', description: 'Access to financial information' },
          { id: 'pii-access', name: 'PII Data Access', description: 'Personal identifiable information access' },
          { id: 'approval-rights', name: 'Approval Rights', description: 'Transaction approval capabilities' },
          { id: 'sensitive-reports', name: 'Sensitive Reports', description: 'Access to sensitive reporting' }
        ];
      case 'admin':
        return [
          { id: 'sys-admin', name: 'System Administrator', description: 'Full system administrative rights' },
          { id: 'user-admin', name: 'User Administrator', description: 'User management capabilities' },
          { id: 'security-admin', name: 'Security Administrator', description: 'Security configuration rights' },
          { id: 'db-admin', name: 'Database Administrator', description: 'Database administrative access' }
        ];
      default:
        return [];
    }
  };

  const handleCloneEntitlement = () => {
    console.log('Clone entitlement functionality');
    // TODO: Implement clone functionality
  };

  const handleImportData = () => {
    console.log('Import entitlement data functionality');
    // TODO: Implement import functionality
  };

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    console.log('Using template:', templateId);
    // TODO: Implement template loading
  };

  const handleExportTemplate = () => {
    console.log('Export entitlement template functionality');
    // TODO: Implement export functionality
  };

  const templates = getTemplateOptions();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleCloneEntitlement}>
          <Copy className="h-4 w-4 mr-2" />
          Clone Entitlement
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleImportData}>
          <Upload className="h-4 w-4 mr-2" />
          Import Data
        </Button>

        <div className="relative group">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Use Template
            <span className="ml-1 text-xs">▼</span>
          </Button>
          
          {/* Template Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <div className="p-2">
              <div className="text-xs font-medium text-slate-600 mb-2 px-2">Available Templates</div>
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleUseTemplate(template.id)}
                  className={`w-full text-left p-2 rounded hover:bg-blue-50 transition-colors ${
                    selectedTemplate === template.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-slate-600">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {selectedTemplate && (
          <Badge variant="secondary" className="text-xs">
            Template: {templates.find(t => t.id === selectedTemplate)?.name}
          </Badge>
        )}
        
        <div className="flex items-center space-x-1 text-xs text-slate-500">
          <Database className="h-3 w-3" />
          <span>Auto-save enabled</span>
        </div>
        
        <Button variant="ghost" size="sm" onClick={handleExportTemplate}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
