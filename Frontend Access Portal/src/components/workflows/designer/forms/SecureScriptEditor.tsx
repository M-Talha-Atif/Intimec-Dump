"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecureScriptEditorProps {
  config: any;
  onChange: (config: any) => void;
}

export const SecureScriptEditor: React.FC<SecureScriptEditorProps> = ({ config, onChange }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const { toast } = useToast();

  const scriptConfig = config.scriptConfig || {
    language: 'javascript',
    code: '',
    sandbox: true,
    timeout: 5000
  };

  const updateConfig = (updates: any) => {
    onChange({
      ...config,
      scriptConfig: {
        ...scriptConfig,
        ...updates
      }
    });
  };

  const runSecurityScan = async () => {
    setIsScanning(true);
    setScanResults([]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const code = scriptConfig.code || '';
    const findings: any[] = [];

    if (code.includes('eval(') || code.includes('Function(')) {
      findings.push({
        severity: 'high',
        message: 'Use of eval() detected - potential code injection risk',
        fix: 'Remove eval() and use JSON.parse()'
      });
    }

    if (code.match(/['"]?(?:password|secret|key|token)['"]?\s*[:=]/i)) {
      findings.push({
        severity: 'high',
        message: 'Hardcoded credential detected',
        fix: 'Use secret references: secret://vault/key-name'
      });
    }

    if (code.includes('fetch(') && !scriptConfig.security?.networkAccess) {
      findings.push({
        severity: 'medium',
        message: 'Network access detected but not explicitly allowed',
        fix: 'Enable network access in security settings'
      });
    }

    setScanResults(findings);
    setIsScanning(false);

    if (findings.length === 0) {
      toast({ title: "Security scan passed", description: "No issues found" });
    } else {
      toast({ title: "Security issues found", description: `Found ${findings.length} issue(s)`, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Secure Script Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Language</Label>
            <Select
              value={scriptConfig.language}
              onValueChange={(value) => updateConfig({ language: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="powershell">PowerShell</SelectItem>
                <SelectItem value="python">Python</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Script Code</Label>
            <Textarea
              value={scriptConfig.code}
              onChange={(e) => updateConfig({ code: e.target.value })}
              className="font-mono text-sm"
              rows={10}
              placeholder="// Your secure script here"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Sandbox Execution</Label>
              <p className="text-xs text-muted-foreground">Isolated execution environment</p>
            </div>
            <Switch
              checked={scriptConfig.sandbox}
              onCheckedChange={(checked) => updateConfig({ sandbox: checked })}
            />
          </div>

          <Button onClick={runSecurityScan} disabled={isScanning} className="w-full">
            {isScanning ? 'Scanning...' : 'Run Security Scan'}
          </Button>

          {scanResults.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Security Issues Found
                </div>
                {scanResults.map((finding, idx) => (
                  <div key={idx} className="text-sm">
                    <Badge variant={finding.severity === 'high' ? 'destructive' : 'default'} className="text-xs">
                      {finding.severity}
                    </Badge>
                    <p className="mt-1">{finding.message}</p>
                    {finding.fix && <p className="text-xs text-muted-foreground mt-1">Fix: {finding.fix}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {scanResults.length === 0 && !isScanning && scriptConfig.code && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  No security issues detected
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
