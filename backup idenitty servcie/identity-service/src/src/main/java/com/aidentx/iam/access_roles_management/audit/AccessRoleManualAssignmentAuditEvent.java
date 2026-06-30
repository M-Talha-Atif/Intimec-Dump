package com.aidentx.iam.access_roles_management.audit;

import com.aidentx.iam.access_roles_management.model.entity.AccessRoleAuditLog;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Immutable audit event for bulk manual access-role member grants.
 */
public record AccessRoleManualAssignmentAuditEvent(
        String actorId,
        String actorUsername,
        String tenantId,
        String action,
        String roleId,
        String roleName,
        String roleType,
        String riskLevel,
        Integer requestedCount,
        Integer addedCount,
        Integer skippedCount,
        Integer failedCount,
        List<MemberAuditDetail> addedMembers,
        List<MemberAuditDetail> skippedMembers,
        List<FailedMemberAuditDetail> failedMembers,
        JsonNode stateAfter,
        String description,
        Instant timestamp
) {

    public record MemberAuditDetail(String identityId, String identityName, String identityType) {
    }

    public record FailedMemberAuditDetail(String identityId, String identityName, String identityType, String reason) {
    }

    public static AccessRoleManualAssignmentAuditEvent summary(String actorId,
                                                               String actorUsername,
                                                               String tenantId,
                                                               String roleId,
                                                               String roleName,
                                                               String roleType,
                                                               String riskLevel,
                                                               Integer requestedCount,
                                                               Integer addedCount,
                                                               Integer skippedCount,
                                                               Integer failedCount,
                                                               List<MemberAuditDetail> addedMembers,
                                                               List<MemberAuditDetail> skippedMembers,
                                                               List<FailedMemberAuditDetail> failedMembers,
                                                               JsonNode stateAfter) {
        return new AccessRoleManualAssignmentAuditEvent(
                actorId,
                actorUsername,
                tenantId,
                AccessRoleManualAssignmentAuditConstants.ACTION_MEMBERS_MANUALLY_GRANTED,
                roleId,
                roleName,
                roleType,
                riskLevel,
                requestedCount,
                addedCount,
                skippedCount,
                failedCount,
                addedMembers,
                skippedMembers,
                failedMembers,
                stateAfter,
                String.format(
                        AccessRoleManualAssignmentAuditConstants.DESC_MEMBERS_MANUALLY_GRANTED_TEMPLATE,
                        roleName,
                        actorUsername,
                        addedCount != null ? addedCount : 0,
                        skippedCount != null ? skippedCount : 0,
                        failedCount != null ? failedCount : 0),
                Instant.now()
        );
    }

    public AccessRoleAuditLog toAuditLog() {
        AccessRoleAuditLog log = new AccessRoleAuditLog();
        log.setTenantId(tenantId);
        log.setRoleId(parseUuid(roleId));
        log.setRoleName(roleName);
        log.setRoleType(roleType);
        log.setEntityType(AccessRoleManualAssignmentAuditConstants.toEntityType(roleType));
        log.setActivityLabel(AccessRoleManualAssignmentAuditConstants.toActivityLabel(roleType));
        log.setAction(action);
        log.setTriggerSource(AccessRoleManualAssignmentAuditConstants.TRIGGER_API);
        log.setDescription(description);
        log.setActorId(actorId);
        log.setActorUsername(actorUsername);
        log.setStateBefore(null);
        log.setStateAfter(stateAfter);
        log.setChangedFields(List.of());
        log.setAddedChildren(null);
        log.setRemovedChildren(null);
        log.setFailedChildren(null);
        log.setAddedEntitlements(null);
        log.setRemovedEntitlements(null);
        return log;
    }

    private UUID parseUuid(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}

