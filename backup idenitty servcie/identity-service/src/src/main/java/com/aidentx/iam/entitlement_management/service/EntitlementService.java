package com.aidentx.iam.entitlement_management.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import com.aidentx.iam.entitlement_management.model.dto.EntitlementDtos.EntitlementMemberDto;
import com.aidentx.iam.entitlement_management.model.dto.EntitlementDtos.EntitlementResponseDto;
import com.aidentx.iam.entitlement_management.model.dto.EntitlementDtos.EntitlementSyncDto;
import com.aidentx.iam.entitlement_management.model.dto.EntitlementDtos.EntitlementUpdateDto;
import com.aidentx.iam.entitlement_management.model.dto.EntitlementDtos.FilterOptionDto;
import com.aidentx.iam.entitlement_management.model.dto.EntitlementDtos.ShadowEntitlementDto;
import com.aidentx.iam.identity_management.model.dto.IdentityEntitlementViewDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EntitlementService {

    // ===================================================================
    //  Sync Pipeline (import-time operations)
    // ===================================================================

    EntitlementResponseDto createOrUpdateFromSync(EntitlementSyncDto syncDto);

    void assignEntitlementToShadow(UUID shadowId, UUID entitlementId, UUID resourceId,
                                   String tenantId, String syncRunId);

    int processAccountMemberships(UUID shadowId, UUID resourceId, String tenantId,
                                  String syncRunId, Map<String, Object> attributes);

    /**
     * G1 optimized variant: Resolves memberships using pre-loaded catalog map.
     * Eliminates N database lookups O(1) map lookup per membership reference.
     *
     * @param entitlementCatalog Pre-loaded map of sourceUid → entitlementId
     * @return count of resolved assignments
     */
    int processAccountMembershipsWithCache(UUID shadowId, UUID resourceId, String tenantId,
                                           String syncRunId, Map<String, Object> attributes,
                                           Map<String, UUID> entitlementCatalog);

    int[] finalizeEntitlementSyncRun(UUID resourceId, String tenantId, String syncRunId, boolean skipAssignmentCleanup);

    /**
     * Dry-run preview: returns entitlements that WOULD be deleted if finalize ran for real.
     * Each element: [entitlementId (UUID), sourceUid, displayName, objectClass, assignmentCount (long)].
     */
    List<Object[]> previewEntitlementCleanup(UUID resourceId, String tenantId, String syncRunId);

    /**
     * Dry-run preview with exclusion: returns entitlements that WOULD be deleted,
     * excluding those with source UIDs in the seen set (because dry-run doesn't stamp syncRunId).
     */
    List<Object[]> previewEntitlementCleanup(UUID resourceId, String tenantId, String syncRunId, Set<String> seenEntitlementUids);

    // ===================================================================
    //  Phase G: Performance Optimizations Cache Loaders & Batch Ops
    // ===================================================================

    /**
     * G1: Loads the entire entitlement catalog for a resource into a Map.
     * Key: sourceUid (the connector's native identifier, e.g., DN for LDAP groups)
     * Value: entitlement UUID
     * <p>
     * This eliminates N+1 queries during membership resolution instead of
     * SELECT per membership reference, we do one bulk SELECT upfront.
     */
    Map<String, UUID> loadEntitlementCatalogMap(UUID resourceId, String tenantId);

    /**
     * G2: Loads all existing assignment keys for a resource into a Set.
     * Each key is "shadowId|entitlementId" used for O(1) existence checks.
     * <p>
     * This eliminates N existence queries instead of SELECT per assignment,
     * we do one bulk SELECT upfront and check set.contains().
     */
    Set<String> loadAssignmentKeysSet(UUID resourceId, String tenantId);

    /**
     * G3: Batch upsert assignments using native PostgreSQL ON CONFLICT.
     * Each tuple is (shadowId, entitlementId) resourceId, tenantId, syncRunId
     * are shared across the batch.
     */
    void batchUpsertAssignments(List<UUID[]> shadowEntitlementPairs, UUID resourceId,
                                String tenantId, String syncRunId);

    // ===================================================================
    //  API / Catalog Operations
    // ===================================================================

    Optional<EntitlementResponseDto> findById(UUID id);

    Page<EntitlementResponseDto> findAll(
            String tenantId,
            UUID resourceId,
            String search,
            String riskLevel,
            String lifecycle,
            String kind,
            Boolean classified,
            Boolean requestable,
            Boolean hasOwner,
            UUID ownerId,
            String assignmentSource,
            Long minAssignedUsers,
            Long maxAssignedUsers,
            Pageable pageable
    );

    Page<EntitlementResponseDto> findByResourceId(UUID resourceId, String tenantId, Pageable pageable);

    /**
     * Searches entitlements for a resource with optional text search and filters.
     * Supports filtering by riskLevel, lifecycle, kind, and text search on displayName/description.
     */
    Page<EntitlementResponseDto> searchByResource(UUID resourceId, String tenantId,
                                                  String search, String riskLevel,
                                                  String lifecycle, String kind,
                                                  Pageable pageable);

    /**
     * Updates governance metadata for an entitlement.
     * Only governance fields are modifiable technical/sync fields are read-only.
     */
    EntitlementResponseDto updateGovernance(UUID id, String tenantId, EntitlementUpdateDto updateDto);

    /**
     * Returns the members (accounts/identities) assigned to an entitlement.
     * Joins EntitlementAssignment → Shadow → Identity for human-readable output.
     */
    Page<EntitlementMemberDto> getEntitlementMembers(UUID entitlementId, String tenantId, Pageable pageable);

    /**
     * Returns the entitlements assigned to a given shadow (account).
     */
    Page<ShadowEntitlementDto> getShadowEntitlements(UUID shadowId, String tenantId, Pageable pageable);

    /**
     * Returns filter options (distinct values with counts) for entitlement search on a resource.
     */
    List<FilterOptionDto> getFilterOptions(UUID resourceId, String tenantId);

    /**
     * Retrieves all entitlements assigned to an identity across all of its accounts.
     * <p>
     * This method resolves the full chain: Identity -> Shadows (accounts) -> EntitlementAssignments -> Entitlements.
     * It executes exactly 3 database queries regardless of how many accounts the identity has:
     * <ol>
     *   <li>Load shadow IDs for the identity (typically 1 to 50)</li>
     *   <li>Load paginated entitlement assignments for those shadow IDs</li>
     *   <li>Batch-load entitlement and shadow details for the current page</li>
     * </ol>
     * Application names are resolved via Application Client   and included in each result row.
     *
     * @param identityId the UUID of the identity whose entitlements are requested
     * @param tenantId   the tenant scope for multi-tenant isolation
     * @param pageable   pagination and sorting parameters
     * @return paginated list of entitlement views combining assignment, account, entitlement,
     * and application name data
     */
    Page<IdentityEntitlementViewDto> getEntitlementsByIdentityId(UUID identityId, String tenantId,
                                                                 String search, Pageable pageable);
}