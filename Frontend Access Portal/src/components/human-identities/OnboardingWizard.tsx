
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Settings,
  Shield,
  Building,
  Mail,
  CreditCard,
  Laptop,
  BookOpen,
  Key
} from 'lucide-react';
import { type OnboardingProgress } from './types';

const onboardingSteps = [
  { id: 'basic-info', name: 'Basic Information', icon: UserPlus, status: 'completed' },
  { id: 'role-assignment', name: 'Role Assignment', icon: Building, status: 'completed' },
  { id: 'access-bundles', name: 'Access Bundles', icon: Key, status: 'in-progress' },
  { id: 'equipment', name: 'Equipment', icon: Laptop, status: 'pending' },
  { id: 'compliance', name: 'Compliance Check', icon: Shield, status: 'pending' },
  { id: 'review', name: 'Manager Review', icon: CheckCircle, status: 'pending' }
];

const accessBundles = [
  {
    id: 'engineering-standard',
    name: 'Engineering Standard Bundle',
    description: 'Standard access for engineering roles',
    items: ['Active Directory', 'GitHub', 'Jira', 'Slack', 'VPN Access'],
    riskLevel: 'Low',
    autoApproved: true
  },
  {
    id: 'engineering-senior',
    name: 'Senior Engineering Bundle',
    description: 'Enhanced access for senior engineers',
    items: ['All Standard Items', 'Production Access', 'Admin Tools', 'Analytics'],
    riskLevel: 'Medium',
    autoApproved: false
  },
  {
    id: 'finance-standard',
    name: 'Finance Standard Bundle',
    description: 'Standard financial system access',
    items: ['Active Directory', 'SAP', 'Tableau', 'Email', 'Expense System'],
    riskLevel: 'Medium',
    autoApproved: true
  }
];

const mockNewHires: OnboardingProgress[] = [
  {
    employeeId: 'emp_new_1',
    overallCompletion: 65,
    startDate: '2024-01-20',
    targetCompletionDate: '2024-01-27',
    milestones: {
      hrPaperwork: { status: 'Completed', completedDate: '2024-01-20' },
      activeDirectory: { status: 'Completed', completedDate: '2024-01-20' },
      email: { status: 'Completed', completedDate: '2024-01-20' },
      badge: { status: 'Pending' },
      equipment: { status: 'Completed', completedDate: '2024-01-21' },
      training: { status: 'Pending' },
      systemAccess: { status: 'Pending' }
    }
  }
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    department: '',
    jobTitle: '',
    manager: '',
    startDate: '',
    selectedBundle: ''
  });

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="wizard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wizard">Onboarding Wizard</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="templates">Bundle Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="wizard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Employee Onboarding Wizard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Progress Stepper */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  {onboardingSteps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index <= currentStep ? 'bg-blue-500 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs mt-1 text-center">{step.name}</span>
                    </div>
                  ))}
                </div>
                <Progress value={(currentStep + 1) / onboardingSteps.length * 100} className="w-full" />
              </div>

              {/* Step Content */}
              <div className="min-h-[400px]">
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <Input 
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <Input 
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          placeholder="Enter last name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <Input 
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Employee ID</label>
                        <Input 
                          value={formData.employeeId}
                          onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                          placeholder="Auto-generated or manual"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <Input 
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Role Assignment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Department</label>
                        <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="hr">Human Resources</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Job Title</label>
                        <Input 
                          value={formData.jobTitle}
                          onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                          placeholder="Enter job title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Manager</label>
                        <Select value={formData.manager} onValueChange={(value) => setFormData({...formData, manager: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="david-kim">David Kim</SelectItem>
                            <SelectItem value="jane-smith">Jane Smith</SelectItem>
                            <SelectItem value="bob-brown">Bob Brown</SelectItem>
                            <SelectItem value="lisa-rodriguez">Lisa Rodriguez</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Access Bundle Selection</h3>
                    <div className="space-y-4">
                      {accessBundles.map((bundle) => (
                        <div 
                          key={bundle.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            formData.selectedBundle === bundle.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          onClick={() => setFormData({...formData, selectedBundle: bundle.id})}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{bundle.name}</h4>
                              <p className="text-sm text-gray-600">{bundle.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={
                                bundle.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {bundle.riskLevel} Risk
                              </Badge>
                              {bundle.autoApproved && (
                                <Badge className="bg-blue-100 text-blue-800">Auto-Approved</Badge>
                              )}
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm font-medium">Included Access:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {bundle.items.map((item, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Equipment Assignment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Laptop className="h-8 w-8 text-blue-600" />
                          <div>
                            <h4 className="font-medium">MacBook Pro 14"</h4>
                            <p className="text-sm text-gray-600">Standard engineering laptop</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-8 w-8 text-green-600" />
                          <div>
                            <h4 className="font-medium">Security Badge</h4>
                            <p className="text-sm text-gray-600">Building access card</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Compliance Check</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Background Check Completed</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>SoD Policy Validation</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Department Access Limits</span>
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Manager Review</h3>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium">Review Summary</h4>
                      <div className="mt-2 space-y-2 text-sm">
                        <p><strong>Employee:</strong> {formData.firstName} {formData.lastName}</p>
                        <p><strong>Role:</strong> {formData.jobTitle} in {formData.department}</p>
                        <p><strong>Manager:</strong> {formData.manager}</p>
                        <p><strong>Access Bundle:</strong> {formData.selectedBundle}</p>
                        <p><strong>Start Date:</strong> {formData.startDate}</p>
                      </div>
                    </div>
                    <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
                      <p className="text-sm">
                        <strong>Manager Approval Required:</strong> This onboarding package requires approval 
                        from the assigned manager before provisioning can begin.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={currentStep === onboardingSteps.length - 1}
                >
                  {currentStep === onboardingSteps.length - 1 ? 'Submit for Approval' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              {mockNewHires.map((hire) => (
                <div key={hire.employeeId} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Emily Davis - Software Engineering Intern</h4>
                    <Badge className="bg-blue-100 text-blue-800">{hire.overallCompletion}% Complete</Badge>
                  </div>
                  
                  <Progress value={hire.overallCompletion} className="w-full" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(hire.milestones).map(([key, milestone]) => (
                      <div key={key} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          {milestone.status === 'Completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        {milestone.completedDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Completed: {milestone.completedDate}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Access Bundle Templates</span>
                <Button>
                  <Settings className="h-4 w-4 mr-1" />
                  Manage Templates
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accessBundles.map((bundle) => (
                  <div key={bundle.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{bundle.name}</h4>
                      <Badge className={
                        bundle.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {bundle.riskLevel} Risk
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{bundle.description}</p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Included Access:</p>
                      {bundle.items.map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs mr-1">
                          {item}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-2 mt-3">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button size="sm">Use Template</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
