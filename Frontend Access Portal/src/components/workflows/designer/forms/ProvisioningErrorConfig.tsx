"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Shield, Zap } from 'lucide-react';

interface ProvisioningErrorConfigProps {
  errorHandling: any;
  onChange: (updates: { errorHandling: any }) => void;
}

export const ProvisioningErrorConfig: React.FC<ProvisioningErrorConfigProps> = ({
  errorHandling,
  onChange
}) => {
  const config = errorHandling || {
    retryPolicy: { maxAttempts: 3, backoffStrategy: 'exponential', baseDelay: 1000 },
    compensation: { enabled: false }
  };

  const updateRetryPolicy = (updates: any) => {
    onChange({
      errorHandling: {
        ...config,
        retryPolicy: {
          ...config.retryPolicy,
          ...updates
        }
      }
    });
  };

  const updateCompensation = (updates: any) => {
    onChange({
      errorHandling: {
        ...config,
        compensation: {
          ...config.compensation,
          ...updates
        }
      }
    });
  };

  const commonErrors = [
    { code: 'AD_ACCOUNT_EXISTS', message: 'Account already exists' },
    { code: 'CONNECTION_TIMEOUT', message: 'Connection timeout' },
    { code: 'INVALID_ATTRIBUTE', message: 'Invalid attribute' },
    { code: 'PERMISSION_DENIED', message: 'Permission denied' },
    { code: 'QUOTA_EXCEEDED', message: 'Quota exceeded' },
  ];

  return (
    <Tabs defaultValue="retry" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="retry">Retry Policy</TabsTrigger>
        <TabsTrigger value="catalog">Error Catalog</TabsTrigger>
        <TabsTrigger value="compensation">Compensation</TabsTrigger>
      </TabsList>

      <TabsContent value="retry" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Maximum Attempts</Label>
              <Input
                type="number"
                value={config.retryPolicy?.maxAttempts || 3}
                onChange={(e) => updateRetryPolicy({ maxAttempts: parseInt(e.target.value) })}
                min="1"
                max="10"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Backoff Strategy</Label>
              <Select 
                value={config.retryPolicy?.backoffStrategy || 'exponential'} 
                onValueChange={(value) => updateRetryPolicy({ backoffStrategy: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear (1s, 2s, 3s...)</SelectItem>
                  <SelectItem value="exponential">Exponential (1s, 2s, 4s, 8s...)</SelectItem>
                  <SelectItem value="fibonacci">Fibonacci (1s, 1s, 2s, 3s, 5s...)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Base Delay (ms)</Label>
                <Input
                  type="number"
                  value={config.retryPolicy?.baseDelay || 1000}
                  onChange={(e) => updateRetryPolicy({ baseDelay: parseInt(e.target.value) })}
                  min="100"
                  max="10000"
                  step="100"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Max Delay (ms)</Label>
                <Input
                  type="number"
                  value={config.retryPolicy?.maxDelay || 30000}
                  onChange={(e) => updateRetryPolicy({ maxDelay: parseInt(e.target.value) })}
                  min="1000"
                  max="300000"
                  step="1000"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="catalog" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Common Provisioning Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {commonErrors.map((error, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <Badge variant="outline" className="text-xs">{error.code}</Badge>
                    <p className="text-sm mt-1">{error.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="compensation" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Compensation Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Enable Compensation</Label>
                <p className="text-xs text-muted-foreground">Rollback changes on failure</p>
              </div>
              <Switch
                checked={config.compensation?.enabled || false}
                onCheckedChange={(checked) => updateCompensation({ enabled: checked })}
              />
            </div>

            {config.compensation?.enabled && (
              <div>
                <Label className="text-sm font-medium">Compensation Strategy</Label>
                <Select 
                  value={config.compensation?.strategy || 'rollback'} 
                  onValueChange={(value) => updateCompensation({ strategy: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rollback">Full Rollback</SelectItem>
                    <SelectItem value="partial">Partial Rollback</SelectItem>
                    <SelectItem value="forward">Forward Recovery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
