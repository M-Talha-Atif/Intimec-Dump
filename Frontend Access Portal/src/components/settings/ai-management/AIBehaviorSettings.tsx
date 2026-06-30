
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AIBehaviorConfig } from './types/ai-management-types';

const AIBehaviorSettings = () => {
  const [config, setConfig] = useState<AIBehaviorConfig>({
    enabledFeatures: ['ai-assistant', 'log-analysis', 'pattern-analysis', 'role-ai-assistant', 'access-matrix-analysis', 'workflow-generation', 'role-mining', 'ai-recommendations', 'behavioral-analytics', 'access-review-analysis', 'sod-violation-detection', 'risk-scoring', 'nhi-insights', 'access-request-risk', 'compliance-gap-analysis', 'mapping-assistant', 'connector-config', 'entitlement-assistant'],
    responseMode: 'streaming',
    defaultLanguage: 'en',
    autoRetryCount: 3,
    fallbackToMock: true,
    confidenceThreshold: 0.7,
    showInputPrompts: true,
    backgroundProcessing: false
  });

  const features = [
    { id: 'ai-assistant', name: 'AI Assistant (Global)' },
    { id: 'log-analysis', name: 'Log Analysis & Root Cause' },
    { id: 'pattern-analysis', name: 'Log Pattern Detection' },
    { id: 'role-ai-assistant', name: 'Role AI Assistant' },
    { id: 'mapping-assistant', name: 'AI Mapping Assistant' },
    { id: 'schema-suggestions', name: 'Schema AI Suggestions' },
    { id: 'access-matrix-analysis', name: 'Access Matrix Analysis' },
    { id: 'workflow-generation', name: 'Workflow Generation' },
    { id: 'entitlement-assistant', name: 'Entitlement AI Assistant' },
    { id: 'role-mining', name: 'Role Mining & Discovery' },
    { id: 'ai-recommendations', name: 'AI Recommendations Engine' },
    { id: 'connector-config', name: 'Application Connector Config' },
    { id: 'behavioral-analytics', name: 'Behavioral Analytics' },
    { id: 'access-review-analysis', name: 'AI Access Review Analysis' },
    { id: 'sod-violation-detection', name: 'SoD Violation Detection' },
    { id: 'risk-scoring', name: 'Risk Scoring Engine' },
    { id: 'nhi-insights', name: 'Non-Human Identity Insights' },
    { id: 'access-request-risk', name: 'Access Request Risk Assessment' },
    { id: 'lifecycle-prediction', name: 'Lifecycle Event Prediction' },
    { id: 'compliance-gap-analysis', name: 'Compliance Gap Analysis' }
  ];

  const toggleFeature = (featureId: string) => {
    setConfig(prev => ({
      ...prev,
      enabledFeatures: prev.enabledFeatures.includes(featureId)
        ? prev.enabledFeatures.filter(id => id !== featureId)
        : [...prev.enabledFeatures, featureId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map(feature => (
              <div key={feature.id} className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{feature.name}</Label>
                </div>
                <Switch
                  checked={config.enabledFeatures.includes(feature.id)}
                  onCheckedChange={() => toggleFeature(feature.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Response Behavior */}
      <Card>
        <CardHeader>
          <CardTitle>Response Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Response Mode</Label>
              <Select 
                value={config.responseMode} 
                onValueChange={(value: 'streaming' | 'batch') => 
                  setConfig(prev => ({ ...prev, responseMode: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="streaming">🔄 Streaming</SelectItem>
                  <SelectItem value="batch">📦 Batch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Default Language</Label>
              <Select 
                value={config.defaultLanguage} 
                onValueChange={(value) => 
                  setConfig(prev => ({ ...prev, defaultLanguage: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                  <SelectItem value="fr">🇫🇷 French</SelectItem>
                  <SelectItem value="de">🇩🇪 German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Confidence Threshold: {config.confidenceThreshold}</Label>
              <Slider
                value={[config.confidenceThreshold]}
                onValueChange={([value]) => 
                  setConfig(prev => ({ ...prev, confidenceThreshold: value }))
                }
                max={1}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Low (0.1)</span>
                <span>High (1.0)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Auto-Retry Count</Label>
              <Input
                type="number"
                value={config.autoRetryCount}
                onChange={(e) => 
                  setConfig(prev => ({ ...prev, autoRetryCount: parseInt(e.target.value) || 0 }))
                }
                min={0}
                max={10}
                className="w-24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Fallback to Mock Responses</Label>
              <p className="text-sm text-slate-500">Use mock data when LLM is unavailable</p>
            </div>
            <Switch
              checked={config.fallbackToMock}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, fallbackToMock: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Show Input Prompts</Label>
              <p className="text-sm text-slate-500">Display AI prompts to users</p>
            </div>
            <Switch
              checked={config.showInputPrompts}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, showInputPrompts: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Background Processing</Label>
              <p className="text-sm text-slate-500">Run AI analysis in background</p>
            </div>
            <Switch
              checked={config.backgroundProcessing}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, backgroundProcessing: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {config.enabledFeatures.length}
              </div>
              <div className="text-sm text-slate-500">Active Features</div>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-sm">
                {config.responseMode}
              </Badge>
              <div className="text-sm text-slate-500 mt-1">Response Mode</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(config.confidenceThreshold * 100)}%
              </div>
              <div className="text-sm text-slate-500">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {config.autoRetryCount}x
              </div>
              <div className="text-sm text-slate-500">Auto-Retry</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIBehaviorSettings;
