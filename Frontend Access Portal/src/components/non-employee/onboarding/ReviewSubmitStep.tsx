
import React from 'react';
import { FormData } from './types';

interface ReviewSubmitStepProps {
  formData: FormData;
}

export function ReviewSubmitStep({ formData }: ReviewSubmitStepProps) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-3">Review Your Request</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
          </div>
          <div>
            <span className="font-medium">Email:</span> {formData.email}
          </div>
          <div>
            <span className="font-medium">Type:</span> {formData.type}
          </div>
          <div>
            <span className="font-medium">Company:</span> {formData.company || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Contract Period:</span> {formData.startDate} to {formData.endDate}
          </div>
          <div>
            <span className="font-medium">Primary Sponsor:</span> {formData.sponsor}
          </div>
          <div>
            <span className="font-medium">Department:</span> {formData.department}
          </div>
          <div>
            <span className="font-medium">Fallback Sponsor:</span> {formData.fallbackSponsor || 'None'}
          </div>
        </div>
        
        {formData.justification && (
          <div className="mt-3">
            <span className="font-medium">Business Justification:</span>
            <p className="text-gray-700 mt-1">{formData.justification}</p>
          </div>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-2">Next Steps</h4>
        <ol className="list-decimal list-inside text-sm text-green-700 space-y-1">
          <li>Sponsor will receive email notification for approval</li>
          <li>Background check will be initiated (if required)</li>
          <li>Identity will be provisioned upon approval</li>
          <li>Welcome email with access instructions will be sent</li>
        </ol>
      </div>
    </div>
  );
}
