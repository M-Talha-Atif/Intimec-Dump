"use client";
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Clock, 
  Shield, 
  CheckCircle, 
  Settings, 
  AlertTriangle,
  Users,
  Play,
  Edit,
  Sparkles,
  TrendingUp,
  Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Application } from '@/types/application';

interface SmartWorkflowRecommenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
}

interface WorkflowRecommendation {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  estimatedTime: string;
  confidence: number;
  tags: string[];
  steps: Array<{
    id: string;
    name: string;
    type: 'trigger' | 'approval' | 'condition' | 'action' | 'notification';
    description: string;
  }>;
  reasoning: string[];
  complianceFrameworks: string[];
}

const getWorkflowRecommendation = (
  appType: string, 
  appName: string,
  riskLevel: 'low' | 'medium' | 'high', 
  source: string,
  complianceFlags: any
): WorkflowRecommendation => {
  // AI-powered recommendation logic based on IGA best practices
  if (appType === 'HRIS' || appName.toLowerCase().includes('workday') || appName.toLowerCase().includes('hr')) {
    return {
      id: 'hr-onboarding-flow',
      name: 'Employee Lifecycle Management Flow',
      description: 'Automated onboarding/offboarding with role-based provisioning and compliance checks',
      riskLevel: 'medium',
      estimatedTime: '2-4 hours',
      confidence: 95,
      tags: ['HR Integration', 'Lifecycle', 'Automated'],
      steps: [
        { id: '1', name: 'HR Event Trigger', type: 'trigger', description: 'Detect hire/transfer/termination events' },
        { id: '2', name: 'Identity Verification', type: 'condition', description: 'Validate employee identity and department' },
        { id: '3', name: 'Manager Approval', type: 'approval', description: 'Direct manager approves access request' },
        { id: '4', name: 'Role-Based Provisioning', type: 'action', description: 'Auto-provision based on job role and department' },
        { id: '5', name: 'Welcome Notification', type: 'notification', description: 'Send onboarding instructions and credentials' }
      ],
      reasoning: [
        'HRIS systems require automated lifecycle management',
        'High user volume demands automated provisioning',
        'Compliance requires proper approval trails'
      ],
      complianceFrameworks: ['SOX', 'GDPR', 'ISO 27001']
    };
  }

  if (appType === 'ERP' || appType === 'Financial' || riskLevel === 'high') {
    return {
      id: 'high-risk-sod-flow',
      name: 'High-Risk SoD Compliance Flow',
      description: 'Multi-tier approval with segregation of duties checks and time-bound access',
      riskLevel: 'high',
      estimatedTime: '1-3 days',
      confidence: 92,
      tags: ['High Risk', 'SoD', 'Financial Controls'],
      steps: [
        { id: '1', name: 'Access Request', type: 'trigger', description: 'User initiates high-privilege access request' },
        { id: '2', name: 'SoD Conflict Check', type: 'condition', description: 'AI-powered segregation of duties analysis' },
        { id: '3', name: 'Manager Approval', type: 'approval', description: 'Direct manager reviews and approves' },
        { id: '4', name: 'Security Team Review', type: 'approval', description: 'Security team validates risk assessment' },
        { id: '5', name: 'CISO Final Approval', type: 'approval', description: 'CISO approval for critical access' },
        { id: '6', name: 'Time-Bound Provisioning', type: 'action', description: 'Grant access with automatic expiration' },
        { id: '7', name: 'Compliance Audit Log', type: 'notification', description: 'Log all decisions for audit trail' }
      ],
      reasoning: [
        'High-risk applications require multi-tier approval',
        'SoD violations need specialized review',
        'Financial systems demand CISO oversight',
        'Time-bound access reduces long-term risk'
      ],
      complianceFrameworks: ['SOX', 'PCI DSS', 'ISO 27001', 'NIST']
    };
  }

  if (appType === 'SaaS' && (appName.toLowerCase().includes('admin') || appName.toLowerCase().includes('manage'))) {
    return {
      id: 'privileged-admin-flow',
      name: 'Privileged Admin Access Flow',
      description: 'Just-in-time privileged access with peer review and monitoring',
      riskLevel: 'high',
      estimatedTime: '4-8 hours',
      confidence: 88,
      tags: ['Privileged Access', 'JIT', 'Monitoring'],
      steps: [
        { id: '1', name: 'Privileged Request', type: 'trigger', description: 'Request for administrative privileges' },
        { id: '2', name: 'Business Justification', type: 'condition', description: 'Validate business need and urgency' },
        { id: '3', name: 'Peer Review', type: 'approval', description: 'Peer engineer reviews technical necessity' },
        { id: '4', name: 'Security Approval', type: 'approval', description: 'Security team approves elevated access' },
        { id: '5', name: 'JIT Provisioning', type: 'action', description: 'Grant time-limited privileged access' },
        { id: '6', name: 'Activity Monitoring', type: 'action', description: 'Monitor all privileged activities' },
        { id: '7', name: 'Auto-Revocation', type: 'action', description: 'Automatically revoke after time limit' }
      ],
      reasoning: [
        'Admin tools require privileged access controls',
        'Just-in-time access minimizes exposure window',
        'Peer review ensures technical validation',
        'Continuous monitoring detects anomalies'
      ],
      complianceFrameworks: ['NIST', 'ISO 27001', 'CIS Controls']
    };
  }

  // Default standard workflow for other applications
  return {
    id: 'standard-access-flow',
    name: 'Standard Access Request Flow',
    description: 'Streamlined approval workflow for standard business applications',
    riskLevel: 'low',
    estimatedTime: '2-6 hours',
    confidence: 85,
    tags: ['Standard', 'Streamlined', 'Business Apps'],
    steps: [
      { id: '1', name: 'Access Request', type: 'trigger', description: 'User submits access request' },
      { id: '2', name: 'Manager Approval', type: 'approval', description: 'Direct manager reviews and approves' },
      { id: '3', name: 'App Owner Review', type: 'approval', description: 'Application owner validates business need' },
      { id: '4', name: 'Auto-Provisioning', type: 'action', description: 'Automatically provision approved access' },
      { id: '5', name: 'Confirmation Notice', type: 'notification', description: 'Notify user of granted access' }
    ],
    reasoning: [
      'Standard SaaS applications have lower risk profile',
      'Streamlined process improves user experience',
      'App owner ensures business alignment'
    ],
    complianceFrameworks: ['ISO 27001', 'SOC 2']
  };
};

const SmartWorkflowRecommenderModal: React.FC<SmartWorkflowRecommenderModalProps> = ({
  isOpen,
  onClose,
  application
}) => {
  const [recommendation, setRecommendation] = useState<WorkflowRecommendation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setIsAnalyzing(true);
      // Simulate AI analysis
      setTimeout(() => {
        const riskLevel = application.risky || application.category === 'ERP' ? 'high' : 
                         application.category === 'SaaS' ? 'medium' : 'low';
        
        const rec = getWorkflowRecommendation(
          application.category,
          application.name,
          riskLevel,
          application.source,
          {
            hasAccessReviews: application.users > 100,
            requiresJIT: application.category === 'DevOps' || application.name.toLowerCase().includes('admin'),
            hasSoD: application.category === 'ERP' || application.category === 'Financial',
            hasTimebound: riskLevel === 'high'
          }
        );
        setRecommendation(rec);
        setIsAnalyzing(false);
      }, 2000);
    }
  }, [isOpen, application]);

  const handleUseAsIs = () => {
    if (!recommendation) return;

    const workflowContext = {
      appId: application.id,
      appName: application.name,
      appType: application.category,
      designerMode: 'canvas',
      workflowType: 'ai-recommended',
      recommendationId: recommendation.id,
      isLocked: true,
      autoRecommended: true,
      steps: recommendation.steps,
      metadata: {
        confidence: recommendation.confidence,
        reasoning: recommendation.reasoning,
        complianceFrameworks: recommendation.complianceFrameworks
      }
    };

    sessionStorage.setItem('workflowContext', JSON.stringify(workflowContext));
    
    toast({
      title: "Loading AI Recommended Workflow",
      description: `Opening ${recommendation.name} in locked mode...`,
    });

    router.push('/workflows?tab=designer&mode=canvas&locked=true');
    onClose();
  };

  const handleCustomize = () => {
    if (!recommendation) return;

    const workflowContext = {
      appId: application.id,
      appName: application.name,
      appType: application.category,
      designerMode: 'canvas',
      workflowType: 'ai-recommended',
      recommendationId: recommendation.id,
      isLocked: false,
      autoRecommended: true,
      steps: recommendation.steps,
      metadata: {
        confidence: recommendation.confidence,
        reasoning: recommendation.reasoning,
        complianceFrameworks: recommendation.complianceFrameworks
      }
    };

    sessionStorage.setItem('workflowContext', JSON.stringify(workflowContext));
    
    toast({
      title: "Loading AI Recommended Workflow",
      description: `Opening ${recommendation.name} for customization...`,
    });

    router.push('/workflows?tab=designer&mode=canvas');
    onClose();
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'trigger': return <Play className="h-4 w-4" />;
      case 'approval': return <Users className="h-4 w-4" />;
      case 'condition': return <AlertTriangle className="h-4 w-4" />;
      case 'action': return <Settings className="h-4 w-4" />;
      case 'notification': return <CheckCircle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Smart Workflow Recommender
            <Badge variant="outline" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Analyzing {application.name}</h3>
            <p className="text-gray-600 text-center max-w-md">
              Our AI is examining application characteristics, risk profile, and compliance requirements 
              to recommend the optimal workflow configuration...
            </p>
          </div>
        ) : recommendation ? (
          <div className="space-y-6">
            {/* Recommendation Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <Target className="h-5 w-5" />
                      {recommendation.name}
                    </CardTitle>
                    <p className="text-blue-700 mt-1">{recommendation.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskColor(recommendation.riskLevel)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {recommendation.riskLevel.toUpperCase()} RISK
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {recommendation.confidence}% Match
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{recommendation.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{recommendation.steps.length} Steps</span>
                  </div>
                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-1">
                      {recommendation.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommended Workflow Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendation.steps.map((step, idx) => (
                    <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {getStepIcon(step.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{step.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {step.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Reasoning */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Reasoning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendation.reasoning.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {reason}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium mb-2">Compliance Frameworks</h5>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.complianceFrameworks.map((framework, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {framework}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleUseAsIs} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Use As-Is (Locked)
              </Button>
              <Button onClick={handleCustomize} variant="outline" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Customize Further
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default SmartWorkflowRecommenderModal;
