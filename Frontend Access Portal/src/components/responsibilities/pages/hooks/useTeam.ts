import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyTeam } from "@/services/responsibilities";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/useConfirm";
import { useAudit } from "@/hooks/useAudit";
import { useRbac } from "@/hooks/useRbac";
import { useJobTracker } from "@/hooks/useJobTracker";

export function useTeam(globalSearch: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const { logAction } = useAudit();
  const { can } = useRbac();
  const jobTracker = useJobTracker();

  const { data: team, isLoading } = useQuery({
    queryKey: ["team", "me"],
    queryFn: fetchMyTeam,
  });

  const filteredTeam = team?.filter((member) => {
    // Safe logging
    console.log(member);

    const search = globalSearch?.toLowerCase() ?? "";
    const name = member?.displayName?.toLowerCase() ?? "";
    const department = member?.department?.toLowerCase() ?? "";

    return (
      name.includes(search) ||
      department.includes(search)
    );
  }) ?? [];

  const stats = {
    active: team?.filter((m) => m.status === "ACTIVE").length || 0,
    inactive: team?.filter((m) => m.status === "INACTIVE").length || 0,
    pending: team?.filter((m) => m.status === "PENDING").length || 0,
  };

  // Mutations
  const bulkCertifyMutation = useMutation({
    mutationFn: async ({ }: { reason: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const jobId = `cert-${Date.now()}`;
      return { jobId };
    },
    onSuccess: (data, variables) => {
      logAction({
        action: "team.bulk_certify",
        entity: "team",
        entityId: "my-team",
        reason: variables.reason,
      });

      jobTracker.trackJob(data.jobId, "Team Certification");

      toast({
        title: "Certification Started",
        description: "Bulk certification has been initiated.",
      });

      queryClient.invalidateQueries({ queryKey: ["team", "me"] });
    },
  });

  // Handlers
  const handleBulkCertify = async () => {
    if (!can("certify", "team")) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to certify team access.",
        variant: "destructive",
      });
      return;
    }

    const result = await confirm({
      title: "Bulk Team Certification",
      description: "Start a certification campaign for your entire team.",
      requireReason: true,
      confirmText: "Start Certification",
    });

    if (result.confirmed && result.reason) {
      bulkCertifyMutation.mutate({ reason: result.reason });
    }
  };

  return {
    team,
    filteredTeam,
    stats,
    isLoading,
    actions: {
      handleBulkCertify,
    },
    mutationStates: {
      isBulkCertifying: bulkCertifyMutation.isPending,
    },
    jobTracker,
  };
}
