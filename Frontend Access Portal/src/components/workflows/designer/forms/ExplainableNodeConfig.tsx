"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExplainableNodeConfigProps {
  nodeData: any;
  onChange: (data: any) => void;
}

export const ExplainableNodeConfig: React.FC<ExplainableNodeConfigProps> = ({
  nodeData,
  onChange
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);
  const { toast } = useToast();

  const generateExplanation = async () => {
    setIsGenerating(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockExplanation = {
      purpose: "This step provisions a user account in Active Directory based on HR system data.",
      inputs: [
        { name: "user.firstName", description: "Employee's first name from HR system" },
        { name: "user.lastName", description: "Employee's last name from HR system" },
        { name: "user.email", description: "Corporate email address" }
      ],
      outputs: [
        { name: "accountId", description: "Newly created AD account identifier" },
        { name: "username", description: "Generated username (format: first.last)" }
      ],
      risks: [
        { level: "medium", description: "Account creation grants immediate network access" },
        { level: "low", description: "Default permissions may need review" }
      ],
      compliance: ["SOX", "ISO27001"],
      recommendations: [
        "Add approval step before high-privilege accounts",
        "Enable audit logging for all account creations",
        "Consider adding SoD check if user has existing roles"
      ]
    };

    setExplanation(mockExplanation);
    setIsGenerating(false);
    toast({ title: "Explanation generated", description: "AI analysis complete" });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI-Powered Node Explanation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Get AI-generated explanations of this workflow step's purpose, inputs, outputs, and risks.
          </p>

          <Button onClick={generateExplanation} disabled={isGenerating} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating Explanation...' : 'Generate Explanation'}
          </Button>

          {explanation && (
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Purpose</h4>
                <p className="text-sm text-muted-foreground">{explanation.purpose}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Inputs</h4>
                <div className="space-y-1">
                  {explanation.inputs.map((input: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <Badge variant="outline" className="text-xs">{input.name}</Badge>
                      <span className="text-muted-foreground ml-2">{input.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Outputs</h4>
                <div className="space-y-1">
                  {explanation.outputs.map((output: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <Badge variant="outline" className="text-xs">{output.name}</Badge>
                      <span className="text-muted-foreground ml-2">{output.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Risks</h4>
                <div className="space-y-1">
                  {explanation.risks.map((risk: any, idx: number) => (
                    <div key={idx} className="text-sm flex items-start gap-2">
                      <Badge variant={risk.level === 'high' ? 'destructive' : 'default'} className="text-xs">
                        {risk.level}
                      </Badge>
                      <span className="text-muted-foreground">{risk.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                <div className="space-y-1">
                  {explanation.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-muted-foreground">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
