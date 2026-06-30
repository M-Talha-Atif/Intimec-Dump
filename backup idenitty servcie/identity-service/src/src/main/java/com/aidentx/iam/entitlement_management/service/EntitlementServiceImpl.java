package com.aidentx.iam.entitlement_management.service;

import com.aidentx.iam.access_roles_management.model.entity.AccessRole;
import com.aidentx.iam.access_roles_management.model.entity.AccessRoleAssignmentRule;
import com.aidentx.iam.access_roles_management.model.entity.RoleEntitlementClosure;
import com.aidentx.iam.access_roles_management.repository.AccessRoleAssignmentRuleRepository;
import com.aidentx.iam.access_roles_management.repository.AccessRoleRepository;
import com.aidentx.iam.access_roles_management.repository.RoleEntitlementClosureRepository;
import com.aidentx.iam.entitlement_management.audit.AuditEntitlementGovernance;
import com.aidentx.iam.entitlement_management.client.ApplicationClient;
import com.aidentx.iam.entitlement_management.config.constants.ApplicationClientConstants;
import com.aidentx.iam.entitlement_management.config.constants.EntitlementMemberConstants;
import com.aidentx.iam.entitlement_management.mapper.EntitlementMapper;
import com.aidentx.iam.entitlement_management.model.dto.EntitlementDtos.EntitlementMemberDto;
import com.aidentx.iam.entitlement_management.model.dto.EntitlementDtos.EntitlementResponseDto;
import com.aidentx.iam.entitlement_management.model.dto.EntitlementDtos.EntitlementSyncDto;
import com.aidentx.iam.entitlement_management.model.dto.EntitlementDtos.EntitlementUpdateDto;
import com.aidentx.iam.entitlement_management.model.dto.EntitlementDtos.FilterOptionDto;
import com.aidentx.iam.entitlement_management.model.dto.EntitlementDtos.FilterValueDto;
import com.aidentx.iam.entitlement_management.model.dto.EntitlementDtos.ShadowEntitlementDto;
import com.aidentx.iam.entitlement_management.model.entity.Entitlement;
import com.aidentx.iam.entitlement_management.model.entity.EntitlementAssignment;
import com.aidentx.iam.entitlement_management.repository.EntitlementAssignmentRepository;
import com.aidentx.iam.entitlement_management.repository.EntitlementRepository;
import com.aidentx.iam.identity_management.model.dto.IdentityEntitlementRolePathNodeDto;
import com.aidentx.iam.identity_management.model.dto.IdentityEntitlementViewDto;
import com.aidentx.iam.identity_management.model.entity.Employee;
import com.aidentx.iam.identity_management.repository.EmployeeRepository;
import com.aidentx.iam.shadow_management.model.entity.Shadow;
import com.aidentx.iam.shadow_management.repository.ShadowRepository;
import com.aidentx.iam.shadow_management.sync.EntitlementMappingEngine;
import com.aidentx.iam.shadow_management.sync.EntitlementMappingEngine.EntitlementMappingResult;
import com.aidentx.logging.service.IUnifiedLogger;
import com.aidentx.logging.service.UnifiedLoggerFactory;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

/**
 * Production implementation of {@link EntitlementService}.
 *
 * <p>Handles the full entitlement lifecycle:
 * <ul>
 *   <li><b>Sync pipeline</b> â€” createOrUpdateFromSync, membership processing,
 *       deletion detection via finalizeEntitlementSyncRun</li>
 *   <li><b>Governance projection</b> â€” invokes {@link EntitlementMappingEngine} to
 *       derive governance metadata (riskLevel, lifecycle, classification, ...) from
 *       raw connector attributes using admin-configured mapping rules</li>
 *   <li><b>Catalog API</b> â€” search, filter, pagination, member enumeration,
 *       assignmentSource / assignedUsers range filters</li>
 *   <li><b>Performance</b> â€” G1-G4 optimisations: pre-loaded catalog maps,
 *       assignment-key sets, batch upserts, bulk deletes</li>
 * </ul>
 */
@Service
public class EntitlementServiceImpl implements EntitlementService {

    private final EntitlementRepository entitlementRepository;
    private final EntitlementAssignmentRepository assignmentRepository;
    private final EntitlementMapper entitlementMapper;
    private final EntitlementMappingEngine mappingEngine;
    private final ShadowRepository shadowRepository;
    private final EmployeeRepository employeeRepository;
    private final ApplicationClient applicationClient;
    private final EntitlementSchemaService entitlementSchemaService;
    private final AccessRoleRepository accessRoleRepository;
    private final AccessRoleAssignmentRuleRepository accessRoleAssignmentRuleRepository;
    private final RoleEntitlementClosureRepository roleEntitlementClosureRepository;
    private final IUnifiedLogger logger;

    public EntitlementServiceImpl(EntitlementRepository entitlementRepository,
                                  EntitlementAssignmentRepository assignmentRepository,
                                  EntitlementMapper entitlementMapper,
                                  EntitlementMappingEngine mappingEngine,
                                  ShadowRepository shadowRepository,
                                  EmployeeRepository employeeRepository,
                                  ApplicationClient applicationClient,
                                  EntitlementSchemaService entitlementSchemaService,
                                   AccessRoleRepository accessRoleRepository,
                                   AccessRoleAssignmentRuleRepository accessRoleAssignmentRuleRepository,
                                   RoleEntitlementClosureRepository roleEntitlementClosureRepository,
                                  UnifiedLoggerFactory loggerFactory) {
        this.entitlementRepository = entitlementRepository;
        this.assignmentRepository = assignmentRepository;
        this.entitlementMapper = entitlementMapper;
        this.mappingEngine = mappingEngine;
        this.shadowRepository = shadowRepository;
        this.employeeRepository = employeeRepository;
        this.applicationClient = applicationClient;
        this.entitlementSchemaService = entitlementSchemaService;
        this.accessRoleRepository = accessRoleRepository;
        this.accessRoleAssignmentRuleRepository = accessRoleAssignmentRuleRepository;
        this.roleEntitlementClosureRepository = roleEntitlementClosureRepository;
        this.logger = loggerFactory.getLogger(EntitlementServiceImpl.class);
    }

    // ===================================================================
    //  Sync Pipeline
    // ===================================================================

    @Override
    @Transactional
    public EntitlementResponseDto createOrUpdateFromSync(EntitlementSyncDto syncDto) {
        Optional<Entitlement> existing = entitlementRepository
                .findByResourceIdAndSourceUidAndTenantId(
                        syncDto.resourceId(), syncDto.sourceUid(), syncDto.tenantId());

        Entitlement entitlement;
        boolean isNew;

        if (existing.isPresent()) {
            entitlement = existing.get();
            isNew = false;

            // Update technical/sync fields only -- governance fields are NOT overwritten
            entitlementMapper.updateEntityFromSyncDto(syncDto, entitlement);
            entitlement.setLastSyncRunId(syncDto.lastSyncRunId());

            // Re-apply governance mapping on every sync so rules stay current
            applyGovernanceMappings(entitlement, syncDto);
        } else {
            entitlement = entitlementMapper.syncDtoToEntity(syncDto);
            isNew = true;

            // Apply governance mappings to populate governance fields from connector attrs
            applyGovernanceMappings(entitlement, syncDto);
        }

        entitlement = entitlementRepository.save(entitlement);

        logger.debug().message(isNew ? "Created entitlement from sync" : "Updated entitlement from sync")
                .detail("entitlementId", entitlement.getId())
                .detail("sourceUid", syncDto.sourceUid())
                .detail("resourceId", syncDto.resourceId())
                .log();

        return toResponseDto(entitlement, 0L);
    }

    @Override
    @Transactional
    public void assignEntitlementToShadow(UUID shadowId, UUID entitlementId, UUID resourceId,
                                          String tenantId, String syncRunId) {
        Optional<EntitlementAssignment> existing =
                assignmentRepository.findByShadowIdAndEntitlementIdAndTenantId(shadowId, entitlementId, tenantId);

        if (existing.isPresent()) {
            EntitlementAssignment assignment = existing.get();
            assignment.setLastSyncRunId(syncRunId);
            assignmentRepository.save(assignment);
        } else {
            EntitlementAssignment assignment = new EntitlementAssignment();
            assignment.setTenantId(tenantId);
            assignment.setShadowId(shadowId);
            assignment.setEntitlementId(entitlementId);
            assignment.setResourceId(resourceId);
            assignment.setSource("IMPORT");
            assignment.setLastSyncRunId(syncRunId);
            assignmentRepository.save(assignment);

            logger.debug().message("Created entitlement assignment.")
                    .detail("shadowId", shadowId)
                    .detail("entitlementId", entitlementId)
                    .log();
        }
    }

    @Override
    @Transactional
    public int processAccountMemberships(UUID shadowId, UUID resourceId, String tenantId,
                                         String syncRunId, Map<String, Object> attributes) {
        // Delegate to cached variant with a freshly-loaded catalog (avoids per-ref DB hits)
        Map<String, UUID> catalog = loadEntitlementCatalogMap(resourceId, tenantId);
        return processAccountMembershipsWithCache(shadowId, resourceId, tenantId, syncRunId, attributes, catalog);
    }

    @Override
    @Transactional
    public int processAccountMembershipsWithCache(UUID shadowId, UUID resourceId, String tenantId,
                                                  String syncRunId, Map<String, Object> attributes,
                                                  Map<String, UUID> entitlementCatalog) {
        // G1 optimized: O(1) map lookup instead of DB query per reference
        List<String> memberRefs = extractMembershipReferences(attributes);
        if (memberRefs.isEmpty()) {
            return 0;
        }

        int resolved = 0;
        long now = Instant.now().toEpochMilli();

        for (String ref : memberRefs) {
            UUID entitlementId = entitlementCatalog.get(ref);
            if (entitlementId == null) {
                logger.debug().message("Unresolved membership reference (group not yet cataloged)")
                        .detail("shadowId", shadowId)
                        .detail("memberRef", ref)
                        .detail("resourceId", resourceId)
                        .log();
                continue;
            }

            assignmentRepository.upsertAssignment(
                    UUID.randomUUID(), tenantId, shadowId, entitlementId,
                    resourceId, "IMPORT", syncRunId, now);
            resolved++;
        }

        if (resolved > 0) {
            logger.debug().message("Processed account memberships (cache-optimized)")
                    .detail("shadowId", shadowId)
                    .detail("resolved", resolved)
                    .detail("total", memberRefs.size())
                    .log();
        }

        return resolved;
    }

    @Override
    @Transactional
    public int[] finalizeEntitlementSyncRun(UUID resourceId, String tenantId, String syncRunId,
                                            boolean skipAssignmentCleanup) {
        logger.debug().message("Starting entitlement reconciliation")
                .detail("resourceId", resourceId)
                .detail("syncRunId", syncRunId)
                .detail("skipAssignmentCleanup", skipAssignmentCleanup)
                .log();

        // Phase 1: Delete assignments tied to absent entitlements (cascade-style, before deleting entitlements)
        int revokedAssignments = 0;
        if (!skipAssignmentCleanup) {
            revokedAssignments += assignmentRepository.deleteAssignmentsForAbsentEntitlements(
                    resourceId, tenantId, syncRunId);

            // Also delete stale assignments (assignments whose lastSyncRunId doesn't match this run)
            // MUST be skipped when importAccounts=false to avoid wiping all prior assignments
            revokedAssignments += assignmentRepository.deleteStaleAssignmentsBulk(
                    resourceId, tenantId, syncRunId);
        }

        // Phase 2: Delete absent entitlements (not seen in this sync run)
        int deletedEntitlements = entitlementRepository.deleteAbsentEntitlements(
                resourceId, tenantId, syncRunId);

        logger.info().message("Entitlement reconciliation completed (bulk optimized)")
                .detail("resourceId", resourceId)
                .detail("deletedEntitlements", deletedEntitlements)
                .detail("revokedAssignments", revokedAssignments)
                .log();

        return new int[]{ deletedEntitlements, revokedAssignments };
    }

    // ===================================================================
    //  B3b: Dry-run preview -- list entitlements that WOULD be deleted
    //  Two overloads: simple (from your branch) + seenUids-aware (from dev branch)
    // ===================================================================

    @Override
    @Transactional(readOnly = true)
    public List<Object[]> previewEntitlementCleanup(UUID resourceId, String tenantId, String syncRunId) {
        return previewEntitlementCleanup(resourceId, tenantId, syncRunId, Collections.emptySet());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Object[]> previewEntitlementCleanup(UUID resourceId, String tenantId, String syncRunId,
                                                    Set<String> seenEntitlementUids) {
        // Fetch all entitlements NOT seen in this sync run (capped at 500 for preview safety)
        Page<Entitlement> absentPage = entitlementRepository.findAbsentEntitlements(
                resourceId, tenantId, syncRunId,
                org.springframework.data.domain.PageRequest.of(0, 500));

        List<Object[]> previews = new ArrayList<>();
        for (Entitlement e : absentPage.getContent()) {
            // In dry-run mode, the syncRunId is not stamped. Exclude entitlements
            // that were actually seen (tracked in the dedup cache).
            if (seenEntitlementUids.contains(e.getSourceUid())) {
                continue;
            }
            long assignmentCount = assignmentRepository.countByEntitlementIdAndTenantId(e.getId(), tenantId);
            previews.add(new Object[]{
                    e.getId(), e.getSourceUid(), e.getDisplayName(), e.getObjectClass(), assignmentCount
            });
        }
        return previews;
    }

    // ===================================================================
    //  Performance Optimizations (G1-G5)
    // ===================================================================

    @Override
    @Transactional(readOnly = true)
    public Map<String, UUID> loadEntitlementCatalogMap(UUID resourceId, String tenantId) {
        logger.debug().message("Loading entitlement catalog into memory")
                .detail("resourceId", resourceId)
                .detail("tenantId", tenantId)
                .log();

        List<Object[]> rows = entitlementRepository.findAllIdsAndSourceUids(resourceId, tenantId);
        Map<String, UUID> catalog = new HashMap<>(rows.size());
        for (Object[] row : rows) {
            UUID id = (UUID) row[0];
            String sourceUid = (String) row[1];
            catalog.put(sourceUid, id);
        }

        logger.info().message("Entitlement catalog loaded")
                .detail("resourceId", resourceId)
                .detail("entriesLoaded", catalog.size())
                .log();

        return catalog;
    }

    @Override
    @Transactional(readOnly = true)
    public Set<String> loadAssignmentKeysSet(UUID resourceId, String tenantId) {
        logger.debug().message("Loading assignment keys into memory")
                .detail("resourceId", resourceId)
                .detail("tenantId", tenantId)
                .log();

        List<Object[]> rows = assignmentRepository.findAllAssignmentKeys(resourceId, tenantId);
        Set<String> keys = new HashSet<>(rows.size());
        for (Object[] row : rows) {
            UUID shadowId = (UUID) row[0];
            UUID entitlementId = (UUID) row[1];
            keys.add(shadowId + "|" + entitlementId);
        }

        logger.info().message("Assignment keys loaded")
                .detail("resourceId", resourceId)
                .detail("keysLoaded", keys.size())
                .log();

        return keys;
    }

    @Override
    @Transactional
    public void batchUpsertAssignments(List<UUID[]> shadowEntitlementPairs, UUID resourceId,
                                       String tenantId, String syncRunId) {
        if (shadowEntitlementPairs == null || shadowEntitlementPairs.isEmpty()) {
            return;
        }

        logger.debug().message("Batch upserting assignments")
                .detail("batchSize", shadowEntitlementPairs.size())
                .log();

        long now = Instant.now().toEpochMilli();
        for (UUID[] pair : shadowEntitlementPairs) {
            assignmentRepository.upsertAssignment(
                    UUID.randomUUID(), tenantId, pair[0], pair[1],
                    resourceId, "IMPORT", syncRunId, now);
        }

        logger.debug().message("Batch upsert completed")
                .detail("upsertedCount", shadowEntitlementPairs.size())
                .log();
    }

    // ===================================================================
    //  API / Catalog Operations
    // ===================================================================

    @Override
    @Transactional(readOnly = true)
    public Optional<EntitlementResponseDto> findById(UUID id) {
        return entitlementRepository.findById(id)
                .map(e -> {
                    long count = assignmentRepository.countByEntitlementIdAndTenantId(e.getId(), e.getTenantId());
                    Set<String> customKeys = loadCustomAttributeKeys(e.getTenantId());
                    // Resolve resource name for single-entity fetch
                    Map<UUID, String> appMap = applicationClient.getApplicationNames(
                            e.getTenantId(), List.of(e.getResourceId()));
                    return toResponseDto(e, count, customKeys, appMap.getOrDefault(e.getResourceId(), null));
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EntitlementResponseDto> findAll(String tenantId, UUID resourceId, String search,
                                                String riskLevel, String lifecycle, String kind,
                                                Boolean classified, Boolean requestable,
                                                Boolean hasOwner, UUID ownerId,
                                                String assignmentSource, Long minAssignedUsers,
                                                Long maxAssignedUsers, Pageable pageable) {
        Specification<Entitlement> spec = buildSpecification(tenantId, resourceId, search,
                riskLevel, lifecycle, kind, classified, requestable, hasOwner, ownerId,
                assignmentSource, minAssignedUsers, maxAssignedUsers);

        Page<Entitlement> page = entitlementRepository.findAll(spec, pageable);
        return enrichPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EntitlementResponseDto> findByResourceId(UUID resourceId, String tenantId, Pageable pageable) {
        Page<Entitlement> page = entitlementRepository.findByResourceIdAndTenantId(resourceId, tenantId, pageable);
        return enrichPage(page);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EntitlementResponseDto> searchByResource(UUID resourceId, String tenantId,
                                                         String search, String riskLevel,
                                                         String lifecycle, String kind,
                                                         Pageable pageable) {
        Specification<Entitlement> spec = buildSpecification(tenantId, resourceId, search,
                riskLevel, lifecycle, kind, null, null, null, null, null, null, null);
        Page<Entitlement> page = entitlementRepository.findAll(spec, pageable);
        return enrichPage(page);
    }

    @Override
    @Transactional
    @AuditEntitlementGovernance(idParamIndex = 0, tenantIdParamIndex = 1, updateDtoParamIndex = 2)
    public EntitlementResponseDto updateGovernance(UUID id, String tenantId, EntitlementUpdateDto updateDto) {
        Entitlement entitlement = entitlementRepository.findById(id)
                .filter(e -> e.getTenantId().equals(tenantId))
                .orElseThrow(() -> new EntityNotFoundException("Entitlement not found: " + id));

        entitlementMapper.updateEntityFromGovernanceDto(updateDto, entitlement);
        entitlement = entitlementRepository.save(entitlement);

        long count = assignmentRepository.countByEntitlementIdAndTenantId(id, tenantId);

        logger.info().message("Updated entitlement governance metadata")
                .detail("entitlementId", id)
                .detail("tenantId", tenantId)
                .detail("kind", updateDto.kind())
                .log();

        Set<String> customKeys = loadCustomAttributeKeys(tenantId);
        return toResponseDto(entitlement, count, customKeys);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EntitlementMemberDto> getEntitlementMembers(UUID entitlementId, String tenantId, Pageable pageable) {
        Page<EntitlementAssignment> assignments =
                assignmentRepository.findByEntitlementIdAndTenantId(entitlementId, tenantId, pageable);

        Page<EntitlementMemberDto> result = assignments.map(ea -> {
            String accountName = null;
            UUID identityId = null;
            String identityName = null;

            Optional<Shadow> shadowOpt = shadowRepository.findById(ea.getShadowId());
            if (shadowOpt.isPresent()) {
                Shadow shadow = shadowOpt.get();
                accountName = shadow.getResourceUid();
                identityId = shadow.getLinkedIdentityId();
                if (identityId != null) {
                    identityName = resolveIdentityName(tenantId, identityId);
                }
            }

            // Role context
            UUID accessRoleId = ea.getAccessRoleId();
            String accessRoleName = null;
            String assignmentPath = null;
            if (accessRoleId != null) {
                Optional<AccessRole> roleOpt = accessRoleRepository.findById(accessRoleId);
                if (roleOpt.isPresent()) {
                    AccessRole role = roleOpt.get();
                    accessRoleName = role.getDisplayName() != null
                            ? role.getDisplayName() : role.getName();
                    assignmentPath = accessRoleName;
                    logger.info()
                            .message(EntitlementMemberConstants.LOG_ROLE_RESOLVED)
                            .detail(EntitlementMemberConstants.DETAIL_ASSIGNMENT_ID, ea.getId().toString())
                            .detail(EntitlementMemberConstants.DETAIL_ACCESS_ROLE_ID, accessRoleId.toString())
                            .log();
                } else {
                    logger.warn()
                            .message(EntitlementMemberConstants.LOG_ROLE_NOT_FOUND)
                            .detail(EntitlementMemberConstants.DETAIL_ASSIGNMENT_ID, ea.getId().toString())
                            .detail(EntitlementMemberConstants.DETAIL_ACCESS_ROLE_ID, accessRoleId.toString())
                            .log();
                }
            }

            // Assignment status — existing rows in entitlement_assignments are always ASSIGNED
            String assignmentStatus = EntitlementMemberConstants.STATUS_ASSIGNED;
            String assignmentStatusReason = null;

            return new EntitlementMemberDto(
                    ea.getId(),
                    ea.getShadowId(),
                    accountName,
                    identityId,
                    identityName,
                    ea.getSource(),
                    ea.getAssignedAt(),
                    ea.getUpdatedAt(),
                    accessRoleId,
                    accessRoleName,
                    assignmentPath,
                    assignmentStatus,
                    assignmentStatusReason
            );
        });

        logger.info()
                .message(EntitlementMemberConstants.LOG_MEMBERS_FETCHED)
                .detail(EntitlementMemberConstants.DETAIL_TENANT_ID, tenantId)
                .detail(EntitlementMemberConstants.DETAIL_ENTITLEMENT_ID, entitlementId.toString())
                .detail(EntitlementMemberConstants.DETAIL_MEMBER_COUNT, String.valueOf(result.getTotalElements()))
                .log();

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ShadowEntitlementDto> getShadowEntitlements(UUID shadowId, String tenantId, Pageable pageable) {
        Page<EntitlementAssignment> assignments =
                assignmentRepository.findByShadowIdAndTenantId(shadowId, tenantId, pageable);

        return assignments.map(ea -> {
            String entitlementName = null;
            String entitlementType = null;
            String objectClass = null;
            String riskLevel = null;

            Optional<Entitlement> entOpt = entitlementRepository.findById(ea.getEntitlementId());
            if (entOpt.isPresent()) {
                Entitlement ent = entOpt.get();
                entitlementName = ent.getDisplayName();
                entitlementType = ent.getKind();
                objectClass = ent.getObjectClass();
                riskLevel = ent.getRiskLevel();
            }

            return new ShadowEntitlementDto(
                    ea.getId(),
                    ea.getEntitlementId(),
                    entitlementName,
                    entitlementType,
                    objectClass,
                    riskLevel,
                    ea.getSource(),
                    ea.getAssignedAt()
            );
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<FilterOptionDto> getFilterOptions(UUID resourceId, String tenantId) {
        List<FilterOptionDto> filters = new ArrayList<>();

        List<String> riskLevels = entitlementRepository.findDistinctRiskLevels(resourceId, tenantId);
        if (!riskLevels.isEmpty()) {
            filters.add(new FilterOptionDto("riskLevel", "Risk Level",
                    riskLevels.stream().map(v -> new FilterValueDto(v, v, 0)).toList()));
        }

        List<String> lifecycles = entitlementRepository.findDistinctLifecycles(resourceId, tenantId);
        if (!lifecycles.isEmpty()) {
            filters.add(new FilterOptionDto("lifecycle", "Lifecycle",
                    lifecycles.stream().map(v -> new FilterValueDto(v, v, 0)).toList()));
        }

        // "kind" key used (dev branch correction: more accurate than "type" from access-portal branch)
        List<String> kinds = entitlementRepository.findDistinctKinds(resourceId, tenantId);
        if (!kinds.isEmpty()) {
            filters.add(new FilterOptionDto("kind", "Kind",
                    kinds.stream().map(v -> new FilterValueDto(v, v, 0)).toList()));
        }

        return filters;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<IdentityEntitlementViewDto> getEntitlementsByIdentityId(UUID identityId, String tenantId,
                                                                        String search, Pageable pageable) {
        List<UUID> shadowIds = shadowRepository.findShadowIdsByLinkedIdentityId(identityId, tenantId);

        if (shadowIds.isEmpty()) {
            logger.debug().message("No shadows found for identity")
                    .detail("identityId", identityId)
                    .log();
            return Page.empty(pageable);
        }

        Page<EntitlementAssignment> assignmentPage;
        if (search != null && !search.isBlank()) {
            String searchPattern = "%" + search.trim().toLowerCase() + "%";
            assignmentPage = assignmentRepository
                    .findByShadowIdInAndTenantIdAndSearch(shadowIds, tenantId, searchPattern, pageable);
        } else {
            assignmentPage = assignmentRepository
                    .findByShadowIdInAndTenantId(shadowIds, tenantId, pageable);
        }

        if (assignmentPage.isEmpty()) {
            return Page.empty(pageable);
        }

        // Batch-load entitlements for this page
        List<UUID> entitlementIds = assignmentPage.getContent().stream()
                .map(EntitlementAssignment::getEntitlementId)
                .distinct()
                .toList();
        Map<UUID, Entitlement> entitlementMap = new HashMap<>(entitlementIds.size());
        for (Entitlement e : entitlementRepository.findAllById(entitlementIds)) {
            entitlementMap.put(e.getId(), e);
        }

        // Batch-load shadows for this page
        List<UUID> pageShadowIds = assignmentPage.getContent().stream()
                .map(EntitlementAssignment::getShadowId)
                .distinct()
                .toList();
        Map<UUID, Shadow> shadowMap = new HashMap<>(pageShadowIds.size());
        for (Shadow s : shadowRepository.findAllByIdInAndTenantId(pageShadowIds, tenantId)) {
            shadowMap.put(s.getId(), s);
        }

        // Batch-load application names for this page
        List<UUID> resourceIds = assignmentPage.getContent().stream()
                .map(EntitlementAssignment::getResourceId)
                .distinct()
                .toList();
        Map<UUID, String> appNameMap = applicationClient.getApplicationNames(tenantId, resourceIds);

        RoleEntitlementProvenanceContext provenanceContext = buildRoleEntitlementProvenanceContext(
                tenantId,
                assignmentPage.getContent());

        return assignmentPage.map(assignment -> {
            Entitlement entitlement = entitlementMap.get(assignment.getEntitlementId());
            Shadow shadow = shadowMap.get(assignment.getShadowId());
            String applicationName = appNameMap.getOrDefault(
                    assignment.getResourceId(), ApplicationClientConstants.UNKNOWN_APP);
            RoleEntitlementProvenance provenance = provenanceContext.resolve(assignment);

            return new IdentityEntitlementViewDto(
                    assignment.getId(),
                    assignment.getShadowId(),
                    shadow != null ? shadow.getResourceUid() : "Unknown",
                    assignment.getResourceId(),
                    applicationName,
                    assignment.getEntitlementId(),
                    entitlement != null ? entitlement.getDisplayName() : "Unknown",
                    entitlement != null ? entitlement.getDescription() : null,
                    entitlement != null ? entitlement.getKind() : "entitlement",
                    entitlement != null ? entitlement.getObjectClass() : null,
                    entitlement != null ? entitlement.getRiskLevel() : null,
                    entitlement != null ? entitlement.getClassification() : null,
                    assignment.getSource(),
                    provenance.accessPathType(),
                    provenance.accessRoleId(),
                    provenance.accessRoleName(),
                    provenance.sourceRoleId(),
                    provenance.sourceRoleName(),
                    provenance.direct(),
                    provenance.depth(),
                    provenance.rolePath(),
                    assignment.getAssignedAt(),
                    assignment.getUpdatedAt()
            );
        });
    }

    private RoleEntitlementProvenanceContext buildRoleEntitlementProvenanceContext(String tenantId,
                                                                                   List<EntitlementAssignment> assignments) {
        Map<UUID, UUID> roleIdsByRuleId = loadRoleIdsByRuleId(tenantId, assignments);
        Map<UUID, UUID> accessRoleIdsByAssignmentId = new HashMap<>();
        Set<UUID> accessRoleIds = new LinkedHashSet<>();
        Set<UUID> entitlementIds = new LinkedHashSet<>();

        for (EntitlementAssignment assignment : assignments) {
            UUID accessRoleId = resolveAccessRoleId(assignment, roleIdsByRuleId);
            if (accessRoleId == null) {
                continue;
            }
            accessRoleIdsByAssignmentId.put(assignment.getId(), accessRoleId);
            accessRoleIds.add(accessRoleId);
            entitlementIds.add(assignment.getEntitlementId());
        }

        Map<String, RoleEntitlementClosure> closureByRoleEntitlement = loadClosureByRoleEntitlement(
                tenantId,
                accessRoleIds,
                entitlementIds);
        Map<UUID, AccessRole> rolesById = loadRolesById(tenantId, accessRoleIds, closureByRoleEntitlement.values());
        return new RoleEntitlementProvenanceContext(accessRoleIdsByAssignmentId, closureByRoleEntitlement, rolesById);
    }

    private Map<UUID, UUID> loadRoleIdsByRuleId(String tenantId, List<EntitlementAssignment> assignments) {
        Set<UUID> ruleIds = new LinkedHashSet<>();
        for (EntitlementAssignment assignment : assignments) {
            if (assignment.getAccessRoleId() == null && assignment.getRuleId() != null) {
                ruleIds.add(assignment.getRuleId());
            }
        }
        if (ruleIds.isEmpty()) {
            return Map.of();
        }

        Map<UUID, UUID> roleIdsByRuleId = new HashMap<>();
        for (AccessRoleAssignmentRule rule : accessRoleAssignmentRuleRepository.findByTenantIdAndIdIn(tenantId, ruleIds)) {
            roleIdsByRuleId.put(rule.getId(), rule.getRoleId());
        }
        return roleIdsByRuleId;
    }

    private UUID resolveAccessRoleId(EntitlementAssignment assignment, Map<UUID, UUID> roleIdsByRuleId) {
        if (assignment.getAccessRoleId() != null) {
            return assignment.getAccessRoleId();
        }
        return assignment.getRuleId() != null ? roleIdsByRuleId.get(assignment.getRuleId()) : null;
    }

    private Map<String, RoleEntitlementClosure> loadClosureByRoleEntitlement(String tenantId,
                                                                              Set<UUID> accessRoleIds,
                                                                              Set<UUID> entitlementIds) {
        if (accessRoleIds.isEmpty() || entitlementIds.isEmpty()) {
            return Map.of();
        }

        Map<String, RoleEntitlementClosure> closureByKey = new HashMap<>();
        for (RoleEntitlementClosure closure : roleEntitlementClosureRepository
                .findByTenantIdAndRoleIdInAndEntitlementIdIn(tenantId, accessRoleIds, entitlementIds)) {
            String key = roleEntitlementKey(closure.getRoleId(), closure.getEntitlementId());
            RoleEntitlementClosure existing = closureByKey.get(key);
            if (existing == null || compareClosure(closure, existing) < 0) {
                closureByKey.put(key, closure);
            }
        }
        return closureByKey;
    }

    private int compareClosure(RoleEntitlementClosure left, RoleEntitlementClosure right) {
        if (left.isDirect() != right.isDirect()) {
            return left.isDirect() ? -1 : 1;
        }
        return Integer.compare(left.getDepth(), right.getDepth());
    }

    private Map<UUID, AccessRole> loadRolesById(String tenantId,
                                                Set<UUID> accessRoleIds,
                                                Collection<RoleEntitlementClosure> closures) {
        Set<UUID> roleIds = new LinkedHashSet<>(accessRoleIds);
        for (RoleEntitlementClosure closure : closures) {
            roleIds.add(closure.getSourceRoleId());
            if (closure.getPathRoleIds() != null) {
                roleIds.addAll(closure.getPathRoleIds());
            }
        }
        if (roleIds.isEmpty()) {
            return Map.of();
        }

        Map<UUID, AccessRole> rolesById = new HashMap<>();
        for (AccessRole role : accessRoleRepository.findByIdIn(List.copyOf(roleIds))) {
            if (tenantId.equals(role.getTenantId())) {
                rolesById.put(role.getId(), role);
            }
        }
        return rolesById;
    }

    private String roleEntitlementKey(UUID roleId, UUID entitlementId) {
        return roleId + "|" + entitlementId;
    }


    private record RoleEntitlementProvenanceContext(
            Map<UUID, UUID> accessRoleIdsByAssignmentId,
            Map<String, RoleEntitlementClosure> closureByRoleEntitlement,
            Map<UUID, AccessRole> rolesById) {

        private RoleEntitlementProvenance resolve(EntitlementAssignment assignment) {
            UUID accessRoleId = accessRoleIdsByAssignmentId.get(assignment.getId());
            RoleEntitlementClosure closure = accessRoleId != null
                    ? closureByRoleEntitlement.get(accessRoleId + "|" + assignment.getEntitlementId())
                    : null;
            AccessRole accessRole = accessRoleId != null ? rolesById.get(accessRoleId) : null;
            AccessRole sourceRole = closure != null ? rolesById.get(closure.getSourceRoleId()) : null;
            List<IdentityEntitlementRolePathNodeDto> rolePath = buildRolePath(accessRoleId, closure);

            return new RoleEntitlementProvenance(
                    accessPathType(assignment, accessRoleId, closure),
                    accessRoleId,
                    roleDisplayName(accessRole),
                    closure != null ? closure.getSourceRoleId() : null,
                    roleDisplayName(sourceRole),
                    closure != null ? closure.isDirect() : null,
                    closure != null ? closure.getDepth() : null,
                    rolePath);
        }

        private List<IdentityEntitlementRolePathNodeDto> buildRolePath(UUID accessRoleId, RoleEntitlementClosure closure) {
            if (accessRoleId == null) {
                return List.of();
            }
            List<UUID> pathRoleIds = closure != null && closure.getPathRoleIds() != null && !closure.getPathRoleIds().isEmpty()
                    ? closure.getPathRoleIds()
                    : List.of(accessRoleId);
            List<IdentityEntitlementRolePathNodeDto> path = new ArrayList<>(pathRoleIds.size());
            for (int i = 0; i < pathRoleIds.size(); i++) {
                UUID roleId = pathRoleIds.get(i);
                path.add(new IdentityEntitlementRolePathNodeDto(roleId, roleDisplayName(rolesById.get(roleId)), i));
            }
            return path;
        }

        private String roleDisplayName(AccessRole role) {
            if (role == null) {
                return null;
            }
            return role.getDisplayName() != null && !role.getDisplayName().isBlank()
                    ? role.getDisplayName()
                    : role.getName();
        }

        private String accessPathType(EntitlementAssignment assignment, UUID accessRoleId, RoleEntitlementClosure closure) {
            if (accessRoleId == null) {
                return "DYNAMIC".equalsIgnoreCase(assignment.getSource())
                        ? "ROLE_DERIVED_UNKNOWN"
                        : "DIRECT_ENTITLEMENT";
            }
            if (closure == null) {
                return "ROLE_DERIVED_UNKNOWN";
            }
            return closure.isDirect() ? "ROLE_DIRECT" : "ROLE_INHERITED_CHILD";
        }
    }

    private record RoleEntitlementProvenance(
            String accessPathType,
            UUID accessRoleId,
            String accessRoleName,
            UUID sourceRoleId,
            String sourceRoleName,
            Boolean direct,
            Integer depth,
            List<IdentityEntitlementRolePathNodeDto> rolePath) {
    }

    // ===================================================================
    //  Governance Mapping -- bridges EntitlementMappingEngine -> Entity
    //  (from dev branch -- new feature, not present in access-portal branch)
    // ===================================================================

    /**
     * Invokes the {@link EntitlementMappingEngine} with the connector attributes
     * from the sync DTO and applies the resulting governance fields to the entity.
     *
     * <p>For new entitlements, all mapped fields are set unconditionally.
     * For existing entitlements, mapped fields overwrite the current value
     * only when the mapping engine produces a non-null result -- this preserves
     * any manual governance edits for fields that have no mapping rule configured.</p>
     */
    private void applyGovernanceMappings(Entitlement entitlement, EntitlementSyncDto syncDto) {
        if (syncDto.attributes() == null || syncDto.attributes().isEmpty()) {
            return;
        }

        Optional<EntitlementMappingResult> resultOpt = mappingEngine.applyMappings(
                syncDto.tenantId(), syncDto.resourceId(), syncDto.attributes());

        if (resultOpt.isEmpty()) {
            return; // No mapping rules configured -- governance fields stay as-is
        }

        EntitlementMappingResult result = resultOpt.get();

        if (result.displayName() != null)           entitlement.setDisplayName(result.displayName());
        if (result.description() != null)           entitlement.setDescription(result.description());
        if (result.riskLevel() != null)             entitlement.setRiskLevel(result.riskLevel());
        if (result.riskReason() != null)            entitlement.setRiskReason(result.riskReason());
        if (result.lifecycle() != null)             entitlement.setLifecycle(result.lifecycle());
        if (result.classification() != null)        entitlement.setClassification(result.classification());
        if (result.identityType() != null)          entitlement.setIdentityType(result.identityType());
        if (result.privilegeLevel() != null)        entitlement.setPrivilegeLevel(result.privilegeLevel());
        if (result.requestable() != null)           entitlement.setRequestable(result.requestable());
        if (result.requireApproval() != null)       entitlement.setRequireApproval(result.requireApproval());
        if (result.allowedAutomatedGrant() != null) entitlement.setAllowedAutomatedGrant(result.allowedAutomatedGrant());
        if (result.ownerId() != null)               entitlement.setOwnerId(result.ownerId());
        if (result.maxDurationMs() != null)         entitlement.setMaxDurationMs(result.maxDurationMs());
        if (result.autoExpireDurationMs() != null)  entitlement.setAutoExpireDurationMs(result.autoExpireDurationMs());

        if (result.customAttributes() != null && !result.customAttributes().isEmpty()) {
            Map<String, Object> mergedAttributes = entitlement.getAttributes() != null
                    ? new HashMap<>(entitlement.getAttributes())
                    : new HashMap<>();
            mergedAttributes.putAll(result.customAttributes());
            entitlement.setAttributes(mergedAttributes);
        }

        logger.debug().message("Applied governance mappings to entitlement")
                .detail("entitlementSourceUid", syncDto.sourceUid())
                .detail("resourceId", syncDto.resourceId())
                .log();
    }

    // ===================================================================
    //  Internal Helpers
    // ===================================================================

    /**
     * Extracts membership references (group DNs, role IDs) from account attributes.
     * Merged union of both branches:
     * - access-portal: memberOf, groups, isMemberOf
     * - dev: memberOf, groups, __GROUPS__, ldapGroups, isMemberOf
     */
    private List<String> extractMembershipReferences(Map<String, Object> attributes) {
        List<String> refs = new ArrayList<>();
        for (String key : List.of("memberOf", "groups", "__GROUPS__", "ldapGroups", "isMemberOf")) {
            Object val = attributes.get(key);
            if (val instanceof List<?> list) {
                for (Object item : list) {
                    if (item instanceof Map<?, ?> map) {
                        // SCIM-style: {"value": "group-id", "display": "Group Name"}
                        Object v = map.get("value");
                        if (v != null) refs.add(v.toString());
                    } else if (item != null) {
                        String s = item.toString();
                        // Handle pipe-delimited multi-values from CSV connectors (from access-portal branch)
                        if (s.contains("|")) {
                            for (String part : s.split("\\|", -1)) {
                                String trimmed = part.trim();
                                if (!trimmed.isEmpty()) refs.add(trimmed);
                            }
                        } else if (!s.isBlank()) {
                            refs.add(s);
                        }
                    }
                }
            } else if (val instanceof String s && !s.isBlank()) {
                // Handle pipe-delimited single string value (from access-portal branch)
                if (s.contains("|")) {
                    for (String part : s.split("\\|", -1)) {
                        String trimmed = part.trim();
                        if (!trimmed.isEmpty()) refs.add(trimmed);
                    }
                } else {
                    refs.add(s);
                }
            }
        }
        return refs;
    }

    /**
     * Resolves an identity's display name via the Employee table.
     * From dev branch -- not present in access-portal branch.
     */
    private String resolveIdentityName(String tenantId, UUID identityId) {
        return employeeRepository.findById(identityId)
                .map(Employee::getDisplayName)
                .orElse(null);
    }

    /**
     * Builds a JPA Specification with all filter parameters.
     * Merged: dev branch base + assignmentSource, minAssignedUsers, maxAssignedUsers,
     * and JSONB classification filter from access-portal branch.
     */
    private Specification<Entitlement> buildSpecification(String tenantId, UUID resourceId,
                                                           String search, String riskLevel,
                                                           String lifecycle, String kind,
                                                           Boolean classified, Boolean requestable,
                                                           Boolean hasOwner, UUID ownerId,
                                                           String assignmentSource,
                                                           Long minAssignedUsers,
                                                           Long maxAssignedUsers) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("tenantId"), tenantId));

            if (resourceId != null) {
                predicates.add(cb.equal(root.get("resourceId"), resourceId));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("displayName")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern),
                        cb.like(cb.lower(root.get("sourceUid")), pattern)
                ));
            }

            if (riskLevel != null && !riskLevel.isBlank()) {
                predicates.add(cb.equal(root.get("riskLevel"), riskLevel));
            }

            if (lifecycle != null && !lifecycle.isBlank()) {
                predicates.add(cb.equal(root.get("lifecycle"), lifecycle));
            }

            if (kind != null && !kind.isBlank()) {
                predicates.add(cb.equal(root.get("kind"), kind));
            }

            // JSONB classification filter (from access-portal branch)
            if (classified != null) {
                if (classified) {
                    predicates.add(cb.and(
                            cb.isNotNull(root.get("classification")),
                            cb.gt(
                                    cb.function("jsonb_array_length", Integer.class, root.get("classification")),
                                    0
                            )
                    ));
                } else {
                    predicates.add(cb.or(
                            cb.isNull(root.get("classification")),
                            cb.equal(
                                    cb.function("jsonb_array_length", Integer.class, root.get("classification")),
                                    0
                            )
                    ));
                }
            }

            if (requestable != null) {
                predicates.add(cb.equal(root.get("requestable"), requestable));
            }

            if (hasOwner != null) {
                predicates.add(hasOwner
                        ? cb.isNotNull(root.get("ownerId"))
                        : cb.isNull(root.get("ownerId")));
            }

            if (ownerId != null) {
                predicates.add(cb.equal(root.get("ownerId"), ownerId));
            }

            // assignmentSource subquery filter (from access-portal branch)
            if (assignmentSource != null && !assignmentSource.isBlank()) {
                var subquery = query.subquery(UUID.class);
                var assignmentRoot = subquery.from(EntitlementAssignment.class);
                subquery.select(assignmentRoot.get("entitlementId"))
                        .where(
                                cb.equal(assignmentRoot.get("entitlementId"), root.get("id")),
                                cb.equal(assignmentRoot.get("tenantId"), root.get("tenantId")),
                                cb.equal(assignmentRoot.get("source"), assignmentSource)
                        );
                predicates.add(cb.exists(subquery));
            }

            // Assigned users range filter via subquery (from access-portal branch)
            if (minAssignedUsers != null || maxAssignedUsers != null) {
                var subquery = query.subquery(Long.class);
                var assignmentRoot = subquery.from(EntitlementAssignment.class);
                subquery.select(cb.countDistinct(assignmentRoot.get("shadowId")))
                        .where(
                                cb.equal(assignmentRoot.get("entitlementId"), root.get("id")),
                                cb.equal(assignmentRoot.get("tenantId"), root.get("tenantId"))
                        );
                if (minAssignedUsers != null) {
                    predicates.add(cb.ge(subquery, minAssignedUsers));
                }
                if (maxAssignedUsers != null) {
                    predicates.add(cb.le(subquery, maxAssignedUsers));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Enriches a page of Entitlement entities with batch-loaded assignment counts
     * and application names, converting to response DTOs.
     */
    private Page<EntitlementResponseDto> enrichPage(Page<Entitlement> page) {
        if (page.isEmpty()) {
            return page.map(e -> toResponseDto(e, 0L));
        }

        String tenantId = page.getContent().get(0).getTenantId();
        Set<String> customKeys = loadCustomAttributeKeys(tenantId);

        // Batch-load assignment counts
        List<UUID> entitlementIds = page.getContent().stream()
                .map(Entitlement::getId)
                .toList();

        Map<UUID, Long> countMap = new HashMap<>();
        if (!entitlementIds.isEmpty()) {
            for (Object[] row : assignmentRepository.countByEntitlementIds(entitlementIds)) {
                countMap.put((UUID) row[0], (Long) row[1]);
            }
        }

        // Batch-load resource/application names
        List<UUID> resourceIds = page.getContent().stream()
                .map(Entitlement::getResourceId)
                .distinct()
                .toList();

        Map<UUID, String> resourceNames = Collections.emptyMap();
        if (!resourceIds.isEmpty()) {
            try {
                resourceNames = applicationClient.getApplicationNames(tenantId, resourceIds);
            } catch (Exception ex) {
                logger.warn().message("Failed to resolve application names for enrichment")
                        .detail("error", ex.getMessage())
                        .log();
            }
        }

        final Map<UUID, String> names = resourceNames;
        final Set<String> customAttributeKeys = customKeys;
        return page.map(e -> toResponseDto(
                e,
                countMap.getOrDefault(e.getId(), 0L),
                customAttributeKeys,
                names.getOrDefault(e.getResourceId(), null)));
    }

    private EntitlementResponseDto toResponseDto(Entitlement e, long assignedUsersCount) {
        Set<String> customKeys = loadCustomAttributeKeys(e.getTenantId());
        return toResponseDto(e, assignedUsersCount, customKeys, null);
    }

    private EntitlementResponseDto toResponseDto(Entitlement e, long assignedUsersCount, Set<String> customKeys) {
        return toResponseDto(e, assignedUsersCount, customKeys, null);
    }

    private EntitlementResponseDto toResponseDto(Entitlement e, long assignedUsersCount,
                                                 Set<String> customKeys, String resourceName) {
        return new EntitlementResponseDto(
                e.getId(),
                e.getTenantId(),
                e.getResourceId(),
                e.getSourceUid(),
                resourceName,
                e.getDisplayName(),
                e.getDescription(),
                e.getObjectClass(),
                e.getKind(),
                e.getAttributes(),
                extractCustomAttributes(e.getAttributes(), customKeys),
                e.getLifecycle(),
                e.getRiskLevel(),
                e.getRiskReason(),
                e.isRequestable(),
                e.getClassification(),
                e.getIdentityType(),
                e.getPrivilegeLevel(),
                e.getOwnerId(),
                e.isRequireApproval(),
                e.isAllowedAutomatedGrant(),
                e.getMaxDurationMs(),
                e.getAutoExpireDurationMs(),
                assignedUsersCount,
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }

    private Set<String> loadCustomAttributeKeys(String tenantId) {
        List<String> keys = entitlementSchemaService.getCustomAttributeKeys(tenantId);
        if (keys == null || keys.isEmpty()) {
            return Collections.emptySet();
        }
        return new LinkedHashSet<>(keys);
    }

    private Map<String, Object> extractCustomAttributes(Map<String, Object> attributes, Set<String> customKeys) {
        if (attributes == null || attributes.isEmpty() || customKeys == null || customKeys.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Object> custom = new LinkedHashMap<>();
        for (String key : customKeys) {
            if (attributes.containsKey(key)) {
                custom.put(key, attributes.get(key));
            }
        }
        return custom;
    }
}

