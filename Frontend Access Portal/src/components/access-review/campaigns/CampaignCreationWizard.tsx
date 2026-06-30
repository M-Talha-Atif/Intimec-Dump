import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Scope from './steps/Step2Scope';
import Step3Reviewers from './steps/Step3Reviewers';
import Step4Configuration from './steps/Step4Configuration';
import Step5Review from './steps/Step5Review';
import { toast } from '@/hooks/use-toast';

// CampaignWizardData interface, defaultWizardData, campaignTemplates
export interface CampaignWizardData {
  name: string;
  description: string;
  campaignType: string;
  riskThreshold: string;
  complianceFrameworks: string[];
  owner: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  template: string;
  recurrence: {
    enabled: boolean;
    frequency: 'none' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
    endDate: string;
  };
  scopeConfig: {
    userFilters?: any;
    roleFilters?: any;
    applicationFilters?: any;
    entitlementFilters?: any;
    sodFilters?: any;
  };
  reviewerStrategy: string;
  selectedReviewers: string[];
  reviewerConfig: {
    loadBalancing: boolean;
    maxItemsPerReviewer?: number;
    enableDelegation: boolean;
    delegationTarget: 'anyone' | 'team' | 'pool';
    delegationMaxDepth: number;
    escalationEnabled: boolean;
    escalationAfterHours: number;
    escalationTo: string;
    secondEscalationAfterHours: number;
    secondEscalationTo: string;
    multiLevel: boolean;
    multiLevelCount: number;
    approvalMode: 'all' | 'any' | 'majority';
    reminderSchedule: number[];
  };
  configuration: {
    startDate: string;
    dueDate: string;
    slaHours: number;
    notificationChannels: string[];
    enableAI: boolean;
    aiConfidenceThreshold: number;
    requireJustification: 'all' | 'revoke' | 'approve' | 'none';
    allowBulkActions: boolean;
    enableSimulation: boolean;
    decisionOptions: string[];
    autoApproveRules: {
      enabled: boolean;
      lowRiskOnly: boolean;
      riskThreshold: number;
      confidenceThreshold: number;
    };
    exceptionHandling: {
      enabled: boolean;
      maxDays: number;
      requireApproval: boolean;
    };
  };
}

const defaultWizardData: CampaignWizardData = {
  name: '',
  description: '',
  campaignType: '',
  riskThreshold: 'medium',
  complianceFrameworks: [],
  owner: '',
  priority: 'medium',
  template: '',
  recurrence: { enabled: false, frequency: 'none', endDate: '' },
  scopeConfig: {},
  reviewerStrategy: 'manager',
  selectedReviewers: [],
  reviewerConfig: {
    loadBalancing: true,
    enableDelegation: true,
    delegationTarget: 'team',
    delegationMaxDepth: 1,
    escalationEnabled: true,
    escalationAfterHours: 48,
    escalationTo: 'manager',
    secondEscalationAfterHours: 96,
    secondEscalationTo: 'admin',
    multiLevel: false,
    multiLevelCount: 2,
    approvalMode: 'all',
    reminderSchedule: [7, 3, 1, 0],
  },
  configuration: {
    startDate: '',
    dueDate: '',
    slaHours: 72,
    notificationChannels: ['email', 'in-app'],
    enableAI: true,
    aiConfidenceThreshold: 80,
    requireJustification: 'all',
    allowBulkActions: true,
    enableSimulation: false,
    decisionOptions: ['approve', 'revoke', 'modify', 'flag'],
    autoApproveRules: {
      enabled: false,
      lowRiskOnly: true,
      riskThreshold: 30,
      confidenceThreshold: 85,
    },
    exceptionHandling: {
      enabled: false,
      maxDays: 90,
      requireApproval: true,
    },
  },
};

const campaignTemplates = [
  {
    id: 'quarterly-user',
    name: 'Quarterly User Access Review',
    description: 'Standard quarterly review of all user access rights',
    defaults: { campaignType: 'user-based', riskThreshold: 'low', recurrence: { enabled: true, frequency: 'quarterly' as const, endDate: '' }, priority: 'medium' as const },
  },
  {
    id: 'sox-compliance',
    name: 'SOX Compliance Review',
    description: 'SOX-mandated financial systems access certification',
    defaults: { campaignType: 'application-based', riskThreshold: 'medium', complianceFrameworks: ['SOX'], priority: 'high' as const },
  },
  {
    id: 'privileged-access',
    name: 'Privileged Access Review',
    description: 'Review of all privileged and administrative access',
    defaults: { campaignType: 'entitlement-based', riskThreshold: 'high', priority: 'critical' as const },
  },
  {
    id: 'new-hire-90day',
    name: 'New Hire 90-Day Review',
    description: 'Post-onboarding access validation for new employees',
    defaults: { campaignType: 'user-based', riskThreshold: 'low', priority: 'medium' as const },
  },
];

const CampaignCreationWizard = ({ onCampaignCreate }: { onCampaignCreate: (campaign: any) => void }) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<CampaignWizardData>({ ...defaultWizardData });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: 'Definition', description: 'Campaign details' },
    { number: 2, title: 'Scope', description: 'Define what to review' },
    { number: 3, title: 'Reviewers', description: 'Assignment & escalation' },
    { number: 4, title: 'Settings', description: 'Automation & SLA' },
    { number: 5, title: 'Review', description: 'Launch campaign' },
  ];

  const updateWizardData = (updates: Partial<CampaignWizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleComplete = (launchType: 'draft' | 'simulate' | 'launch' | 'schedule') => {
    const campaign = {
      id: `campaign-${Date.now()}`,
      name: wizardData.name,
      description: wizardData.description,
      type: wizardData.campaignType,
      status: launchType === 'draft' ? 'draft' : launchType === 'simulate' ? 'simulating' : 'active',
      riskLevel: wizardData.riskThreshold,
      progress: 0,
      totalItems: Math.floor(Math.random() * 500) + 100,
      completedItems: 0,
      dueDate: wizardData.configuration.dueDate,
      createdDate: new Date().toISOString(),
      createdBy: wizardData.owner || 'Current User',
      complianceFrameworks: wizardData.complianceFrameworks,
      reviewers: [],
      configuration: {
        slaHours: wizardData.configuration.slaHours,
        notificationChannels: wizardData.configuration.notificationChannels,
        preReviewSimulation: wizardData.configuration.enableSimulation,
        autoReminder: true,
        reminderFrequency: 24,
        escalationEnabled: wizardData.reviewerConfig.escalationEnabled,
        escalationAfterHours: wizardData.reviewerConfig.escalationAfterHours,
        requireJustification: wizardData.configuration.requireJustification !== 'none',
        allowBulkActions: wizardData.configuration.allowBulkActions,
        enableAIAssist: wizardData.configuration.enableAI,
        confidenceThreshold: wizardData.configuration.aiConfidenceThreshold,
      },
    };

    onCampaignCreate(campaign);
    
    let message = 'Campaign created successfully!';
    if (launchType === 'simulate') message = 'Simulation started. Results will be available shortly.';
    if (launchType === 'schedule') message = 'Campaign scheduled for launch.';
    
    toast({ title: 'Success', description: message });
    setOpen(false);
    setCurrentStep(1);
    setWizardData({ ...defaultWizardData });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return wizardData.name && wizardData.campaignType;
      case 2: return true;
      case 3: return wizardData.reviewerStrategy;
      case 4: return wizardData.configuration.dueDate;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col p-0 h-full">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 py-4">
            <DialogHeader>
              <DialogTitle className="text-xl">Create Access Review Campaign</DialogTitle>
              <DialogDescription>
                Follow the wizard steps to define, scope, and launch a new access review campaign.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 mt-4">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`flex flex-col items-center flex-1 ${
                      step.number === currentStep ? 'text-primary' : step.number < currentStep ? 'text-muted-foreground' : 'text-muted-foreground/50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                        step.number < currentStep
                          ? 'bg-primary text-primary-foreground'
                          : step.number === currentStep
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {step.number < currentStep ? <Check className="h-4 w-4" /> : step.number}
                    </div>
                    <p className="text-xs font-medium">{step.title}</p>
                    <p className="text-xs">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <div className="py-2">
                  {currentStep === 1 && <Step1BasicInfo data={wizardData} updateData={updateWizardData} templates={campaignTemplates} />}
                  {currentStep === 2 && <Step2Scope data={wizardData} updateData={updateWizardData} />}
                  {currentStep === 3 && <Step3Reviewers data={wizardData} updateData={updateWizardData} />}
                  {currentStep === 4 && <Step4Configuration data={wizardData} updateData={updateWizardData} />}
                  {currentStep === 5 && <Step5Review data={wizardData} onComplete={handleComplete} />}
                </div>

                {currentStep < 5 && (
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button onClick={handleNext} disabled={!canProceed()}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignCreationWizard;
