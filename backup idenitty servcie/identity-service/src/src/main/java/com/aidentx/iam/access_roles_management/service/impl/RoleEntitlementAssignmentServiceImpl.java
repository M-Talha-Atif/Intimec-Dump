package com.aidentx.iam.access_roles_management.service.impl;

import com.aidentx.iam.access_roles_management.config.constants.AccessRoleAssignmentRuleConstants;
import com.aidentx.iam.access_roles_management.model.entity.IdentityRoleAssignment;
import com.aidentx.iam.access_roles_management.repository.IdentityRoleAssignmentRepository;
import com.aidentx.iam.access_roles_management.service.RoleEntitlementAssignmentService;
import com.aidentx.iam.access_roles_management.service.RoleEntitlementResolutionService;
import com.aidentx.iam.entitlement_management.model.entity.Entitlement;
import com.aidentx.iam.entitlement_management.model.entity.EntitlementAssignment;
import com.aidentx.iam.entitlement_management.repository.EntitlementAssignmentRepository;
import com.aidentx.iam.entitlement_management.repository.EntitlementRepository;
import com.aidentx.iam.shadow_management.model.entity.Shadow;
import com.aidentx.iam.shadow_management.repository.ShadowRepository;
import com.aidentx.logging.service.IUnifiedLogger;
import com.aidentx.logging.service.UnifiedLoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Default role-to-entitlement propagation service.
 *
 * <p>When an identity receives an access role, this service resolves the role's effective
 * direct + inherited entitlements and assigns them to the identity's linked account shadows.
 * When that role is revoked, the service removes only the entitlement assignments that are no
 * longer justified by any remaining active access-role assignments for the same identity.</p>
 */
@Service
public class RoleEntitlementAssignmentServiceImpl implements RoleEntitlementAssignmentService {

    private final RoleEntitlementResolutionService resolutionService;
    private final EntitlementRepository entitlementRepository;
    private final EntitlementAssignmentRepository entitlementAssignmentRepository;
    private final ShadowRepository shadowRepository;
    private final IdentityRoleAssignmentRepository identityRoleAssignmentRepository;
    private final IUnifiedLogger logger;

    public RoleEntitlementAssignmentServiceImpl(RoleEntitlementResolutionService resolutionService,
                                                EntitlementRepository entitlementRepository,
                                                EntitlementAssignmentRepository entitlementAssignmentRepository,
                                                ShadowRepository shadowRepository,
                                                IdentityRoleAssignmentRepository identityRoleAssignmentRepository,
                                                UnifiedLoggerFactory loggerFactory) {
        this.resolutionService = resolutionService;
        this.entitlementRepository = entitlementRepository;
        this.entitlementAssignmentRepository = entitlementAssignmentRepository;
        this.shadowRepository = shadowRepository;
        this.identityRoleAssignmentRepository = identityRoleAssignmentRepository;
        this.logger = loggerFactory.getLogger(getClass(), AccessRoleAssignmentRuleConstants.LOG_CATEGORY);
    }

    /** {@inheritDoc} */
    @Override
    @Transactional
    public void applyRoleEntitlements(String tenantId,
                                      UUID identityId,
                                      UUID roleId,
                                      UUID assignmentRuleId,
                                      IdentityRoleAssignment.SourceType sourceType) {
        validateInputs(tenantId, identityId, roleId);

        String assignmentSource = resolveAssignmentSource(sourceType);

        logger.info()
                .category(AccessRoleAssignmentRuleConstants.LOG_CATEGORY)
                .message(AccessRoleAssignmentRuleConstants.LOG_ROLE_ENTITLEMENT_SYNC_STARTED)
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_TENANT_ID, tenantId)
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_IDENTITY_ID, identityId.toString())
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_ROLE_ID, roleId.toString())
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_RULE_ID, stringifyUuid(assignmentRuleId))
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_SOURCE_TYPE, assignmentSource)
                .log();

        List<Entitlement> effectiveEntitlements = loadEffectiveEntitlements(tenantId, roleId);
        if (effectiveEntitlements.isEmpty()) {
            logger.debug()
                    .category(AccessRoleAssignmentRuleConstants.LOG_CATEGORY)
                    .message(AccessRoleAssignmentRuleConstants.LOG_ROLE_ENTITLEMENT_SYNC_SKIPPED_NO_ENTITLEMENTS)
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_TENANT_ID, tenantId)
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_IDENTITY_ID, identityId.toString())
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_ROLE_ID, roleId.toString())
                    .log();
            return;
        }

        List<Shadow> eligibleShadows = loadEligibleAccountShadows(tenantId, identityId);
        if (eligibleShadows.isEmpty()) {
            logger.debug()
                    .category(AccessRoleAssignmentRuleConstants.LOG_CATEGORY)
                    .message(AccessRoleAssignmentRuleConstants.LOG_ROLE_ENTITLEMENT_SYNC_SKIPPED_NO_SHADOWS)
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_TENANT_ID, tenantId)
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_IDENTITY_ID, identityId.toString())
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_ROLE_ID, roleId.toString())
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_ENTITLEMENT_COUNT, String.valueOf(effectiveEntitlements.size()))
                    .log();
            return;
        }

        List<RoleEntitlementTarget> targets = buildTargets(effectiveEntitlements, eligibleShadows);
        if (targets.isEmpty()) {
            logger.debug()
                    .category(AccessRoleAssignmentRuleConstants.LOG_CATEGORY)
                    .message(AccessRoleAssignmentRuleConstants.LOG_ROLE_ENTITLEMENT_SYNC_SKIPPED_NO_SHADOWS)
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_TENANT_ID, tenantId)
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_IDENTITY_ID, identityId.toString())
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_ROLE_ID, roleId.toString())
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_ENTITLEMENT_COUNT, String.valueOf(effectiveEntitlements.size()))
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_SHADOW_COUNT, String.valueOf(eligibleShadows.size()))
                    .log();
            return;
        }

        Map<String, EntitlementAssignment> existingAssignments = loadExistingAssignments(tenantId, targets);
        List<EntitlementAssignment> assignmentsToSave = new ArrayList<>();
        for (RoleEntitlementTarget target : targets) {
            EntitlementAssignment existingAssignment = existingAssignments.get(target.key());
            if (existingAssignment != null) {
                if (isDynamicAssignment(existingAssignment) && existingAssignment.getAccessRoleId() == null) {
                    existingAssignment.setAccessRoleId(roleId);
                    assignmentsToSave.add(existingAssignment);
                }
                continue;
            }
            EntitlementAssignment assignment = new EntitlementAssignment();
            assignment.setTenantId(tenantId);
            assignment.setShadowId(target.shadowId());
            assignment.setEntitlementId(target.entitlementId());
            assignment.setResourceId(target.resourceId());
            assignment.setSource(assignmentSource);
            assignment.setRuleId(assignmentRuleId);
            assignment.setAccessRoleId(roleId);
            assignmentsToSave.add(assignment);
        }

        if (!assignmentsToSave.isEmpty()) {
            entitlementAssignmentRepository.saveAll(assignmentsToSave);
        }

        logger.info()
                .category(AccessRoleAssignmentRuleConstants.LOG_CATEGORY)
                .message(AccessRoleAssignmentRuleConstants.LOG_ROLE_ENTITLEMENT_SYNC_COMPLETED)
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_TENANT_ID, tenantId)
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_IDENTITY_ID, identityId.toString())
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_ROLE_ID, roleId.toString())
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_ENTITLEMENT_COUNT, String.valueOf(effectiveEntitlements.size()))
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_SHADOW_COUNT, String.valueOf(eligibleShadows.size()))
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_EXISTING_COUNT, String.valueOf(existingAssignments.size()))
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_CREATED_COUNT, String.valueOf(assignmentsToSave.size()))
                .log();
    }

    /** {@inheritDoc} */
    @Override
    @Transactional
    public void revokeRoleEntitlements(String tenantId, UUID identityId, UUID roleId, UUID assignmentRuleId) {
        validateInputs(tenantId, identityId, roleId);

        logger.info()
                .category(AccessRoleAssignmentRuleConstants.LOG_CATEGORY)
                .message(AccessRoleAssignmentRuleConstants.LOG_ROLE_ENTITLEMENT_REVOKE_STARTED)
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_TENANT_ID, tenantId)
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_IDENTITY_ID, identityId.toString())
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_ROLE_ID, roleId.toString())
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_RULE_ID, stringifyUuid(assignmentRuleId))
                .log();

        List<Entitlement> roleEntitlements = loadEffectiveEntitlements(tenantId, roleId);
        if (roleEntitlements.isEmpty()) {
            logger.debug()
                    .category(AccessRoleAssignmentRuleConstants.LOG_CATEGORY)
                    .message(AccessRoleAssignmentRuleConstants.LOG_ROLE_ENTITLEMENT_REVOKE_SKIPPED)
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_TENANT_ID, tenantId)
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_IDENTITY_ID, identityId.toString())
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_ROLE_ID, roleId.toString())
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_ENTITLEMENT_COUNT, String.valueOf(0))
                    .log();
            return;
        }

        List<Shadow> eligibleShadows = loadEligibleAccountShadows(tenantId, identityId);
        if (eligibleShadows.isEmpty()) {
            logger.debug()
                    .category(AccessRoleAssignmentRuleConstants.LOG_CATEGORY)
                    .message(AccessRoleAssignmentRuleConstants.LOG_ROLE_ENTITLEMENT_REVOKE_SKIPPED)
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_TENANT_ID, tenantId)
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_IDENTITY_ID, identityId.toString())
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_ROLE_ID, roleId.toString())
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_ENTITLEMENT_COUNT, String.valueOf(roleEntitlements.size()))
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_SHADOW_COUNT, String.valueOf(0))
                    .log();
            return;
        }

        List<RoleEntitlementTarget> targets = buildTargets(roleEntitlements, eligibleShadows);
        Map<String, EntitlementAssignment> existingAssignments = loadExistingAssignments(tenantId, targets);
        if (existingAssignments.isEmpty()) {
            logger.debug()
                    .category(AccessRoleAssignmentRuleConstants.LOG_CATEGORY)
                    .message(AccessRoleAssignmentRuleConstants.LOG_ROLE_ENTITLEMENT_REVOKE_SKIPPED)
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_TENANT_ID, tenantId)
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_IDENTITY_ID, identityId.toString())
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_ROLE_ID, roleId.toString())
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_ENTITLEMENT_COUNT, String.valueOf(roleEntitlements.size()))
                    .detail(AccessRoleAssignmentRuleConstants.DETAIL_SHADOW_COUNT, String.valueOf(eligibleShadows.size()))
                    .log();
            return;
        }

        List<IdentityRoleAssignment> activeAssignments = findActiveRoleAssignments(tenantId, identityId);
        Set<UUID> retainedEntitlementIds = resolveRetainedEntitlementIds(tenantId, activeAssignments);
        List<EntitlementAssignment> assignmentsToDelete = existingAssignments.values().stream()
                .filter(this::isDynamicAssignment)
                .filter(assignment -> !retainedEntitlementIds.contains(assignment.getEntitlementId()))
                .toList();

        if (!assignmentsToDelete.isEmpty()) {
            entitlementAssignmentRepository.deleteAll(assignmentsToDelete);
        }

        logger.info()
                .category(AccessRoleAssignmentRuleConstants.LOG_CATEGORY)
                .message(AccessRoleAssignmentRuleConstants.LOG_ROLE_ENTITLEMENT_REVOKE_COMPLETED)
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_TENANT_ID, tenantId)
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_IDENTITY_ID, identityId.toString())
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_ROLE_ID, roleId.toString())
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_ENTITLEMENT_COUNT, String.valueOf(roleEntitlements.size()))
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_SHADOW_COUNT, String.valueOf(eligibleShadows.size()))
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_ACTIVE_ROLE_COUNT, String.valueOf(activeAssignments.size()))
                .detail(AccessRoleAssignmentRuleConstants.DETAIL_REMOVED_COUNT, String.valueOf(assignmentsToDelete.size()))
                .log();
    }

    private List<Entitlement> loadEffectiveEntitlements(String tenantId, UUID roleId) {
        List<UUID> entitlementIds = resolutionService.resolveEffectiveEntitlementIds(tenantId, roleId);
        if (entitlementIds.isEmpty()) {
            return List.of();
        }
        return entitlementRepository.findAllById(entitlementIds).stream()
                .filter(entitlement -> tenantId.equals(entitlement.getTenantId()))
                .toList();
    }

    private List<Shadow> loadEligibleAccountShadows(String tenantId, UUID identityId) {
        return shadowRepository.findByLinkedIdentityIdAndTenantId(identityId, tenantId).stream()
                .filter(this::isEligibleAccountShadow)
                .toList();
    }

    private boolean isEligibleAccountShadow(Shadow shadow) {
        if (shadow == null) {
            return false;
        }
        if (!AccessRoleAssignmentRuleConstants.SHADOW_KIND_ACCOUNT.equalsIgnoreCase(shadow.getKind())) {
            return false;
        }
        return shadow.getSynchronizationSituation() != Shadow.SynchronizationSituation.DELETED;
    }

    private List<RoleEntitlementTarget> buildTargets(List<Entitlement> entitlements, List<Shadow> shadows) {
        Map<String, List<Shadow>> shadowsByResourceId = shadows.stream()
                .collect(Collectors.groupingBy(Shadow::getResourceId, LinkedHashMap::new, Collectors.toList()));

        List<RoleEntitlementTarget> targets = new ArrayList<>();
        for (Entitlement entitlement : entitlements) {
            List<Shadow> resourceShadows = shadowsByResourceId.get(entitlement.getResourceId().toString());
            if (resourceShadows == null || resourceShadows.isEmpty()) {
                continue;
            }
            for (Shadow shadow : resourceShadows) {
                targets.add(new RoleEntitlementTarget(
                        shadow.getId(),
                        entitlement.getId(),
                        entitlement.getResourceId(),
                        assignmentKey(shadow.getId(), entitlement.getId())));
            }
        }
        return targets;
    }

    private Map<String, EntitlementAssignment> loadExistingAssignments(String tenantId, List<RoleEntitlementTarget> targets) {
        if (targets.isEmpty()) {
            return Map.of();
        }
        Set<UUID> shadowIds = targets.stream()
                .map(RoleEntitlementTarget::shadowId)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        Set<UUID> entitlementIds = targets.stream()
                .map(RoleEntitlementTarget::entitlementId)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (shadowIds.isEmpty() || entitlementIds.isEmpty()) {
            return Map.of();
        }
        return entitlementAssignmentRepository.findByTenantIdAndShadowIdInAndEntitlementIdIn(tenantId, shadowIds, entitlementIds)
                .stream()
                .collect(Collectors.toMap(
                        assignment -> assignmentKey(assignment.getShadowId(), assignment.getEntitlementId()),
                        assignment -> assignment,
                        (left, right) -> left,
                        LinkedHashMap::new));
    }

    private List<IdentityRoleAssignment> findActiveRoleAssignments(String tenantId, UUID identityId) {
        return identityRoleAssignmentRepository.findByTenantIdAndIdentityIdAndStatus(
                tenantId,
                identityId,
                IdentityRoleAssignment.Status.ACTIVE);
    }

    private Set<UUID> resolveRetainedEntitlementIds(String tenantId, List<IdentityRoleAssignment> activeAssignments) {
        Set<UUID> retainedEntitlements = new LinkedHashSet<>();
        for (IdentityRoleAssignment assignment : activeAssignments) {
            retainedEntitlements.addAll(resolutionService.resolveEffectiveEntitlementIds(tenantId, assignment.getRoleId()));
        }
        return retainedEntitlements;
    }

    private boolean isDynamicAssignment(EntitlementAssignment assignment) {
        String source = assignment.getSource();
        return AccessRoleAssignmentRuleConstants.ENTITLEMENT_ASSIGNMENT_SOURCE_DYNAMIC.equalsIgnoreCase(source)
                || AccessRoleAssignmentRuleConstants.ENTITLEMENT_ASSIGNMENT_SOURCE_MANUAL.equalsIgnoreCase(source);
    }

    private String assignmentKey(UUID shadowId, UUID entitlementId) {
        return shadowId + AccessRoleAssignmentRuleConstants.ASSIGNMENT_KEY_SEPARATOR + entitlementId;
    }

    private void validateInputs(String tenantId, UUID identityId, UUID roleId) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new IllegalArgumentException(AccessRoleAssignmentRuleConstants.ERROR_TENANT_REQUIRED);
        }
        if (identityId == null) {
            throw new IllegalArgumentException(AccessRoleAssignmentRuleConstants.ERROR_IDENTITY_ID_REQUIRED);
        }
        if (roleId == null) {
            throw new IllegalArgumentException(AccessRoleAssignmentRuleConstants.ERROR_ROLE_ID_REQUIRED);
        }
    }

    private String stringifyUuid(UUID value) {
        return value != null ? value.toString() : null;
    }

    private String resolveAssignmentSource(IdentityRoleAssignment.SourceType sourceType) {
        return sourceType == IdentityRoleAssignment.SourceType.MANUAL
                ? AccessRoleAssignmentRuleConstants.ENTITLEMENT_ASSIGNMENT_SOURCE_MANUAL
                : AccessRoleAssignmentRuleConstants.ENTITLEMENT_ASSIGNMENT_SOURCE_DYNAMIC;
    }

    private record RoleEntitlementTarget(UUID shadowId, UUID entitlementId, UUID resourceId, String key) {
    }
}

