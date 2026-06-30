
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Code, Play, History, Plus, TestTube, Zap } from 'lucide-react';

const AIDeveloperUtils = () => {
  const [testPrompt, setTestPrompt] = useState('');
  const [testPayload, setTestPayload] = useState('{\n  "user": "john.doe",\n  "role": "admin",\n  "query": "Show me recent access requests"\n}');
  const [selectedFeature, setSelectedFeature] = useState('ai-assistant');
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const promptVersions = [
    { version: '1.0', date: '2024-01-15', description: 'Initial prompt template' },
    { version: '1.1', date: '2024-01-20', description: 'Added security focus' },
    { version: '1.2', date: '2024-01-25', description: 'Enhanced structured output' }
  ];

  const runTest = async () => {
    setIsRunning(true);
    setTestResult(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResult(`✅ Test successful!\n\nResponse:\n{\n  "analysis": "The query requests recent access requests which is a common administrative task.",\n  "recommendations": ["Check approval workflow", "Verify user permissions"],\n  "riskLevel": "low",\n  "responseTime": "1.2s"\n}`);
    } catch (error) {
      setTestResult('❌ Test failed: ' + error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Prompt Test Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Prompt Test Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Feature</Label>
                <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai-assistant">AI Assistant (Global)</SelectItem>
                    <SelectItem value="log-analysis">Log Analysis & Root Cause</SelectItem>
                    <SelectItem value="pattern-analysis">Log Pattern Detection</SelectItem>
                    <SelectItem value="role-ai-assistant">Role AI Assistant</SelectItem>
                    <SelectItem value="mapping-assistant">AI Mapping Assistant</SelectItem>
                    <SelectItem value="schema-suggestions">Schema AI Suggestions</SelectItem>
                    <SelectItem value="access-matrix-analysis">Access Matrix Analysis</SelectItem>
                    <SelectItem value="workflow-generation">Workflow Generation</SelectItem>
                    <SelectItem value="entitlement-assistant">Entitlement AI Assistant</SelectItem>
                    <SelectItem value="role-mining">Role Mining & Discovery</SelectItem>
                    <SelectItem value="ai-recommendations">AI Recommendations Engine</SelectItem>
                    <SelectItem value="connector-config">App Connector Config</SelectItem>
                    <SelectItem value="behavioral-analytics">Behavioral Analytics</SelectItem>
                    <SelectItem value="access-review-analysis">AI Access Review Analysis</SelectItem>
                    <SelectItem value="sod-violation-detection">SoD Violation Detection</SelectItem>
                    <SelectItem value="risk-scoring">Risk Scoring Engine</SelectItem>
                    <SelectItem value="nhi-insights">Non-Human Identity Insights</SelectItem>
                    <SelectItem value="access-request-risk">Access Request Risk Assessment</SelectItem>
                    <SelectItem value="lifecycle-prediction">Lifecycle Event Prediction</SelectItem>
                    <SelectItem value="compliance-gap-analysis">Compliance Gap Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Test Prompt</Label>
                <Textarea
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter your test prompt..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Sample Payload (JSON)</Label>
                <Textarea
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={runTest} disabled={isRunning} className="w-full">
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Running Test...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Test
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Test Result</Label>
                <div className="min-h-64 p-3 border rounded-lg bg-slate-50 font-mono text-sm whitespace-pre-wrap">
                  {testResult || 'Run a test to see results...'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add AI to Feature */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add AI to New Feature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Component Name</Label>
                <Input placeholder="e.g., UserAnalysisPanel" />
              </div>
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="button">Button Click</SelectItem>
                    <SelectItem value="auto">Auto-trigger</SelectItem>
                    <SelectItem value="modal">Modal Open</SelectItem>
                    <SelectItem value="tab">Tab Switch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Input Data Type</Label>
                <Input placeholder="e.g., user profile, logs, workflow" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kpi">KPI Cards</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="structured">Structured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Initial Prompt Template</Label>
                <Textarea 
                  placeholder="Enter the base prompt template..."
                  rows={3}
                />
              </div>
              <Button variant="outline" className="w-full">
                <Code className="h-4 w-4 mr-2" />
                Generate Code Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Version History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Prompt Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {promptVersions.map((version, index) => (
              <div key={version.version} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? "default" : "outline"}>
                    v{version.version}
                  </Badge>
                  <div>
                    <div className="font-medium">{version.description}</div>
                    <div className="text-sm text-slate-500">{version.date}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                  {index !== 0 && (
                    <Button variant="outline" size="sm">
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Optimization Suggestions</h4>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <div className="font-medium text-blue-800">Reduce Token Usage</div>
                  <div className="text-sm text-blue-600">
                    Average token usage is 15% above optimal. Consider shorter prompts.
                  </div>
                </div>
                <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                  <div className="font-medium text-green-800">Cache Frequent Queries</div>
                  <div className="text-sm text-green-600">
                    30% of queries are repeated. Enable caching for better performance.
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Current Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Avg Response Time</span>
                  <Badge variant="outline">1.2s</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Token Efficiency</span>
                  <Badge variant="outline">85%</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Cache Hit Rate</span>
                  <Badge variant="outline">12%</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Error Rate</span>
                  <Badge variant="outline">1.5%</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIDeveloperUtils;
