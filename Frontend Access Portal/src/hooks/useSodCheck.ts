import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface SodFinding {
  id: string;
  policyId: string;
  policyName: string;
  severity: "high" | "medium" | "low";
  conflictingRoles?: string[];
  conflictingEntitlements?: string[];
  affectedUsers?: string[];
  description: string;
}

export interface SodCheckResult {
  hasFindings: boolean;
  findings: SodFinding[];
  canProceed: boolean;
}

export const useSodCheck = () => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const checkSod = useCallback(async (params: {
    userId?: string;
    roleIds?: string[];
    entitlementIds?: string[];
    action: string;
  }): Promise<SodCheckResult> => {
    setIsChecking(true);
    
    try {
      // Mock SoD check - in production, call actual API
      // const response = await fetch('/api/sod/check', {
      //   method: 'POST',
      //   body: JSON.stringify(params)
      // });
      
      // Simulate random findings for demo
      const hasFindings = Math.random() > 0.8;
      
      const result: SodCheckResult = {
        hasFindings,
        findings: hasFindings ? [
          {
            id: "sod-finding-1",
            policyId: "pol-001",
            policyName: "Payment Approval & Processing Conflict",
            severity: "high",
            conflictingRoles: params.roleIds,
            description: "This action would create a separation of duties violation",
          }
        ] : [],
        canProceed: true, // Allow user to proceed with confirmation
      };

      return result;
    } catch (error) {
      toast({
        title: "SoD Check Failed",
        description: "Unable to verify separation of duties. Please try again.",
        variant: "destructive",
      });
      return { hasFindings: false, findings: [], canProceed: true };
    } finally {
      setIsChecking(false);
    }
  }, [toast]);

  return { checkSod, isChecking };
};
