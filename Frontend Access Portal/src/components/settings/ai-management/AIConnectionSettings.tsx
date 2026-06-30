
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader, TestTube } from 'lucide-react';
import { AIConnectionConfig } from './types/ai-management-types';

const AIConnectionSettings = () => {
  const [config, setConfig] = useState<AIConnectionConfig>({
    provider: 'perplexity',
    apiKey: '',
    baseUrl: 'https://api.perplexity.ai',
    temperature: 0.2,
    maxTokens: 1000,
    systemPrompt: 'You are an AI assistant for an identity and access management platform. Be precise and concise.',
    isConnected: false,
    lastTested: undefined
  });

  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const providers = [
    { value: 'perplexity', label: 'Perplexity AI', baseUrl: 'https://api.perplexity.ai' },
    { value: 'openai', label: 'OpenAI', baseUrl: 'https://api.openai.com/v1' },
    { value: 'claude', label: 'Anthropic Claude', baseUrl: 'https://api.anthropic.com' },
    { value: 'custom', label: 'Custom Provider', baseUrl: '' }
  ];

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      const success = config.apiKey.length > 10; // Simple validation
      
      setTestResult(success ? 'success' : 'error');
      setConfig(prev => ({
        ...prev,
        isConnected: success,
        lastTested: new Date().toISOString()
      }));
    } catch (error) {
      setTestResult('error');
      setConfig(prev => ({ ...prev, isConnected: false }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderChange = (provider: string) => {
    const selectedProvider = providers.find(p => p.value === provider);
    setConfig(prev => ({
      ...prev,
      provider: provider as AIConnectionConfig['provider'],
      baseUrl: selectedProvider?.baseUrl || '',
      isConnected: false,
      lastTested: undefined
    }));
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Connection Status</span>
            <div className="flex items-center gap-2">
              {config.isConnected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <Badge variant="destructive">
                    Disconnected
                  </Badge>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Current Provider</Label>
              <div className="text-lg capitalize">{config.provider}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Last Tested</Label>
              <div className="text-lg">
                {config.lastTested 
                  ? new Date(config.lastTested).toLocaleString()
                  : 'Never'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>LLM Provider</Label>
            <Select value={config.provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providers.map(provider => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your API key..."
              />
            </div>
            <div className="space-y-2">
              <Label>Base URL</Label>
              <Input
                value={config.baseUrl}
                onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://api.example.com"
              />
            </div>
          </div>

          <Button 
            onClick={testConnection} 
            disabled={!config.apiKey || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </Button>

          {testResult && (
            <div className={`p-3 rounded-lg ${
              testResult === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {testResult === 'success' 
                ? '✅ Connection successful! LLM provider is responding correctly.'
                : '❌ Connection failed. Please check your API key and base URL.'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Model Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Temperature: {config.temperature}</Label>
              <Slider
                value={[config.temperature]}
                onValueChange={([value]) => 
                  setConfig(prev => ({ ...prev, temperature: value }))
                }
                max={2}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Conservative (0)</span>
                <span>Creative (2)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={config.maxTokens}
                onChange={(e) => 
                  setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 1000 }))
                }
                min={100}
                max={4000}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>System Prompt</Label>
            <Textarea
              value={config.systemPrompt}
              onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
              rows={4}
              placeholder="Enter system prompt..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Usage Limits & Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Usage & Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <div className="text-sm text-blue-800">Requests Today</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">98.5%</div>
              <div className="text-sm text-green-800">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">1.2s</div>
              <div className="text-sm text-purple-800">Avg Response</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIConnectionSettings;
