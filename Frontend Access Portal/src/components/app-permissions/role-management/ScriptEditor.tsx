import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface ScriptEditorProps {
  initialScript?: string;
  onChange: (script: string) => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  initialScript = '',
  onChange,
}) => {
  const [script, setScript] = useState(initialScript);

  useEffect(() => {
    setScript(initialScript);
  }, [initialScript]);

  const handleScriptChange = (value: string) => {
    setScript(value);
    onChange(value);
  };

  return (
    <div className="space-y-4">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <div className="space-y-2">
            <p className="font-medium">Write custom condition scripts using User entity fields:</p>
            <div className="font-mono text-xs space-y-1 ml-4">
              <p>• String fields: user.username, user.email, user.firstName, user.lastName, user.displayName</p>
              <p>• Status: user.status == 'ACTIVE' | 'INACTIVE' | 'LOCKED'</p>
              <p>• Boolean: user.mfaEnabled == true, user.isPasswordExpired == false</p>
              <p>• Number: user.failedLoginAttempts &gt; 3</p>
              <p>• Timestamp: user.lastLoginAt, user.createdAt, user.updatedAt</p>
              <p>• Operators: ==, !=, &gt;, &lt;, &gt;=, &lt;=, &amp;&amp; (AND), || (OR)</p>
              <p>• String methods: .contains(), .startsWith(), .endsWith()</p>
            </div>
            <p className="font-medium mt-2">Examples:</p>
            <div className="font-mono text-xs space-y-1 ml-4">
              <p>• user.status == 'ACTIVE' &amp;&amp; user.mfaEnabled == true</p>
              <p>• user.email.endsWith('@company.com') &amp;&amp; user.failedLoginAttempts &lt; 3</p>
              <p>• user.status == 'ACTIVE' || user.status == 'LOCKED'</p>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <label className="text-sm font-medium">Rule Condition Script</label>
        <Textarea
          value={script}
          onChange={(e) => handleScriptChange(e.target.value)}
          placeholder="Enter your condition script here, e.g., user.status == 'ACTIVE' && user.mfaEnabled == true"
          className="font-mono text-sm min-h-[200px]"
          spellCheck={false}
        />
      </div>

      {script && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Preview
          </label>
          <div className="p-4 bg-muted rounded-md">
            <code className="text-xs break-all">{script}</code>
          </div>
        </div>
      )}
    </div>
  );
};
