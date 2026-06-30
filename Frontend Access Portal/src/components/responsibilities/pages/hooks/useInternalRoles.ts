import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyInternalRoles } from "@/services/responsibilities";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/useConfirm";
import { useAudit } from "@/hooks/useAudit";
import { useRbac } from "@/hooks/useRbac";

export function useInternalRoles(globalSearch: string, scopeFilter: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const { logAction } = useAudit();
  const { can } = useRbac();

  const { data: roles, isLoading } = useQuery({
    queryKey: ["internalRoles"],
    queryFn: fetchMyInternalRoles,
  });

  const filteredRoles = roles?.filter((role) => {
    const matchesSearch = role.name
      .toLowerCase()
      .includes(globalSearch.toLowerCase());
    const matchesScope =
      scopeFilter === "all" || role.scope === scopeFilter;
    return matchesSearch && matchesScope;
  });

  // Mutations
  const recertifyMutation = useMutation({
    mutationFn: async ({ roleId }: { roleId: string; reason: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { roleId };
    },
    onSuccess: (data, variables) => {
      logAction({
        action: "internal_role.recertify",
        entity: "internal_role",
        entityId: variables.roleId,
        reason: variables.reason,
      });
      toast({
        title: "Recertification Started",
        description: "Internal role recertification has been initiated.",
      });
      queryClient.invalidateQueries({ queryKey: ["internalRoles"] });
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
        action: "internal_role.transfer_ownership",
        entity: "internal_role",
        entityId: variables.roleId,
        reason: variables.reason,
      });
      toast({
        title: "Ownership Transferred",
        description: "Internal role ownership has been transferred.",
      });
      queryClient.invalidateQueries({ queryKey: ["internalRoles"] });
    },
  });

  const rotateOwnerMutation = useMutation({
    mutationFn: async ({ roleId }: { roleId: string; reason: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { roleId };
    },
    onSuccess: (data, variables) => {
      logAction({
        action: "internal_role.rotate_owner",
        entity: "internal_role",
        entityId: variables.roleId,
        reason: variables.reason,
      });
      toast({
        title: "Owner Rotated",
        description: "Role owner has been rotated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["internalRoles"] });
    },
  });

  // Handlers
  const handleRecertify = async (roleId: string) => {
    if (!can("recertify", "internal_role")) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to recertify internal roles.",
        variant: "destructive",
      });
      return;
    }

    const result = await confirm({
      title: "Recertify Internal Role",
      description: "Start recertification for this internal role.",
      requireReason: true,
      confirmText: "Recertify",
    });

    if (result.confirmed && result.reason) {
      recertifyMutation.mutate({ roleId, reason: result.reason });
    }
  };

  const handleTransferOwnership = async (roleId: string) => {
    if (!can("transfer", "internal_role")) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to transfer ownership.",
        variant: "destructive",
      });
      return;
    }

    const result = await confirm({
      title: "Transfer Ownership",
      description: "Transfer ownership of this internal role to another user.",
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

  const handleRotateOwner = async (roleId: string) => {
    if (!can("rotate", "internal_role")) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to rotate owners.",
        variant: "destructive",
      });
      return;
    }

    const result = await confirm({
      title: "Rotate Owner",
      description: "Rotate the owner of this internal role according to policy.",
      requireReason: true,
      confirmText: "Rotate",
    });

    if (result.confirmed && result.reason) {
      rotateOwnerMutation.mutate({ roleId, reason: result.reason });
    }
  };

  return {
    roles,
    filteredRoles,
    isLoading,
    actions: {
      handleRecertify,
      handleTransferOwnership,
      handleRotateOwner,
    },
    mutationStates: {
      isRecertifying: recertifyMutation.isPending,
      isTransferring: transferOwnershipMutation.isPending,
      isRotating: rotateOwnerMutation.isPending,
    },
  };
}
