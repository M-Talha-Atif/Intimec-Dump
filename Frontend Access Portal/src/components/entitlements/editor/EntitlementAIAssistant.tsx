
import React from 'react';
import { Entitlement } from '@/data/mock-entitlements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Lightbulb } from 'lucide-react';

interface EntitlementAIAssistantProps {
  entitlement: Entitlement;
  allEntitlements: Entitlement[];
}

const EntitlementAIAssistant: React.FC<EntitlementAIAssistantProps> = ({
  entitlement,
  allEntitlements
}) => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-900">
          <Bot className="h-5 w-5" />
          <span>AI Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">Smart Recommendations</div>
              <p className="text-sm text-blue-800">
                Consider reviewing similar entitlements in {entitlement.application} for consistency.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EntitlementAIAssistant;
