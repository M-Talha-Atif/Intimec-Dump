import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sodPolicyService } from '@/services/sodPolicyService';
import { useToast } from '@/hooks/use-toast';
import type { SoDPolicy, ViolationDetail, PolicyException, SimulationScenario } from '@/types/sodPolicies';

interface SoDPolicyFilters {
  status?: string;
  riskLevel?: string;
  search?: string;
  [key: string]: string | undefined;
}

export const useSoDPolicies = (filters?: SoDPolicyFilters) => {
  return useQuery({
    queryKey: ['sod-policies', filters],
    queryFn: () => sodPolicyService.getPolicies(filters),
  });
};

export const useSoDPolicy = (id: string) => {
  return useQuery({
    queryKey: ['sod-policy', id],
    queryFn: () => sodPolicyService.getPolicyById(id),
    enabled: !!id,
  });
};

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (policy: Partial<SoDPolicy>) => sodPolicyService.createPolicy(policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sod-policies'] });
      queryClient.invalidateQueries({ queryKey: ['sod-analytics'] });
      toast({ title: 'Policy Created', description: 'The SoD policy has been created successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create policy. Please try again.', variant: 'destructive' });
    },
  });
};

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SoDPolicy> }) =>
      sodPolicyService.updatePolicy(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sod-policies'] });
      queryClient.invalidateQueries({ queryKey: ['sod-analytics'] });
      toast({ title: 'Policy Updated', description: 'The policy has been updated successfully.' });
    },
  });
};

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => sodPolicyService.deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sod-policies'] });
      toast({ title: 'Policy Deleted', description: 'The policy has been deleted successfully.' });
    },
  });
};

export const useSoDViolations = (filters?: SoDPolicyFilters) => {
  return useQuery({
    queryKey: ['sod-violations', filters],
    queryFn: () => sodPolicyService.getViolations(filters),
  });
};

export const useRemediateViolation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, action, details }: { id: string; action: string; details: string }) =>
      sodPolicyService.remediateViolation(id, action, details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sod-violations'] });
      queryClient.invalidateQueries({ queryKey: ['sod-analytics'] });
      toast({ title: 'Remediation Started', description: 'The violation remediation has been initiated.' });
    },
  });
};

export const useSoDExceptions = (filters?: SoDPolicyFilters) => {
  return useQuery({
    queryKey: ['sod-exceptions', filters],
    queryFn: () => sodPolicyService.getExceptions(filters),
  });
};

export const useRequestException = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<PolicyException>) => sodPolicyService.requestException(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sod-exceptions'] });
      toast({ title: 'Exception Requested', description: 'Your exception request has been submitted for approval.' });
    },
  });
};

export const useSoDAnalytics = () => {
  return useQuery({
    queryKey: ['sod-analytics'],
    queryFn: () => sodPolicyService.getAnalytics(),
    refetchInterval: 60000,
  });
};

export const useAIRecommendations = () => {
  return useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => sodPolicyService.getAIRecommendations(),
    refetchInterval: 300000,
  });
};

export const useRunSimulation = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (scenario: SimulationScenario) => sodPolicyService.runSimulation(scenario),
    onSuccess: (result) => {
      if (result.status === 'conflict') {
        toast({
          title: 'Conflicts Detected',
          description: `${result.conflictCount} conflict(s) found. Review recommendations.`,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Simulation Complete', description: 'No conflicts detected. Access can be safely granted.' });
      }
    },
  });
};

export const useConflictMatrix = () => {
  return useQuery({
    queryKey: ['conflict-matrix'],
    queryFn: () => sodPolicyService.getConflictMatrix(),
  });
};
