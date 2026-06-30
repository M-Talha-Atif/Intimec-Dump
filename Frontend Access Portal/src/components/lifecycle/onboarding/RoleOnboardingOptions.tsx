
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, Upload, FileText, Download, 
  Shield, Workflow, Database 
} from 'lucide-react';

interface RoleOnboardingOptionsProps {
  roleType: 'business' | 'technical' | 'privileged';
}

export function RoleOnboardingOptions({ roleType }: RoleOnboardingOptionsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const getTemplateOptions = () => {
    switch (roleType) {
      case 'business':
        return [
          { id: 'dept-manager', name: 'Department Manager', description: 'Standard managerial role with team oversight' },
          { id: 'analyst', name: 'Business Analyst', description: 'Analytical role with data access' },
          { id: 'coordinator', name: 'Project Coordinator', description: 'Cross-functional coordination role' },
          { id: 'specialist', name: 'Domain Specialist', description: 'Subject matter expert role' }
        ];
      case 'technical':
        return [
          { id: 'developer', name: 'Application Developer', description: 'Standard development access' },
          { id: 'dba', name: 'Database Administrator', description: 'Database management role' },
          { id: 'devops', name: 'DevOps Engineer', description: 'CI/CD and infrastructure access' },
          { id: 'support', name: 'Technical Support', description: 'User support and troubleshooting' }
        ];
      case 'privileged':
        return [
          { id: 'sys-admin', name: 'System Administrator', description: 'Full system administrative access' },
          { id: 'sec-admin', name: 'Security Administrator', description: 'Security tools and policy management' },
          { id: 'audit-admin', name: 'Audit Administrator', description: 'Audit and compliance management' },
          { id: 'emergency', name: 'Emergency Access', description: 'Break-glass emergency access role' }
        ];
      default:
        return [];
    }
  };

  const handleCloneRole = () => {
    console.log('Clone role functionality');
    // TODO: Implement clone functionality
  };

  const handleImportData = () => {
    console.log('Import role data functionality');
    // TODO: Implement import functionality
  };

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    console.log('Using template:', templateId);
    // TODO: Implement template loading
  };

  const handleExportTemplate = () => {
    console.log('Export role template functionality');
    // TODO: Implement export functionality
  };

  const templates = getTemplateOptions();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleCloneRole}>
          <Copy className="h-4 w-4 mr-2" />
          Clone Role
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
