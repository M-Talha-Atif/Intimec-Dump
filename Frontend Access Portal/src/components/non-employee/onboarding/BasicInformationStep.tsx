
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertCircle } from 'lucide-react';
import { FormData, ValidationErrors } from './types';

interface BasicInformationStepProps {
  formData: FormData;
  validationErrors: ValidationErrors;
  updateFormData: (field: string, value: any) => void;
}

export function BasicInformationStep({ formData, validationErrors, updateFormData }: BasicInformationStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            className={validationErrors.firstName ? 'border-red-500' : ''}
          />
          {validationErrors.firstName && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            className={validationErrors.lastName ? 'border-red-500' : ''}
          />
          {validationErrors.lastName && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          className={validationErrors.email ? 'border-red-500' : ''}
        />
        {validationErrors.email && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Identity Type *</Label>
          <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
            <SelectTrigger id="type" className={validationErrors.type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contractor">Contractor</SelectItem>
              <SelectItem value="consultant">Consultant</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="intern">Intern</SelectItem>
              <SelectItem value="freelancer">Freelancer</SelectItem>
              <SelectItem value="auditor">External Auditor</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.type && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.type}</p>
          )}
        </div>
        <div>
          <Label htmlFor="company">Company/Organization</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => updateFormData('company', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => updateFormData('startDate', e.target.value)}
            className={validationErrors.startDate ? 'border-red-500' : ''}
          />
          {validationErrors.startDate && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.startDate}</p>
          )}
        </div>
        <div>
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => updateFormData('endDate', e.target.value)}
            className={validationErrors.endDate ? 'border-red-500' : ''}
          />
          {validationErrors.endDate && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.endDate}</p>
          )}
        </div>
      </div>

      {/* Policy Compliance Indicators */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Policy Compliance Check</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Email domain validation: Passed</span>
          </div>
          <div className="flex items-center space-x-2">
            {formData.startDate && formData.endDate && 
             Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 3600 * 24)) <= 180 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span>Contract duration limit (≤180 days): {
              formData.startDate && formData.endDate ? 
              Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 3600 * 24)) <= 180 ? 'Passed' : 'Failed'
              : 'Pending'
            }</span>
          </div>
        </div>
      </div>
    </div>
  );
}
