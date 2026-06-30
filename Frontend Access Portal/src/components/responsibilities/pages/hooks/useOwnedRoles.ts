import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyBusinessRoles } from "@/services/responsibilities";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/useConfirm";
import { useAudit } from "@/hooks/useAudit";
import { useRbac } from "@/hooks/useRbac";

export function useOwnedRoles(
  globalSearch: string,
  typeFilter: string,
  riskFilter: string,
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const { logAction } = useAudit();
  const { can } = useRbac();

  const { data: roles, isLoading } = useQuery({
    queryKey: ["ownedRoles"],
    queryFn: fetchMyBusinessRoles,
  });

  const filteredRoles = roles?.filter((role) => {
    const matchesSearch = role.name
      .toLowerCase()
      .includes(globalSearch.toLowerCase());
    const matchesType = typeFilter === "all" || role.type === typeFilter;
    const matchesRisk =
      riskFilter === "all" || role.riskLevel === riskFilter;
    return matchesSearch && matchesType && matchesRisk;
  });

  // Mutations
  const recertifyMutation = useMutation({
    mutationFn: async ({ roleId }: { roleId: string; reason: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { roleId };
    },
    onSuccess: (data, variables) => {
      logAction({
        action: "role.recertify",
        entity: "role",
        entityId: variables.roleId,
        reason: variables.reason,
      });
      toast({
        title: "Recertification Started",
        description: "Role recertification campaign has been initiated.",
      });
      queryClient.invalidateQueries({ queryKey: ["ownedRoles"] });
    },
  });

  const transferOwnershipMutation = useMutation({
    mutationFn: async ({
      roleId,
      toUserId,
    }: {
      roleId: string;
      toUserId: string;
      reason: string;
    }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { roleId, toUserId };
    },
    onSuccess: (data, variables) => {
      logAction({
        action: "role.transfer_ownership",
        entity: "role",
        entityId: variables.roleId,
        reason: variables.reason,
      });
      toast({
        title: "Ownership Transferred",
        description: "Role ownership has been transferred successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["ownedRoles"] });
    },
  });

  // Handlers
  const handleRecertify = async (roleId: string) => {
    if (!can("recertify", "role")) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to recertify roles.",
        variant: "destructive",
      });
      return;
    }

    const result = await confirm({
      title: "Recertify Role",
      description: "This will start a recertification campaign for this role.",
      requireReason: true,
      confirmText: "Start Recertification",
    });

    if (result.confirmed && result.reason) {
      recertifyMutation.mutate({ roleId, reason: result.reason });
    }
  };

  const handleTransferOwnership = async (roleId: string) => {
    if (!can("transfer", "role")) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to transfer ownership.",
        variant: "destructive",
      });
      return;
    }

    const result = await confirm({
      title: "Transfer Ownership",
      description: "Transfer ownership of this role to another user.",
      requireReason: true,
      confirmText: "Transfer",
    });

    if (result.confirmed && result.reason) {
      transferOwnershipMutation.mutate({
        roleId,
        toUserId: "user-123",
        reason: result.reason,
      });
    }
  };

  return {
    roles,
    filteredRoles,
    isLoading,
    actions: {
      handleRecertify,
      handleTransferOwnership,
    },
    mutationStates: {
      isRecertifying: recertifyMutation.isPending,
      isTransferring: transferOwnershipMutation.isPending,
    },
  };
}
