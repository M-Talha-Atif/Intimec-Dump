import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Database, Check, X, Loader2 } from 'lucide-react';
import { reportDataSourceService } from '@/services/reportDataSourceService';
import { useToast } from "@/hooks/use-toast";

interface DataSourceConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (config: any) => void;
}

export const DataSourceConfigModal = ({ open, onOpenChange, onSave }: DataSourceConfigModalProps) => {
  const [sourceType, setSourceType] = useState('supabase');
  const [sourceName, setSourceName] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    const config = {
      type: sourceType as any,
      name: sourceName,
      config: {},
    };
    
    const result = await reportDataSourceService.testConnection(config);
    setTestResult(result);
    setTesting(false);
    
    toast({
      title: result ? "Connection Successful" : "Connection Failed",
      description: result ? "Data source is ready to use" : "Please check your configuration",
      variant: result ? "default" : "destructive",
    });
  };

  const handleSave = () => {
    const config = {
      type: sourceType,
      name: sourceName,
      config: {},
    };
    
    onSave?.(config);
    toast({
      title: "Data Source Saved",
      description: "Configuration saved successfully",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Configure Data Source</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="source-type">Data Source Type</Label>
            <Select value={sourceType} onValueChange={setSourceType}>
              <SelectTrigger id="source-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supabase">Supabase Database</SelectItem>
                <SelectItem value="api">REST API</SelectItem>
                <SelectItem value="csv">CSV File</SelectItem>
                <SelectItem value="json">JSON File</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="source-name">Connection Name</Label>
            <Input
              id="source-name"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="e.g., Production Database"
            />
          </div>

          {sourceType === 'supabase' && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Supabase connection is pre-configured for this application.
                Available tables: identities, access_reviews, entitlements, audit_logs.
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleTest} disabled={testing || !sourceName}>
              {testing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>
            
            {testResult !== null && (
              <Badge variant={testResult ? "default" : "destructive"}>
                {testResult ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 mr-1" />
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
          <Button onClick={handleSave} disabled={!sourceName}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
