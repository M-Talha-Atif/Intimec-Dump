package com.aidentx.iam.access_roles_management.service;

import com.aidentx.iam.access_roles_management.model.entity.IdentityRoleAssignment;

import java.util.UUID;

/**
 * Applies and revokes effective entitlements implied by an identity's access-role assignment.
 */
public interface RoleEntitlementAssignmentService {

    /**
     * Ensures all effective entitlements of the role are assigned to the identity's
     * linked account shadows. The {@code sourceType} controls the stamped
     * {@code entitlement_assignments.source}:
     * <ul>
     *   <li>{@link IdentityRoleAssignment.SourceType#MANUAL} → {@code "MANUAL"}</li>
     *   <li>otherwise (RULE / null) → {@code "DYNAMIC"}</li>
     * </ul>
     */
    void applyRoleEntitlements(String tenantId,
                               UUID identityId,
                               UUID roleId,
                               UUID assignmentRuleId,
                               IdentityRoleAssignment.SourceType sourceType);

    /** Revokes role-derived entitlements that are no longer required after a role assignment is removed. */
    void revokeRoleEntitlements(String tenantId, UUID identityId, UUID roleId, UUID assignmentRuleId);
}
