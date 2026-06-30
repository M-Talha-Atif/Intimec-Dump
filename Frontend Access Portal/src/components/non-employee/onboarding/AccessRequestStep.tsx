
import React from 'react';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from 'lucide-react';
import { FormData } from './types';

interface AccessRequestStepProps {
  formData: FormData;
}

export function AccessRequestStep({ formData }: AccessRequestStepProps) {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <span className="font-medium text-yellow-800">Access Restrictions</span>
        </div>
        <div className="mt-2 text-sm text-yellow-700">
          Based on the selected identity type ({formData.type}), certain access restrictions apply:
          <ul className="list-disc list-inside mt-1">
            <li>No privileged administrative access</li>
            <li>All access will auto-expire on contract end date</li>
            <li>Maximum access duration: 180 days</li>
          </ul>
        </div>
      </div>

      <div>
        <Label>Requested Access (Optional - can be configured later)</Label>
        <div className="space-y-2 mt-2">
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Access</div>
                <div className="text-sm text-gray-600">Basic email and calendar access</div>
              </div>
              <Badge variant="default">Standard</Badge>
            </div>
          </div>
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">File Share Access</div>
                <div className="text-sm text-gray-600">Access to departmental shared folders</div>
              </div>
              <Badge variant="secondary">Restricted</Badge>
            </div>
          </div>
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-500">Administrative Access</div>
                <div className="text-sm text-gray-500">Not available for this identity type</div>
              </div>
              <Badge variant="outline">Blocked</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
