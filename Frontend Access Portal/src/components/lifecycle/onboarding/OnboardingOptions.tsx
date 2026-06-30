import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, Upload, FileText, Download, 
  Users, Workflow, Database 
} from 'lucide-react';

interface OnboardingOptionsProps {
  identityType: 'employee' | 'non-employee' | 'non-human';
}

export function OnboardingOptions({ identityType }: OnboardingOptionsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const getTemplateOptions = () => {
    switch (identityType) {
      case 'employee':
        return [
          { id: 'standard-employee', name: 'Standard Employee', description: 'Full-time employee with standard access' },
          { id: 'manager', name: 'Manager', description: 'Employee with team management responsibilities' },
          { id: 'intern', name: 'Intern', description: 'Temporary employee with limited access' },
          { id: 'executive', name: 'Executive', description: 'Senior leadership with elevated privileges' }
        ];
      case 'non-employee':
        return [
          { id: 'contractor', name: 'Contractor', description: 'External contractor with project-based access' },
          { id: 'vendor', name: 'Vendor', description: 'Vendor representative with limited system access' },
          { id: 'consultant', name: 'Consultant', description: 'External consultant with specialized access' },
          { id: 'partner', name: 'Partner', description: 'Business partner with collaborative access' }
        ];
      case 'non-human':
        return [
          { id: 'service-account', name: 'Service Account', description: 'Application service account' },
          { id: 'api-integration', name: 'API Integration', description: 'Third-party API integration account' },
          { id: 'monitoring-system', name: 'Monitoring System', description: 'System monitoring and alerting account' },
          { id: 'automation-bot', name: 'Automation Bot', description: 'Process automation service account' }
        ];
      default:
        return [];
    }
  };

  const handleCloneIdentity = () => {
    console.log('Clone identity functionality');
    // TODO: Implement clone functionality
  };

  const handleImportData = () => {
    console.log('Import data functionality');
    // TODO: Implement import functionality
  };

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    console.log('Using template:', templateId);
    // TODO: Implement template loading
  };

  const handleExportTemplate = () => {
    console.log('Export template functionality');
    // TODO: Implement export functionality
  };

  const templates = getTemplateOptions();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleCloneIdentity}>
          <Copy className="h-4 w-4 mr-2" />
          Clone Identity
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
