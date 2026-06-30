'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileJson, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  FileUp,
  ShieldCheck,
  Eye,
  CheckCheck
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BulkImportRolesWizardProps {
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

interface ParsedRole {
  roleType: string;
  roleName: string;
  description: string;
  businessJustification?: string;
  requireOwnerApproval?: boolean;
  tags?: string[];
  riskLevel?: string;
  ownerIds?: string[];
}

type Step = 'upload' | 'validate' | 'preview' | 'apply';

const STEPS: { value: Step; label: string; icon: React.ComponentType<any> }[] = [
  { value: 'upload', label: 'Upload File', icon: FileUp },
  { value: 'validate', label: 'Validate', icon: ShieldCheck },
  { value: 'preview', label: 'Preview', icon: Eye },
  { value: 'apply', label: 'Apply', icon: CheckCheck },
];

export function BulkImportRolesWizard({
  open,
  onOpenChange,
  onImportComplete,
}: BulkImportRolesWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRoles, setParsedRoles] = useState<ParsedRole[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentStepIndex = STEPS.findIndex(s => s.value === currentStep);
  const canGoNext = () => {
    switch (currentStep) {
      case 'upload':
        return !!selectedFile;
      case 'validate':
        return validationErrors.length === 0 && parsedRoles.length > 0;
      case 'preview':
        return parsedRoles.length > 0;
      case 'apply':
        return false;
      default:
        return false;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        toast.error('Please select a valid JSON file');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setParsedRoles([]);
      setValidationErrors([]);
      setImportResult(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setParsedRoles([]);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleValidate = async () => {
    if (!selectedFile) return;

    setIsValidating(true);
    setValidationErrors([]);
    setParsedRoles([]);

    try {
      const text = await selectedFile.text();
      let roles: ParsedRole[];
      
      try {
        const parsed = JSON.parse(text);
        roles = Array.isArray(parsed) ? parsed : parsed.roles;
        
        if (!roles || !Array.isArray(roles)) {
          throw new Error('JSON must contain an array of roles or an object with a "roles" array');
        }
      } catch (parseError) {
        setValidationErrors(['Invalid JSON format. Please check your file structure.']);
        setIsValidating(false);
        return;
      }

      // Validate each role
      const errors: string[] = [];
      const validRoles: ParsedRole[] = [];

      roles.forEach((role, index) => {
        const roleErrors: string[] = [];
        
        if (!role.roleName || typeof role.roleName !== 'string') {
          roleErrors.push(`Role at index ${index}: Missing or invalid 'roleName'`);
        }
        if (!role.roleType || typeof role.roleType !== 'string') {
          roleErrors.push(`Role at index ${index}: Missing or invalid 'roleType'`);
        }
        if (!role.description || typeof role.description !== 'string') {
          roleErrors.push(`Role at index ${index}: Missing or invalid 'description'`);
        }

        if (roleErrors.length > 0) {
          errors.push(...roleErrors);
        } else {
          validRoles.push(role);
        }
      });

      if (errors.length > 0) {
        setValidationErrors(errors);
      } else {
        setParsedRoles(validRoles);
        toast.success(`Validated ${validRoles.length} roles successfully`);
        setCurrentStep('preview');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during validation';
      setValidationErrors([errorMessage]);
    } finally {
      setIsValidating(false);
    }
  };

  const handleApply = async () => {
    setShowApplyConfirm(false);
    setIsImporting(true);
    setCurrentStep('apply');

    try {
      const response = await fetch('/api/roles/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles: parsedRoles }),
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
      
      toast.success(`Successfully imported ${result.data.summary.successCount} of ${result.data.summary.totalRoles} roles`);
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during import';
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 'upload') {
      setCurrentStep('validate');
      setTimeout(() => handleValidate(), 100);
    } else if (currentStep === 'validate') {
      setCurrentStep('preview');
    } else if (currentStep === 'preview') {
      setShowApplyConfirm(true);
    }
  };

  const handleBack = () => {
    if (currentStep === 'validate') {
      setCurrentStep('upload');
    } else if (currentStep === 'preview') {
      setCurrentStep('validate');
    } else if (currentStep === 'apply' && importResult) {
      // Can't go back from apply
    }
  };

  const handleClose = () => {
    if ((selectedFile && !importResult) || (currentStep !== 'upload' && currentStep !== 'apply')) {
      setShowDiscardConfirm(true);
    } else {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setParsedRoles([]);
    setValidationErrors([]);
    setImportResult(null);
    setShowDiscardConfirm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                {!selectedFile ? (
                  <div className="space-y-4">
                    <FileUp className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Select a JSON file to import roles</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum file size: 5MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 bg-green-50 dark:bg-green-950 py-4 rounded-lg">
                      <FileJson className="h-8 w-8 text-green-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveFile}
                    >
                      Remove File
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Example Format */}
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Expected JSON format:</p>
              <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
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
          </div>
        );

      case 'validate':
        return (
          <div className="space-y-4">
            {isValidating ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Validating JSON structure...</p>
              </div>
            ) : validationErrors.length > 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Validation failed with {validationErrors.length} error(s):</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {validationErrors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            ) : parsedRoles.length > 0 ? (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Validation successful!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Found {parsedRoles.length} valid role(s) ready for import.
                  </p>
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Roles to Import ({parsedRoles.length})</h3>
            </div>
            
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-3 font-medium">#</th>
                    <th className="text-left p-3 font-medium">Role Name</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Risk Level</th>
                    <th className="text-left p-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRoles.map((role, idx) => (
                    <tr key={idx} className="border-t hover:bg-muted/50">
                      <td className="p-3 text-muted-foreground">{idx + 1}</td>
                      <td className="p-3 font-medium">{role.roleName}</td>
                      <td className="p-3">
                        <Badge variant="outline">{role.roleType}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={
                            role.riskLevel === 'HIGH' ? 'destructive' :
                            role.riskLevel === 'MEDIUM' ? 'default' : 'secondary'
                          }
                        >
                          {role.riskLevel || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs max-w-xs truncate">
                        {role.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'apply':
        return (
          <div className="space-y-4">
            {isImporting ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Importing roles...</p>
              </div>
            ) : importResult ? (
              <div className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                  <AlertDescription className="text-sm">
                    <strong>Import Summary:</strong> {importResult.data.summary.successCount} successful,{' '}
                    {importResult.data.summary.failureCount} failed out of{' '}
                    {importResult.data.summary.totalRoles} total roles.
                  </AlertDescription>
                </Alert>

                {importResult.data.successfulImports.length > 0 && (
                  <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Successfully Imported ({importResult.data.successfulImports.length})
                      </span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {importResult.data.successfulImports.map((role, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-green-700 dark:text-green-300">
                            {role.roleName} <span className="text-muted-foreground">({role.roleType})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResult.data.failedImports.length > 0 && (
                  <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-950">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">
                        Failed Imports ({importResult.data.failedImports.length})
                      </span>
                    </div>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {importResult.data.failedImports.map((failure, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                            <span className="font-medium text-red-700 dark:text-red-300">
                              {failure.roleName} <span className="text-muted-foreground">(Index: {failure.index})</span>
                            </span>
                          </div>
                          <p className="text-xs text-red-600 dark:text-red-400 pl-6">
                            {failure.error}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Bulk Import Roles
            </DialogTitle>
            <DialogDescription>
              Import multiple roles from a JSON file in 4 easy steps
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicators */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.value === currentStep;
              const isCompleted = index < currentStepIndex;
              const isPast = index < currentStepIndex;

              return (
                <React.Fragment key={step.value}>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                        isActive && 'border-primary bg-primary text-primary-foreground',
                        isCompleted && 'border-green-600 bg-green-600 text-white',
                        !isActive && !isCompleted && 'border-muted-foreground bg-background'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isActive && 'text-primary',
                        isCompleted && 'text-green-600',
                        !isActive && !isCompleted && 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 -mt-5',
                        isPast ? 'bg-green-600' : 'bg-muted-foreground/30'
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <Separator />

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto px-1">
            {renderStepContent()}
          </div>

          <Separator />

          {/* Footer Actions */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={currentStep === 'apply' && importResult ? resetAndClose : handleClose}
            >
              {currentStep === 'apply' && importResult ? 'Close' : 'Cancel'}
            </Button>
            
            <div className="flex gap-2">
              {currentStep !== 'upload' && currentStep !== 'apply' && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isValidating || isImporting}
                >
                  Back
                </Button>
              )}
              
              {currentStep !== 'apply' && (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext() || isValidating || isImporting}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : currentStep === 'preview' ? (
                    <>
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Apply Import
                    </>
                  ) : (
                    'Next'
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply Confirmation Dialog */}
      <AlertDialog open={showApplyConfirm} onOpenChange={setShowApplyConfirm}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Import</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to import {parsedRoles.length} role(s)? 
              This will create new roles in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApply}>
              Import {parsedRoles.length} Role(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Import?</AlertDialogTitle>
            <AlertDialogDescription>
              You have an import in progress. Are you sure you want to close? 
              All progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={resetAndClose}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
