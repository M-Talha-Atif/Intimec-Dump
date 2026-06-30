package com.aidentx.iam.access_roles_management.audit;

import com.aidentx.iam.access_roles_management.model.dto.response.ManualRoleMemberGrantResultDto;
import com.aidentx.iam.access_roles_management.model.entity.AccessRole;
import com.aidentx.iam.access_roles_management.service.AccessRoleAuditLogService;
import com.aidentx.iam.config.AppConstants;
import com.aidentx.logging.service.IUnifiedLogger;
import com.aidentx.logging.service.UnifiedLoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Publishes and persists summary audit records for bulk manual role grants.
 */
@Service
public class AccessRoleManualAssignmentAuditService {

    private final AccessRoleManualAssignmentAuditPublisher publisher;
    private final AccessRoleAuditLogService auditLogService;
    private final ObjectMapper objectMapper;
    private final IUnifiedLogger logger;

    public AccessRoleManualAssignmentAuditService(AccessRoleManualAssignmentAuditPublisher publisher,
                                                  AccessRoleAuditLogService auditLogService,
                                                  ObjectMapper objectMapper,
                                                  UnifiedLoggerFactory loggerFactory) {
        this.publisher = publisher;
        this.auditLogService = auditLogService;
        this.objectMapper = objectMapper;
        this.logger = loggerFactory.getLogger(getClass(), AccessRoleManualAssignmentAuditConstants.LOG_CATEGORY);
    }

    public void publishManualGrantAudit(String tenantId,
                                        AccessRole role,
                                        ManualRoleMemberGrantResultDto result) {
        try {
            AccessRoleManualAssignmentAuditEvent event = AccessRoleManualAssignmentAuditEvent.summary(
                    resolveActorId(),
                    resolveActorUsername(),
                    tenantId,
                    role != null && role.getId() != null ? role.getId().toString() : null,
                    role != null ? role.getName() : null,
                    role != null ? role.getType() : null,
                    role != null ? role.getRiskLevel() : null,
                    result != null ? result.getRequestedCount() : 0,
                    result != null ? result.getAddedCount() : 0,
                    result != null ? result.getSkippedCount() : 0,
                    result != null ? result.getFailedCount() : 0,
                    toAddedMembers(result),
                    toSkippedMembers(result),
                    toFailedMembers(result),
                    buildStateAfter(role, result));
            publisher.publish(event);
            auditLogService.persist(event.toAuditLog());
        } catch (Exception ex) {
            logger.error()
                    .category(AccessRoleManualAssignmentAuditConstants.LOG_CATEGORY)
                    .message(AccessRoleManualAssignmentAuditConstants.LOG_MANUAL_GRANT_AUDIT_FAILED)
                    .details(Map.of(
                            AccessRoleManualAssignmentAuditConstants.DETAIL_TENANT_ID,
                            tenantId != null ? tenantId : AccessRoleManualAssignmentAuditConstants.NOT_AVAILABLE,
                            AccessRoleManualAssignmentAuditConstants.DETAIL_ROLE_ID,
                            role != null && role.getId() != null
                                    ? role.getId().toString()
                                    : AccessRoleManualAssignmentAuditConstants.NOT_AVAILABLE,
                            AccessRoleManualAssignmentAuditConstants.DETAIL_EXCEPTION_TYPE,
                            ex.getClass().getSimpleName()
                    ))
                    .log();
        }
    }

    private ObjectNode buildStateAfter(AccessRole role, ManualRoleMemberGrantResultDto result) {
        ObjectNode state = objectMapper.createObjectNode();
        if (role != null && role.getId() != null) {
            state.put(AccessRoleManualAssignmentAuditConstants.STATE_ROLE_ID, role.getId().toString());
        }
        if (role != null && role.getName() != null) {
            state.put(AccessRoleManualAssignmentAuditConstants.STATE_ROLE_NAME, role.getName());
        }
        if (role != null && role.getType() != null) {
            state.put(AccessRoleManualAssignmentAuditConstants.STATE_ROLE_TYPE, role.getType());
        }
        if (role != null && role.getRiskLevel() != null) {
            state.put(AccessRoleManualAssignmentAuditConstants.STATE_RISK_LEVEL, role.getRiskLevel());
        }
        state.put(AccessRoleManualAssignmentAuditConstants.STATE_REQUESTED_COUNT, result != null ? result.getRequestedCount() : 0);
        state.put(AccessRoleManualAssignmentAuditConstants.STATE_ADDED_COUNT, result != null ? result.getAddedCount() : 0);
        state.put(AccessRoleManualAssignmentAuditConstants.STATE_SKIPPED_COUNT, result != null ? result.getSkippedCount() : 0);
        state.put(AccessRoleManualAssignmentAuditConstants.STATE_FAILED_COUNT, result != null ? result.getFailedCount() : 0);
        addGrantedMembers(state, AccessRoleManualAssignmentAuditConstants.STATE_ADDED_IDENTITIES,
                result != null ? result.getAdded() : List.of());
        addGrantedMembers(state, AccessRoleManualAssignmentAuditConstants.STATE_SKIPPED_IDENTITIES,
                result != null ? result.getSkipped() : List.of());
        addFailedMembers(state, AccessRoleManualAssignmentAuditConstants.STATE_FAILED_IDENTITIES,
                result != null ? result.getFailed() : List.of());
        return state;
    }

    private List<AccessRoleManualAssignmentAuditEvent.MemberAuditDetail> toAddedMembers(ManualRoleMemberGrantResultDto result) {
        if (result == null || result.getAdded() == null) {
            return List.of();
        }
        return result.getAdded().stream()
                .map(member -> new AccessRoleManualAssignmentAuditEvent.MemberAuditDetail(
                        member.getIdentityId() != null ? member.getIdentityId().toString() : null,
                        member.getIdentityName(),
                        member.getIdentityType()))
                .toList();
    }

    private List<AccessRoleManualAssignmentAuditEvent.MemberAuditDetail> toSkippedMembers(ManualRoleMemberGrantResultDto result) {
        if (result == null || result.getSkipped() == null) {
            return List.of();
        }
        return result.getSkipped().stream()
                .map(member -> new AccessRoleManualAssignmentAuditEvent.MemberAuditDetail(
                        member.getIdentityId() != null ? member.getIdentityId().toString() : null,
                        member.getIdentityName(),
                        member.getIdentityType()))
                .toList();
    }

    private List<AccessRoleManualAssignmentAuditEvent.FailedMemberAuditDetail> toFailedMembers(ManualRoleMemberGrantResultDto result) {
        if (result == null || result.getFailed() == null) {
            return List.of();
        }
        return result.getFailed().stream()
                .map(member -> new AccessRoleManualAssignmentAuditEvent.FailedMemberAuditDetail(
                        member.getIdentityId() != null ? member.getIdentityId().toString() : null,
                        member.getIdentityName(),
                        member.getIdentityType(),
                        member.getReason()))
                .toList();
    }

    private void addGrantedMembers(ObjectNode state,
                                   String fieldName,
                                   List<ManualRoleMemberGrantResultDto.GrantedIdentity> members) {
        ArrayNode arrayNode = state.putArray(fieldName);
        for (ManualRoleMemberGrantResultDto.GrantedIdentity member : members) {
            ObjectNode node = objectMapper.createObjectNode();
            if (member.getIdentityId() != null) {
                node.put("identityId", member.getIdentityId().toString());
            }
            if (member.getIdentityName() != null) {
                node.put("identityName", member.getIdentityName());
            }
            if (member.getIdentityType() != null) {
                node.put("identityType", member.getIdentityType());
            }
            arrayNode.add(node);
        }
    }

    private void addFailedMembers(ObjectNode state,
                                  String fieldName,
                                  List<ManualRoleMemberGrantResultDto.FailedIdentity> members) {
        ArrayNode arrayNode = state.putArray(fieldName);
        for (ManualRoleMemberGrantResultDto.FailedIdentity member : members) {
            ObjectNode node = objectMapper.createObjectNode();
            if (member.getIdentityId() != null) {
                node.put("identityId", member.getIdentityId().toString());
            }
            if (member.getIdentityName() != null) {
                node.put("identityName", member.getIdentityName());
            }
            if (member.getIdentityType() != null) {
                node.put("identityType", member.getIdentityType());
            }
            if (member.getReason() != null) {
                node.put("reason", member.getReason());
            }
            arrayNode.add(node);
        }
    }

    private String resolveActorId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null && !authentication.getName().isBlank()) {
            return authentication.getName();
        }
        return AppConstants.AUDIT_ACTOR_SYSTEM_ID;
    }

    private String resolveActorUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null && !authentication.getName().isBlank()) {
            return authentication.getName();
        }
        return AppConstants.AUDIT_ACTOR_SYSTEM_USERNAME;
    }
}

