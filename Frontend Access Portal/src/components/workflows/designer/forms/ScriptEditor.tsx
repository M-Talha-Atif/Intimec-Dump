"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Code } from 'lucide-react';

interface ScriptEditorProps {
  config: any;
  onChange: (config: any) => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  config,
  onChange
}) => {
  const scriptConfig = config.scriptConfig || {
    language: 'javascript',
    code: '',
    sandbox: true,
    timeout: 30
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

  const scriptTemplates = {
    javascript: `// Identity workflow script
function processUser(user, context) {
  console.log('Processing user:', user.email);
  return {
    success: true,
    data: { userId: user.id }
  };
}
return processUser(input.user, input.context);`,

    python: `# Identity workflow script
def process_user(user, context):
    print(f"Processing user: {user['email']}")
    return {'success': True, 'data': {'user_id': user['id']}}
result = process_user(input['user'], input['context'])`,

    powershell: `# Identity workflow script
param($User, $Context)
Write-Host "Processing user: $($User.email)"
@{ success = $true; data = @{ userId = $User.id } }`
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Code className="h-4 w-4" />
            Script Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Programming Language</Label>
            <Select
              value={scriptConfig.language}
              onValueChange={(value) => updateConfig({ language: value })}
            >
              <SelectTrigger className="mt-1">
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
              className="font-mono text-sm mt-1"
              rows={12}
              placeholder={scriptTemplates[scriptConfig.language as keyof typeof scriptTemplates]}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Sandbox Execution</Label>
              <p className="text-xs text-muted-foreground">Run script in isolated sandbox</p>
            </div>
            <Switch
              checked={scriptConfig.sandbox}
              onCheckedChange={(checked) => updateConfig({ sandbox: checked })}
            />
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => updateConfig({ code: scriptTemplates[scriptConfig.language as keyof typeof scriptTemplates] })}
          >
            Load Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
