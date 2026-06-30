package com.aidentx.iam.access_roles_management.service.impl;

import com.aidentx.iam.access_roles_management.audit.AccessRoleAuditAction;
import com.aidentx.iam.access_roles_management.audit.AuditAccessRoleChange;
import com.aidentx.iam.access_roles_management.config.constants.AccessRoleCompositionConstants;
import com.aidentx.iam.access_roles_management.config.constants.AccessRoleConstants;
import com.aidentx.iam.access_roles_management.mapper.AccessRoleMapper;
import com.aidentx.iam.access_roles_management.model.dto.response.AccessRoleResponse;
import com.aidentx.iam.access_roles_management.model.dto.response.AddChildRolesResultDto;
import com.aidentx.iam.access_roles_management.model.entity.AccessRoleComposition;
import com.aidentx.iam.access_roles_management.repository.AccessRoleCompositionRepository;
import com.aidentx.iam.access_roles_management.repository.AccessRoleEntitlementRepository;
import com.aidentx.iam.access_roles_management.repository.AccessRoleRepository;
import com.aidentx.iam.access_roles_management.service.AccessRoleCompositionService;
import com.aidentx.iam.access_roles_management.service.RoleEntitlementClosureService;
import com.aidentx.iam.access_roles_management.util.AccessRoleCompositionValidator;
import com.aidentx.logging.service.IUnifiedLogger;
import com.aidentx.logging.service.UnifiedLoggerFactory;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of {@link AccessRoleCompositionService}.
 * <p>
 * Manages parent-child relationships between access roles.
 * Enforces circular dependency prevention using BFS-based cycle detection.
 * </p>
 */
@Service
@Transactional
public class AccessRoleCompositionServiceImpl implements AccessRoleCompositionService {

    private final AccessRoleCompositionRepository compositionRepository;
    private final AccessRoleEntitlementRepository entitlementLinkRepository;
    private final AccessRoleRepository roleRepository;
    private final AccessRoleMapper roleMapper;
    private final RoleEntitlementClosureService closureService;
    private final IUnifiedLogger logger;

    /**
     * Constructs the service with persistence, mapping, and logging dependencies.
     *n   n
     * @param compositionRepository the role composition repository
     * @param roleRepository        the access role repository
     * @param roleMapper            the MapStruct mapper
     * @param closureService        closure refresh service for effective role entitlements
     * @param loggerFactory         the unified logger factory
     */
    public AccessRoleCompositionServiceImpl(
            AccessRoleCompositionRepository compositionRepository,
            AccessRoleEntitlementRepository entitlementLinkRepository,
            AccessRoleRepository roleRepository,
            AccessRoleMapper roleMapper,
            RoleEntitlementClosureService closureService,
            UnifiedLoggerFactory loggerFactory) {
        this.compositionRepository = compositionRepository;
        this.entitlementLinkRepository = entitlementLinkRepository;
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
        this.closureService = closureService;
        this.logger = loggerFactory.getLogger(getClass(), AccessRoleCompositionConstants.LOG_CATEGORY);
    }

        /**
     * {@inheritDoc}
     * <p>
     * Processes each child role individually:
     * <ul>
     *   <li>Self-references are rejected with a reason.</li>
     *   <li>Circular dependencies are rejected with a reason.</li>
     *   <li>Duplicate links are skipped silently.</li>
     *   <li>Valid children are persisted.</li>
     * </ul>
     * The operation never throws on individual child failures, allowing
     * partial success so the frontend can show per-child error messages.
     * </p>
     *
     * @throws EntityNotFoundException if the parent role does not exist
     */
    @Override
    public AddChildRolesResultDto addChildRoles(String tenantId, UUID parentRoleId, List<UUID> childRoleIds) {
        validateRoleExists(parentRoleId);

        List<UUID> added = new java.util.ArrayList<>();
        List<UUID> skipped = new java.util.ArrayList<>();
        List<AddChildRolesResultDto.FailedChild> failed = new java.util.ArrayList<>();

        for (UUID childRoleId : childRoleIds) {
            // Self-reference check
            if (parentRoleId.equals(childRoleId)) {
                logger.warn()
                        .category(AccessRoleCompositionConstants.LOG_CATEGORY)
                        .message(AccessRoleCompositionConstants.LOG_SELF_REFERENCE)
                        .detail(AccessRoleCompositionConstants.DETAIL_PARENT_ROLE_ID, parentRoleId.toString())
                        .detail(AccessRoleCompositionConstants.DETAIL_CHILD_ROLE_ID, childRoleId.toString())
                        .log();
                failed.add(new AddChildRolesResultDto.FailedChild(
                        childRoleId, AccessRoleConstants.ERROR_SELF_COMPOSITION));
                continue;
            }

            // Circular dependency check
            if (AccessRoleCompositionValidator.wouldCreateCycle(parentRoleId, childRoleId, compositionRepository)) {
                logger.warn()
                        .category(AccessRoleCompositionConstants.LOG_CATEGORY)
                        .message(AccessRoleCompositionConstants.LOG_CYCLE_DETECTED)
                        .detail(AccessRoleCompositionConstants.DETAIL_PARENT_ROLE_ID, parentRoleId.toString())
                        .detail(AccessRoleCompositionConstants.DETAIL_CHILD_ROLE_ID, childRoleId.toString())
                        .log();
                failed.add(new AddChildRolesResultDto.FailedChild(
                        childRoleId, AccessRoleConstants.ERROR_CIRCULAR_COMPOSITION));
                continue;
            }

            // Duplicate check
            if (compositionRepository.existsByParentRoleIdAndChildRoleId(parentRoleId, childRoleId)) {
                logger.debug()
                        .category(AccessRoleCompositionConstants.LOG_CATEGORY)
                        .message(AccessRoleCompositionConstants.LOG_CHILD_LINK_SKIPPED)
                        .detail(AccessRoleCompositionConstants.DETAIL_PARENT_ROLE_ID, parentRoleId.toString())
                        .detail(AccessRoleCompositionConstants.DETAIL_CHILD_ROLE_ID, childRoleId.toString())
                        .log();
                skipped.add(childRoleId);
                continue;
            }

            // Valid  persist the link
            AccessRoleComposition link = new AccessRoleComposition();
            link.setParentRoleId(parentRoleId);
            link.setChildRoleId(childRoleId);
            compositionRepository.save(link);
            closureService.refreshAfterCompositionChanged(tenantId, parentRoleId, childRoleId);
            added.add(childRoleId);
        }

        logger.info()
                .category(AccessRoleCompositionConstants.LOG_CATEGORY)
                .message(AccessRoleCompositionConstants.LOG_CHILDREN_ADDED)
                .detail(AccessRoleCompositionConstants.DETAIL_PARENT_ROLE_ID, parentRoleId.toString())
                .detail(AccessRoleCompositionConstants.DETAIL_ADDED_COUNT, String.valueOf(added.size()))
                .detail("skippedCount", String.valueOf(skipped.size()))
                .detail("failedCount", String.valueOf(failed.size()))
                .log();

        return new AddChildRolesResultDto(added, skipped, failed);
    }

    /**
     * {@inheritDoc}
     *
     * @throws EntityNotFoundException if the parent role does not exist
     */
    @Override
    public void removeChildRoles(String tenantId, UUID parentRoleId, List<UUID> childRoleIds) {
        validateRoleExists(parentRoleId);

        int removedCount = 0;
        for (UUID childRoleId : childRoleIds) {
            if (compositionRepository.existsByParentRoleIdAndChildRoleId(parentRoleId, childRoleId)) {
                compositionRepository.deleteByParentRoleIdAndChildRoleId(parentRoleId, childRoleId);
                closureService.refreshAfterCompositionChanged(tenantId, parentRoleId, childRoleId);
                removedCount++;
            }
        }

        logger.info()
                .category(AccessRoleCompositionConstants.LOG_CATEGORY)
                .message(AccessRoleCompositionConstants.LOG_CHILDREN_REMOVED)
                .detail(AccessRoleCompositionConstants.DETAIL_PARENT_ROLE_ID, parentRoleId.toString())
                .detail(AccessRoleCompositionConstants.DETAIL_REMOVED_COUNT, String.valueOf(removedCount))
                .log();
    }

    /**
     * {@inheritDoc}
     * <p>
     * Enriches each child role response with its entitlement count
     * using a single batch query to avoid N+1 performance issues.
     * </p>
     */
    @Override
    @Transactional(readOnly = true)
    public List<AccessRoleResponse> getChildRoles(UUID parentRoleId) {
        List<UUID> childIds = compositionRepository.findByParentRoleId(parentRoleId)
                .stream()
                .map(AccessRoleComposition::getChildRoleId)
                .collect(Collectors.toList());

        List<AccessRoleResponse> children = roleRepository.findByIdIn(childIds)
                .stream()
                .map(roleMapper::entityToResponse)
                .collect(Collectors.toList());

        // Enrich with entitlement counts in a single batch query
        enrichWithEntitlementCounts(children, childIds);

        logger.info()
                .category(AccessRoleCompositionConstants.LOG_CATEGORY)
                .message(AccessRoleCompositionConstants.LOG_CHILDREN_FETCHED)
                .detail(AccessRoleCompositionConstants.DETAIL_PARENT_ROLE_ID, parentRoleId.toString())
                .detail(AccessRoleCompositionConstants.DETAIL_CHILDREN_COUNT, String.valueOf(children.size()))
                .log();

        return children;
    }

    /**
     * {@inheritDoc}
     * <p>
     * Enriches each parent role response with its entitlement count
     * using a single batch query to avoid N+1 performance issues.
     * </p>
     */
    @Override
    @Transactional(readOnly = true)
    public List<AccessRoleResponse> getParentRoles(UUID childRoleId) {
        List<UUID> parentIds = compositionRepository.findByChildRoleId(childRoleId)
                .stream()
                .map(AccessRoleComposition::getParentRoleId)
                .collect(Collectors.toList());

        List<AccessRoleResponse> parents = roleRepository.findByIdIn(parentIds)
                .stream()
                .map(roleMapper::entityToResponse)
                .collect(Collectors.toList());

        // Enrich with entitlement counts in a single batch query
        enrichWithEntitlementCounts(parents, parentIds);

        logger.info()
                .category(AccessRoleCompositionConstants.LOG_CATEGORY)
                .message(AccessRoleCompositionConstants.LOG_PARENTS_FETCHED)
                .detail(AccessRoleCompositionConstants.DETAIL_CHILD_ROLE_ID, childRoleId.toString())
                .detail(AccessRoleCompositionConstants.DETAIL_PARENTS_COUNT, String.valueOf(parents.size()))
                .log();

        return parents;
    }

    /**
      * {@inheritDoc}
      */
     @Override
     @Transactional(readOnly = true)
     public List<UUID> getChildRoleIds(UUID parentRoleId) {
         return compositionRepository.findByParentRoleId(parentRoleId)
                 .stream()
                 .map(AccessRoleComposition::getChildRoleId)
                 .collect(Collectors.toList());
     }

    /**
     * Enriches a list of role responses with their entitlement counts.
     * <p>
     * Uses individual count queries per role. For large lists, consider
     * adding a batch count query to the repository.
     * </p>
     *
     * @param roles   the role responses to enrich
     * @param roleIds the corresponding role IDs (same order as entities were loaded)
     */
    private void enrichWithEntitlementCounts(List<AccessRoleResponse> roles, List<UUID> roleIds) {
        if (roles.isEmpty()) return;

        Map<UUID, Long> countMap = new java.util.HashMap<>();
        for (UUID roleId : roleIds) {
            countMap.put(roleId, entitlementLinkRepository.countByRoleId(roleId));
        }

        for (AccessRoleResponse role : roles) {
            Long count = countMap.getOrDefault(role.getId(), 0L);
            role.setEntitlementCount(count);
        }
    }


    /**
     * Validates that the role exists or throws {@link EntityNotFoundException}.
     *
     * @param roleId the role ID to validate
     */
    private void validateRoleExists(UUID roleId) {
        roleRepository.findById(roleId)
                .orElseThrow(() -> {
                    logger.warn()
                            .category(AccessRoleCompositionConstants.LOG_CATEGORY)
                            .message(AccessRoleConstants.LOG_ROLE_NOT_FOUND)
                            .detail(AccessRoleCompositionConstants.DETAIL_PARENT_ROLE_ID, roleId.toString())
                            .log();
                    return new EntityNotFoundException(
                            String.format(AccessRoleConstants.ERROR_ROLE_NOT_FOUND, roleId));
                });
    }
}