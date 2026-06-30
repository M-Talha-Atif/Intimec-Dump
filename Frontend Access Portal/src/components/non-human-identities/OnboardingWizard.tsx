
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  UserPlus, 
  Bot, 
  Key, 
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Users,
  Calendar,
  Settings,
  Target,
  Database,
  Cloud
} from 'lucide-react';

const nhiTypes = [
  { id: 'service-account', name: 'Service Account', icon: Bot, description: 'Application service accounts' },
  { id: 'api-key', name: 'API Key', icon: Key, description: 'API access tokens' },
  { id: 'certificate', name: 'Certificate', icon: Shield, description: 'Digital certificates' },
  { id: 'secret', name: 'Secret', icon: Database, description: 'Application secrets' },
  { id: 'iam-role', name: 'IAM Role', icon: Cloud, description: 'Cloud IAM roles' }
];

const useCases = [
  { id: 'production', name: 'Production Service', risk: 'High', description: 'Production application access' },
  { id: 'development', name: 'Development/Testing', risk: 'Low', description: 'Development environment access' },
  { id: 'automation', name: 'CI/CD Automation', risk: 'Medium', description: 'Build and deployment automation' },
  { id: 'monitoring', name: 'Monitoring/Logging', risk: 'Low', description: 'System monitoring tools' },
  { id: 'backup', name: 'Backup/Archive', risk: 'Medium', description: 'Data backup operations' }
];

const policyChecks = [
  { id: 'naming', name: 'Naming Convention', status: 'pass', message: 'Follows standard naming pattern' },
  { id: 'duration', name: 'Duration Limit', status: 'warning', message: 'Exceeds recommended 90-day limit' },
  { id: 'owner', name: 'Owner Validation', status: 'pass', message: 'Owner is active employee' },
  { id: 'access', name: 'Access Policy', status: 'pass', message: 'Complies with least privilege principle' }
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    useCase: '',
    owner: '',
    expiry: '',
    description: '',
    tags: []
  });

  const steps = [
    { id: 1, name: 'Type Selection', icon: Bot },
    { id: 2, name: 'Use Case & Owner', icon: Target },
    { id: 3, name: 'Expiry & Access', icon: Calendar },
    { id: 4, name: 'Validation & Tags', icon: Settings },
    { id: 5, name: 'Review & Submit', icon: CheckCircle }
  ];

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select NHI Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nhiTypes.map((type) => (
                  <Card 
                    key={type.id} 
                    className={`cursor-pointer transition-all ${formData.type === type.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
                    onClick={() => setFormData({...formData, type: type.id})}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <type.icon className="h-8 w-8 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{type.name}</h4>
                          <p className="text-sm text-slate-600">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Identity Name</label>
              <Input 
                placeholder="e.g., prod-api-service-account"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Follow naming convention: environment-purpose-type</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Use Case & Owner</h3>
              <div className="space-y-4">
                {useCases.map((useCase) => (
                  <Card 
                    key={useCase.id}
                    className={`cursor-pointer transition-all ${formData.useCase === useCase.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
                    onClick={() => setFormData({...formData, useCase: useCase.id})}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{useCase.name}</h4>
                          <p className="text-sm text-slate-600">{useCase.description}</p>
                        </div>
                        <Badge variant={useCase.risk === 'High' ? 'destructive' : useCase.risk === 'Medium' ? 'default' : 'secondary'}>
                          {useCase.risk} Risk
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Owner</label>
              <select 
                className="w-full p-2 border rounded mt-1"
                value={formData.owner}
                onChange={(e) => setFormData({...formData, owner: e.target.value})}
              >
                <option value="">Select owner team</option>
                <option value="platform">Platform Team</option>
                <option value="devops">DevOps Team</option>
                <option value="security">Security Team</option>
                <option value="infrastructure">Infrastructure Team</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="w-full p-2 border rounded mt-1" 
                rows={3}
                placeholder="Describe the purpose and usage of this NHI"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Expiry & Access Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Expiration Date</label>
                <Input 
                  type="date"
                  value={formData.expiry}
                  onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Maximum recommended: 90 days</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Rotation Schedule</label>
                <select className="w-full p-2 border rounded mt-1">
                  <option>Every 30 days</option>
                  <option>Every 60 days</option>
                  <option>Every 90 days</option>
                  <option>Manual only</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Access Permissions</label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Read Access</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Write Access</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Admin Access</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span className="text-sm">Execute Access</span>
                </label>
              </div>
            </div>
            
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Least Privilege Principle</p>
                    <p className="text-xs text-blue-600">Grant only the minimum permissions required for the intended use case.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Policy Validation & Tagging</h3>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Policy Compliance Check</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {policyChecks.map((check) => (
                    <div key={check.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        {check.status === 'pass' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{check.name}</p>
                          <p className="text-xs text-slate-600">{check.message}</p>
                        </div>
                      </div>
                      <Badge variant={check.status === 'pass' ? 'secondary' : 'default'}>
                        {check.status === 'pass' ? 'Pass' : 'Warning'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div>
              <label className="text-sm font-medium">Tags</label>
              <Input 
                placeholder="Add tags (comma-separated)"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Tags help with organization and automated policies</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review & Submit</h3>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">NHI Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Name</p>
                    <p className="font-medium">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Type</p>
                    <p className="font-medium">{nhiTypes.find(t => t.id === formData.type)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Use Case</p>
                    <p className="font-medium">{useCases.find(u => u.id === formData.useCase)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Owner</p>
                    <p className="font-medium">{formData.owner}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Expiry Date</p>
                    <p className="font-medium">{formData.expiry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Description</p>
                    <p className="font-medium">{formData.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium text-green-800">Ready for Provisioning</p>
                    <p className="text-sm text-green-600">All policy checks passed. NHI will be created upon submission.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-slate-600'}`}>
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-slate-400 mx-4" />
                )}
              </div>
            ))}
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        {currentStep < 5 ? (
          <Button onClick={nextStep}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Create NHI
          </Button>
        )}
      </div>
    </div>
  );
}
