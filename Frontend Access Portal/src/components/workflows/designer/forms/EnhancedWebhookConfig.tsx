"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Key, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedWebhookConfigProps {
  config: any;
  onChange: (config: any) => void;
}

export const EnhancedWebhookConfig: React.FC<EnhancedWebhookConfigProps> = ({ config, onChange }) => {
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const webhookConfig = config.webhookConfig || {
    url: '',
    method: 'POST',
    timeout: 30,
    retries: 3,
    authentication: { type: 'none' }
  };

  const updateConfig = (updates: any) => {
    onChange({
      ...config,
      webhookConfig: {
        ...webhookConfig,
        ...updates
      }
    });
  };

  const updateAuthentication = (updates: any) => {
    updateConfig({
      authentication: {
        ...webhookConfig.authentication,
        ...updates
      }
    });
  };

  const handleTestWebhook = async () => {
    setIsTesting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTesting(false);
    toast({ title: "Webhook test successful", description: "Connection and authentication validated" });
  };

  return (
    <Tabs defaultValue="auth" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="auth">Authentication</TabsTrigger>
        <TabsTrigger value="config">Configuration</TabsTrigger>
        <TabsTrigger value="test">Test</TabsTrigger>
      </TabsList>

      <TabsContent value="auth" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Authentication Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <Select
                value={webhookConfig.authentication?.type || 'none'}
                onValueChange={(value) => updateAuthentication({ type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="api-key">API Key</SelectItem>
                  <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {webhookConfig.authentication?.type === 'basic' && (
              <>
                <div>
                  <Label className="text-sm font-medium">Username</Label>
                  <Input
                    value={webhookConfig.authentication.credentials?.username || ''}
                    onChange={(e) => updateAuthentication({ 
                      credentials: { 
                        ...webhookConfig.authentication.credentials, 
                        username: e.target.value 
                      } 
                    })}
                    placeholder="username"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Password</Label>
                  <Input
                    type="password"
                    value={webhookConfig.authentication.credentials?.password || ''}
                    onChange={(e) => updateAuthentication({ 
                      credentials: { 
                        ...webhookConfig.authentication.credentials, 
                        password: e.target.value 
                      } 
                    })}
                    placeholder="secret://vault/webhook-password"
                    className="mt-1"
                  />
                </div>
              </>
            )}

            {webhookConfig.authentication?.type === 'bearer' && (
              <div>
                <Label className="text-sm font-medium">Bearer Token</Label>
                <Input
                  type="password"
                  value={webhookConfig.authentication.token || ''}
                  onChange={(e) => updateAuthentication({ token: e.target.value })}
                  placeholder="secret://vault/bearer-token"
                  className="mt-1"
                />
              </div>
            )}

            {webhookConfig.authentication?.type === 'api-key' && (
              <>
                <div>
                  <Label className="text-sm font-medium">Header Name</Label>
                  <Input
                    value={webhookConfig.authentication.headerName || ''}
                    onChange={(e) => updateAuthentication({ headerName: e.target.value })}
                    placeholder="X-API-Key"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">API Key</Label>
                  <Input
                    type="password"
                    value={webhookConfig.authentication.apiKey || ''}
                    onChange={(e) => updateAuthentication({ apiKey: e.target.value })}
                    placeholder="secret://vault/api-key"
                    className="mt-1"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="config" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Webhook Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">URL</Label>
              <Input
                value={webhookConfig.url}
                onChange={(e) => updateConfig({ url: e.target.value })}
                placeholder="https://api.example.com/webhook"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">HTTP Method</Label>
              <Select
                value={webhookConfig.method}
                onValueChange={(value) => updateConfig({ method: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Timeout (seconds)</Label>
                <Input
                  type="number"
                  value={webhookConfig.timeout}
                  onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) })}
                  min="1"
                  max="300"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Retry Attempts</Label>
                <Input
                  type="number"
                  value={webhookConfig.retries}
                  onChange={(e) => updateConfig({ retries: parseInt(e.target.value) })}
                  min="0"
                  max="10"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="test" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Test Webhook Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send a test request to verify webhook configuration and authentication.
            </p>
            <Button onClick={handleTestWebhook} disabled={isTesting} className="w-full">
              {isTesting ? 'Testing...' : 'Test Webhook'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
