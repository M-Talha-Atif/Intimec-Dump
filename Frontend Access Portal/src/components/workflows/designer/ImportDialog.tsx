"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertTriangle, CheckCircle } from 'lucide-react';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (workflow: any) => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onOpenChange,
  onImport
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null);
  const [isLargePayload, setIsLargePayload] = useState(false);
  const [showRawPreview, setShowRawPreview] = useState(false);

  // Keep large JSON outside React state to avoid huge re-renders/freezes.
  const jsonContentRef = React.useRef<string>('');
  const validateTimerRef = React.useRef<number | null>(null);

  const LARGE_PAYLOAD_THRESHOLD = 200_000; // chars (~200KB). Above this, avoid rendering raw JSON.

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        jsonContentRef.current = content;
        setFileMeta({ name: file.name, size: file.size });
        const large = content.length > LARGE_PAYLOAD_THRESHOLD;
        setIsLargePayload(large);
        setShowRawPreview(!large);

        // Only mirror into textarea state if it's small enough
        setJsonInput(large ? '' : content);
        validateWorkflow(content);
      };
      reader.readAsText(file);
    }
  };

  const validateWorkflow = (content: string) => {
    const errors: string[] = [];
    setIsValid(false);

    try {
      const parsed = JSON.parse(content);
      
      // Support both minimal and full export payloads
      const nodes = parsed.nodes;
      const edges = parsed.edges;
      if (!nodes || !Array.isArray(nodes)) {
        errors.push('Missing or invalid "nodes" array');
      }
      if (!edges || !Array.isArray(edges)) {
        errors.push('Missing or invalid "edges" array');
      }

      // Optional: check workflow metadata presence in full export
      if (parsed.workflow) {
        const wf = parsed.workflow;
        if (!wf.name || typeof wf.name !== 'string') {
          errors.push('Invalid workflow.name (string required)');
        }
        // triggerType is strongly recommended but not strictly required for older exports
      }

      if (errors.length === 0) {
        setIsValid(true);
      }
      
      setValidationErrors(errors);
    } catch (error) {
      errors.push('Invalid JSON format');
      setValidationErrors(errors);
    }
  };

  const handleImport = () => {
    if (!isValid) return;

    try {
      const raw = jsonContentRef.current || jsonInput;
      const workflow = JSON.parse(raw);
      onImport(workflow);
      onOpenChange(false);
      setJsonInput('');
      setValidationErrors([]);
      setIsValid(false);
      setFileMeta(null);
      setIsLargePayload(false);
      setShowRawPreview(false);
      jsonContentRef.current = '';
    } catch (error) {
      setValidationErrors(['Failed to import workflow']);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Workflow</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div>
            <Label className="mb-2 block">Upload JSON File</Label>
            <Input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
            />
            {fileMeta && (
              <p className="text-xs text-muted-foreground mt-2">
                Loaded: <span className="font-medium">{fileMeta.name}</span> ({Math.round(fileMeta.size / 1024)} KB)
                {isLargePayload && ' — preview hidden to keep the UI fast.'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jsonInput">Or Paste JSON</Label>
            {isLargePayload && (
              <Alert>
                <AlertDescription>
                  Large JSON detected. For best performance, import from file (recommended) or keep preview hidden.
                </AlertDescription>
              </Alert>
            )}

            {fileMeta && isLargePayload && (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Raw JSON preview is disabled for large files.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = !showRawPreview;
                    setShowRawPreview(next);
                    if (next) {
                      // User explicitly asked to show; mirror content into textarea.
                      setJsonInput(jsonContentRef.current);
                    }
                  }}
                >
                  {showRawPreview ? 'Hide Preview' : 'Show Preview (may be slow)'}
                </Button>
              </div>
            )}

            <Textarea
              id="jsonInput"
              value={showRawPreview ? jsonInput : ''}
              onChange={(e) => {
                const value = e.target.value;
                setFileMeta(null);
                setShowRawPreview(true);
                setIsLargePayload(value.length > LARGE_PAYLOAD_THRESHOLD);
                jsonContentRef.current = value;

                // Avoid re-rendering huge strings into state; keep state small when payload is large.
                setJsonInput(value.length > LARGE_PAYLOAD_THRESHOLD ? '' : value);

                // Debounce validation to avoid heavy JSON.parse on every keystroke/paste.
                if (validateTimerRef.current) {
                  window.clearTimeout(validateTimerRef.current);
                }
                validateTimerRef.current = window.setTimeout(() => {
                  validateWorkflow(value);
                }, 300);
              }}
              placeholder='{"workflow": {"name": "My Workflow", "triggerType": "MANUAL"}, "nodes": [...], "edges": [...]}'
              rows={10}
              className="font-mono text-sm max-h-64 overflow-auto"
            />
            {!showRawPreview && fileMeta && isLargePayload && (
              <p className="text-xs text-muted-foreground">
                Preview hidden. You can still import safely.
              </p>
            )}
          </div>

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {isValid && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Workflow is valid and ready to import
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!isValid}>
            <Upload className="h-4 w-4 mr-2" />
            Import Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function Label({ children, className, htmlFor }: { children: React.ReactNode; className?: string; htmlFor?: string }) {
  return <label className={className} htmlFor={htmlFor}>{children}</label>;
}

function Input({ type, accept, onChange }: { type: string; accept?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return <input type={type} accept={accept} onChange={onChange} className="w-full px-3 py-2 border rounded-md" />;
}
