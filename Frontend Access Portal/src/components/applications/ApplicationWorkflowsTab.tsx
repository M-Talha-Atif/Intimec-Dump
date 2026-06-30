import React from 'react';
import { Application } from '@/data/mock-applications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Settings, Shield, Clock, Users, Eye, 
  Play, Edit, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ApplicationWorkflowsTabProps {
  application: Application;
}

const ApplicationWorkflowsTab: React.FC<ApplicationWorkflowsTabProps> = ({ application }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateCustomWorkflow = (designerMode: 'canvas' | 'linear' = 'canvas') => {
    const workflowContext = {
      appId: application.id,
      appName: application.name,
      appType: application.category,
      designerMode,
      workflowType: 'custom',
      governanceFlags: {
        hasAccessReviews: (application.accounts?.length || 0) > 50,
        requiresJIT: application.status === 'Connected',
        hasSoD: application.category === 'ERP' || application.category === 'Financial',
        hasTimebound: application.category === 'Contractor Tools'
      }
    };

    // Store context in sessionStorage for the designer to pick up
    sessionStorage.setItem('workflowContext', JSON.stringify(workflowContext));
    
    toast({
      title: "Launching Workflow Designer",
      description: `Opening ${designerMode} designer with ${application.name} context...`,
    });

    // Navigate to workflows page with designer tab active
    navigate('/workflows?tab=designer&mode=' + designerMode);
  };

  const handleUseWorkflowTemplate = (templateType: 'standard' | 'high-risk', designerMode: 'canvas' | 'linear' = 'canvas') => {
    const workflowContext = {
      appId: application.id,
      appName: application.name,
      appType: application.category,
      designerMode,
      workflowType: templateType,
      governanceFlags: {
        hasAccessReviews: (application.accounts?.length || 0) > 50,
        requiresJIT: application.status === 'Connected',
        hasSoD: application.category === 'ERP' || application.category === 'Financial',
        hasTimebound: application.category === 'Contractor Tools'
      }
    };

    sessionStorage.setItem('workflowContext', JSON.stringify(workflowContext));
    
    toast({
      title: "Loading Workflow Template",
      description: `Opening ${templateType} workflow template for ${application.name}...`,
    });

    navigate('/workflows?tab=designer&mode=' + designerMode);
  };

  const handleSmartRecommender = () => {
    toast({
      title: "Smart Workflow Recommender",
      description: `Analyzing ${application.name} to suggest optimal workflow configurations...`,
    });
    
    // Navigate to templates tab to show recommended workflows
    navigate('/workflows?tab=templates');
  };

  const workflowTemplates = [
    {
      id: 'standard',
      name: 'Standard Access Workflow',
      description: 'Manager approval → App owner approval → Provision → Notify',
      complexity: 'Simple',
      estimatedTime: '2-4 hours',
      steps: 6,
      riskLevel: 'low',
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
      stepDetails: [
        '1. Manager Approval',
        '2. Application Owner Review', 
        '3. Auto-Provision',
        '4. Welcome Notification'
      ]
    },
    {
      id: 'high-risk',
      name: 'High-Risk Access Workflow',
      description: 'Manager → Security → SoD evaluation → Manual provision',
      complexity: 'Complex',
      estimatedTime: '1-3 days',
      steps: 8,
      riskLevel: 'high',
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
      stepDetails: [
        '1. Manager Approval',
        '2. Security Team Review',
        '3. Application Owner Approval',
        '4. Manual Provision'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold mb-2">Approval Workflows</h3>
        <p className="text-sm text-gray-600">
          Define default approval flows for access requests to {application.name}
        </p>
      </div>

      {/* Create Custom Workflow Section */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Create Custom Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Design a custom approval workflow tailored to {application.name}'s specific requirements
            and your organization's governance policies.
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={() => handleCreateCustomWorkflow('canvas')}
              className="hover:bg-blue-700 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Canvas Designer
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleCreateCustomWorkflow('linear')}
              className="hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Linear Builder
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pre-built Workflow Templates */}
      <div className="space-y-4">
        {workflowTemplates.map((template) => {
          const IconComponent = template.icon;
          const isDefault = template.id === 'standard';
          
          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${template.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{template.name}</h4>
                        {isDefault && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Default
                          </Badge>
                        )}
                        {template.riskLevel === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            High Risk
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                  </div>
                  <Badge variant={template.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                    {template.complexity}
                  </Badge>
                </div>

                {/* Workflow Steps */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {template.stepDetails.map((step, idx) => (
                      <div key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                          {idx + 1}
                        </div>
                        {step.replace(/^\d+\.\s*/, '')}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      {template.steps} steps
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.estimatedTime}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleUseWorkflowTemplate(template.id as 'standard' | 'high-risk', 'canvas')}
                      className="hover:bg-blue-700 transition-colors"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Use Canvas
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUseWorkflowTemplate(template.id as 'standard' | 'high-risk', 'linear')}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Use Linear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Smart Workflow Recommender */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Smart Workflow Recommender</h4>
                <p className="text-sm text-blue-700">
                  AI-powered workflow suggestions based on {application.name}'s risk profile and usage patterns
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSmartRecommender}
              className="border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Get Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Workflows for this Application */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Existing Workflows
            <Badge variant="secondary">
              Linked to {application.name}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No workflows created yet for {application.name}</p>
            <p className="text-sm">Create your first workflow using the options above</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationWorkflowsTab;
