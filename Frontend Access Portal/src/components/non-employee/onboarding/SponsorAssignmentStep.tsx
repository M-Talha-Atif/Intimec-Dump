
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from 'lucide-react';
import { FormData, ValidationErrors } from './types';

interface SponsorAssignmentStepProps {
  formData: FormData;
  validationErrors: ValidationErrors;
  updateFormData: (field: string, value: any) => void;
}

export function SponsorAssignmentStep({ formData, validationErrors, updateFormData }: SponsorAssignmentStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="sponsor">Primary Sponsor *</Label>
        <Select value={formData.sponsor} onValueChange={(value) => updateFormData('sponsor', value)}>
          <SelectTrigger id="sponsor" className={validationErrors.sponsor ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select primary sponsor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jane.smith">Jane Smith (Engineering Manager)</SelectItem>
            <SelectItem value="bob.brown">Bob Brown (Marketing Director)</SelectItem>
            <SelectItem value="carol.wilson">Carol Wilson (Finance VP)</SelectItem>
            <SelectItem value="david.jones">David Jones (IT Director)</SelectItem>
          </SelectContent>
        </Select>
        {validationErrors.sponsor && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.sponsor}</p>
        )}
      </div>

      <div>
        <Label htmlFor="fallbackSponsor">Fallback Sponsor (Recommended)</Label>
        <Select value={formData.fallbackSponsor} onValueChange={(value) => updateFormData('fallbackSponsor', value)}>
          <SelectTrigger id="fallbackSponsor">
            <SelectValue placeholder="Select fallback sponsor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alice.johnson">Alice Johnson (Engineering Director)</SelectItem>
            <SelectItem value="mike.davis">Mike Davis (Operations Manager)</SelectItem>
            <SelectItem value="sarah.wilson">Sarah Wilson (HR Director)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="department">Department *</Label>
        <Select value={formData.department} onValueChange={(value) => updateFormData('department', value)}>
          <SelectTrigger id="department" className={validationErrors.department ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="hr">Human Resources</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
          </SelectContent>
        </Select>
        {validationErrors.department && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.department}</p>
        )}
      </div>

      <div>
        <Label htmlFor="justification">Business Justification *</Label>
        <Textarea
          id="justification"
          placeholder="Explain the business need for this non-employee identity..."
          value={formData.justification}
          onChange={(e) => updateFormData('justification', e.target.value)}
          className={validationErrors.justification ? 'border-red-500' : ''}
          rows={4}
        />
        {validationErrors.justification && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.justification}</p>
        )}
      </div>

      {/* Sponsor Status Validation */}
      {formData.sponsor && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium text-green-800">Sponsor Validation</span>
          </div>
          <div className="mt-2 text-sm text-green-700">
            Primary sponsor is active and has the authority to sponsor non-employee identities.
          </div>
        </div>
      )}
    </div>
  );
}
