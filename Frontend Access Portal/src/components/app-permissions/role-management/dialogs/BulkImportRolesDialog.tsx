'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileJson, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface BulkImportRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

interface ImportResult {
  message: string;
  data: {
    successfulImports: Array<{
      id: string;
      roleName: string;
      roleType: string;
    }>;
    failedImports: Array<{
      roleName: string;
      error: string;
      index: number;
    }>;
    summary: {
      totalRoles: number;
      successCount: number;
      failureCount: number;
    };
  };
}

export function BulkImportRolesDialog({
  open,
  onOpenChange,
  onImportComplete,
}: BulkImportRolesDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        setError('Please select a valid JSON file');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
      setImportResult(null);
    }
  };

  const handleImportClick = () => {
    if (!selectedFile) return;
    setShowImportConfirm(true);
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;
    setShowImportConfirm(false);

    setIsUploading(true);
    setError(null);
    setImportResult(null);

    try {
      const text = await selectedFile.text();
      let roles;
      
      try {
        const parsed = JSON.parse(text);
        roles = Array.isArray(parsed) ? parsed : parsed.roles;
        
        if (!roles || !Array.isArray(roles)) {
          throw new Error('JSON must contain an array of roles or an object with a "roles" array');
        }
      } catch (parseError) {
        setError('Invalid JSON format. Please check your file structure.');
        setIsUploading(false);
        return;
      }

      const response = await fetch('/api/roles/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles }),
      });

      // Check if operation was denied (403)
      if (response.status === 403) {
        // Global interceptor handles the toast
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import roles');
      }

      setImportResult(result);
      
      // Show success toast
      toast.success(`Successfully imported ${result.data.summary.successCount} of ${result.data.summary.totalRoles} roles`);
      
      // Call onImportComplete to refresh the roles list
      if (onImportComplete) {
        onImportComplete();
      }
      
      // Clear file selection after successful import
      if (result.data.summary.failureCount === 0) {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during import';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseClick = () => {
    // If file is selected and no result yet, show discard confirmation
    if (selectedFile && !importResult) {
      setShowDiscardConfirm(true);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const handleDiscardChanges = () => {
    setShowDiscardConfirm(false);
    handleClose();
  };

  const handleKeepFile = () => {
    setShowDiscardConfirm(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleCloseClick}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Import Roles</DialogTitle>
          </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Select JSON File
            </label>
            <div className="flex items-center gap-2">
              {!selectedFile ? (
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
                />
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse...
                  </Button>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileJson className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate max-w-xs" title={selectedFile.name}>{selectedFile.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Example Format */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Expected JSON format:</p>
            <pre className="text-xs bg-background p-2 rounded break-all whitespace-pre-wrap">
{`[
  {
    "roleType": "APPLICATION",
    "roleName": "Sales Manager",
    "description": "Access to sales",
    "businessJustification": "Required",
    "requireOwnerApproval": false,
    "tags": ["sales"],
    "riskLevel": "MEDIUM",
    "ownerIds": ["uuid-1"]
  }
]`}
            </pre>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-3">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-sm">
                  <strong>Import Summary:</strong> {importResult.data.summary.successCount} successful,{' '}
                  {importResult.data.summary.failureCount} failed out of{' '}
                  {importResult.data.summary.totalRoles} total roles.
                </AlertDescription>
              </Alert>

              {importResult.data.successfulImports.length > 0 && (
                <div className="border rounded-lg p-3 bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Successfully Imported ({importResult.data.successfulImports.length})
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {importResult.data.successfulImports.map((role, idx) => (
                      <div key={idx} className="text-xs text-green-700 pl-6">
                        • {role.roleName} ({role.roleType})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {importResult.data.failedImports.length > 0 && (
                <div className="border rounded-lg p-3 bg-red-50">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      Failed Imports ({importResult.data.failedImports.length})
                    </span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {importResult.data.failedImports.map((failure, idx) => (
                      <div key={idx} className="text-xs text-red-700 pl-6">
                        <div className="font-medium">• {failure.roleName} (Index: {failure.index})</div>
                        <div className="text-red-600 pl-2">→ {failure.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCloseClick}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {!importResult && (
            <Button
              onClick={handleImportClick}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Roles
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Import Confirmation Dialog */}
    <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Import Roles</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to import roles from this file? This will create new roles in the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmImport}>
            Import
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Discard Changes Dialog */}
    <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have selected a file. Are you sure you want to close without importing? The selected file will be discarded.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleKeepFile}>Keep File</AlertDialogCancel>
          <AlertDialogAction onClick={handleDiscardChanges} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Discard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
