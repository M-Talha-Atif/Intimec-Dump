import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Webhook, Plus, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { reportDeliveryService } from '@/services/reportDeliveryService';
import { useToast } from "@/hooks/use-toast";

interface WebhookConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (config: any) => void;
}

export const WebhookConfigModal = ({ open, onOpenChange, onSave }: WebhookConfigModalProps) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [method, setMethod] = useState('POST');
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');
  const [authType, setAuthType] = useState('none');
  const [authToken, setAuthToken] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const { toast } = useToast();

  const addHeader = () => {
    if (headerKey && headerValue) {
      setHeaders(prev => ({ ...prev, [headerKey]: headerValue }));
      setHeaderKey('');
      setHeaderValue('');
    }
  };

  const removeHeader = (key: string) => {
    setHeaders(prev => {
      const newHeaders = { ...prev };
      delete newHeaders[key];
      return newHeaders;
    });
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    const testData = {
      event: 'test',
      reportName: 'Test Report',
      timestamp: new Date().toISOString(),
    };

    const allHeaders = { ...headers };
    if (authType === 'bearer' && authToken) {
      allHeaders['Authorization'] = `Bearer ${authToken}`;
    } else if (authType === 'apikey' && authToken) {
      allHeaders['X-API-Key'] = authToken;
    }

    const result = await reportDeliveryService.deliverViaWebhook(
      testData,
      webhookUrl,
      allHeaders
    );

    setTestResult(result.success);
    setTesting(false);

    toast({
      title: result.success ? "Webhook Test Successful" : "Webhook Test Failed",
      description: result.error || "Test payload delivered successfully",
      variant: result.success ? "default" : "destructive",
    });
  };

  const handleSave = () => {
    const config = {
      url: webhookUrl,
      method,
      headers: {
        ...headers,
        ...(authType === 'bearer' && authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(authType === 'apikey' && authToken ? { 'X-API-Key': authToken } : {}),
      },
    };

    onSave?.(config);
    toast({
      title: "Webhook Configuration Saved",
      description: "Reports will be sent to this webhook",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Webhook className="h-5 w-5" />
            <span>Configure Webhook</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://api.example.com/webhooks/reports"
              type="url"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="method">HTTP Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="auth-type">Authentication</Label>
              <Select value={authType} onValueChange={setAuthType}>
                <SelectTrigger id="auth-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="apikey">API Key</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {authType !== 'none' && (
            <div>
              <Label htmlFor="auth-token">
                {authType === 'bearer' ? 'Bearer Token' : 'API Key'}
              </Label>
              <Input
                id="auth-token"
                type="password"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="Enter your token/key"
              />
            </div>
          )}

          <div>
            <Label>Custom Headers</Label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Header name"
                  value={headerKey}
                  onChange={(e) => setHeaderKey(e.target.value)}
                />
                <Input
                  placeholder="Header value"
                  value={headerValue}
                  onChange={(e) => setHeaderValue(e.target.value)}
                />
                <Button variant="outline" onClick={addHeader} disabled={!headerKey || !headerValue}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {Object.entries(headers).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2 p-2 bg-muted rounded">
                  <span className="text-sm flex-1">
                    <strong>{key}:</strong> {value}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => removeHeader(key)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleTest} disabled={!webhookUrl || testing}>
              {testing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Webhook className="h-4 w-4 mr-2" />
              )}
              Test Webhook
            </Button>

            {testResult !== null && (
              <Badge variant={testResult ? "default" : "destructive"}>
                {testResult ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Success
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Failed
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!webhookUrl}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
