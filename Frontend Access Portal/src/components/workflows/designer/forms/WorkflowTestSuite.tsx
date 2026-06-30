"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, CheckCircle, XCircle, TestTube, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowTestSuiteProps {
  workflowData: any;
}

export const WorkflowTestSuite: React.FC<WorkflowTestSuiteProps> = ({
  workflowData
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const runTests = async () => {
    setIsRunning(true);
    setTestResults(null);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockResults = {
      totalTests: 12,
      passed: 10,
      failed: 2,
      duration: 1847,
      tests: [
        { name: "Valid start node exists", status: "passed", duration: 45 },
        { name: "All nodes connected", status: "passed", duration: 67 },
        { name: "End node configured", status: "passed", duration: 34 },
        { name: "No circular dependencies", status: "passed", duration: 123 },
        { name: "Approval nodes have approvers", status: "failed", duration: 89, error: "Approval node 'Manager Approval' missing approver configuration" },
        { name: "SoD conflicts checked", status: "passed", duration: 234 },
        { name: "Required fields populated", status: "passed", duration: 56 },
        { name: "Valid edge guards", status: "passed", duration: 78 },
        { name: "Timeout configurations valid", status: "passed", duration: 43 },
        { name: "Error handling defined", status: "failed", duration: 91, error: "No error handling configured for provisioning step" },
        { name: "Compliance tags present", status: "passed", duration: 34 },
        { name: "Performance under load", status: "passed", duration: 953 },
      ]
    };

    setTestResults(mockResults);
    setIsRunning(false);

    if (mockResults.failed > 0) {
      toast({ title: "Tests completed with failures", description: `${mockResults.failed} of ${mockResults.totalTests} tests failed`, variant: "destructive" });
    } else {
      toast({ title: "All tests passed", description: `${mockResults.passed} tests passed successfully` });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Workflow Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Run comprehensive tests to validate workflow configuration, connectivity, and compliance.
          </p>

          <Button onClick={runTests} disabled={isRunning} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>

          {testResults && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{testResults.totalTests}</div>
                    <div className="text-xs text-muted-foreground">Total Tests</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{testResults.passed}</div>
                    <div className="text-xs text-muted-foreground">Passed</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">{testResults.failed}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Test Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {testResults.tests.map((test: any, idx: number) => (
                    <div key={idx} className="flex items-start justify-between p-2 border rounded">
                      <div className="flex items-start gap-2">
                        {test.status === 'passed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{test.name}</p>
                          {test.error && (
                            <p className="text-xs text-red-600 mt-1">{test.error}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {test.duration}ms
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="text-sm text-muted-foreground">
                Total duration: {testResults.duration}ms
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
