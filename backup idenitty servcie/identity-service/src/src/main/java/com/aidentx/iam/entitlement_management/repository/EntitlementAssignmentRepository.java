package com.aidentx.iam.entitlement_management.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.aidentx.iam.entitlement_management.model.entity.EntitlementAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EntitlementAssignmentRepository extends JpaRepository<EntitlementAssignment, UUID> {

    /**
     * Finds an assignment by the unique key (shadow + entitlement + tenant).
     */
    Optional<EntitlementAssignment> findByShadowIdAndEntitlementIdAndTenantId(
            UUID shadowId, UUID entitlementId, String tenantId);

    /**
     * Finds all entitlement assignments for a given shadow (account).
     */
    Page<EntitlementAssignment> findByShadowIdAndTenantId(UUID shadowId, String tenantId, Pageable pageable);

    /**
     * Finds all shadows assigned to a given entitlement.
     */
    Page<EntitlementAssignment> findByEntitlementIdAndTenantId(UUID entitlementId, String tenantId, Pageable pageable);

    /**
     * Finds all assignments for a resource (application).
     */
    Page<EntitlementAssignment> findByResourceIdAndTenantId(UUID resourceId, String tenantId, Pageable pageable);

    /**
     * Finds assignments that were NOT confirmed by the current sync run.
     * These assignments may have been revoked on the target system.
     */
    @Query("SELECT ea FROM EntitlementAssignment ea WHERE ea.resourceId = :resourceId AND ea.tenantId = :tenantId "
            + "AND ea.source = 'IMPORT' AND (ea.lastSyncRunId IS NULL OR ea.lastSyncRunId <> :syncRunId)")
    Page<EntitlementAssignment> findStaleAssignments(
            @Param("resourceId") UUID resourceId,
            @Param("tenantId") String tenantId,
            @Param("syncRunId") String syncRunId,
            Pageable pageable);

    /**
     * Counts the number of assigned accounts for a given entitlement.
     */
    long countByEntitlementIdAndTenantId(UUID entitlementId, String tenantId);

    /**
     * Bulk count of assignments grouped by entitlement ID for a set of entitlement IDs.
     * Returns Object[] rows where [0] = entitlementId (UUID), [1] = count (Long).
     */
    @Query("SELECT ea.entitlementId, COUNT(ea) FROM EntitlementAssignment ea "
            + "WHERE ea.entitlementId IN :entitlementIds "
            + "GROUP BY ea.entitlementId")
    List<Object[]> countByEntitlementIds(@Param("entitlementIds") List<UUID> entitlementIds);

    // ===================================================================
    //  Phase G: Performance Optimizations — Bulk Load, Upsert & Delete
    // ===================================================================

    /**
     * G2: Loads all assignment keys (shadowId, entitlementId) for a resource in a single query.
     * Used to build an in-memory Set for O(1) existence checks during membership processing.
     * Returns (shadowId, entitlementId) pairs.
     */
    @Query("SELECT ea.shadowId, ea.entitlementId FROM EntitlementAssignment ea "
            + "WHERE ea.resourceId = :resourceId AND ea.tenantId = :tenantId")
    List<Object[]> findAllAssignmentKeys(@Param("resourceId") UUID resourceId,
                                         @Param("tenantId") String tenantId);

    /**
     * G3: Batch upsert assignments using PostgreSQL ON CONFLICT.
     * Inserts new assignments or updates lastSyncRunId for existing ones.
     * This replaces N individual save() calls with a single multi-row statement.
     * <p>
     * Note: @Modifying + nativeQuery for PostgreSQL-specific upsert syntax.
     */
    @Modifying
    @Query(value = "INSERT INTO entitlement_assignments (id, tenant_id, shadow_id, entitlement_id, resource_id, source, last_sync_run_id, assigned_at, updated_at) "
            + "VALUES (:id, :tenantId, :shadowId, :entitlementId, :resourceId, :source, :syncRunId, :now, :now) "
            + "ON CONFLICT (shadow_id, entitlement_id, tenant_id) DO UPDATE SET last_sync_run_id = :syncRunId, updated_at = :now",
            nativeQuery = true)
    void upsertAssignment(@Param("id") UUID id,
                          @Param("tenantId") String tenantId,
                          @Param("shadowId") UUID shadowId,
                          @Param("entitlementId") UUID entitlementId,
                          @Param("resourceId") UUID resourceId,
                          @Param("source") String source,
                          @Param("syncRunId") String syncRunId,
                          @Param("now") long now);

    /**
     * G4: Bulk delete stale assignments in a single query.
     * Replaces paginated delete loop with set-based operation.
     * Only deletes IMPORT-sourced assignments (manual grants are preserved).
     * Returns the count of deleted rows.
     */
    @Modifying
    @Query("DELETE FROM EntitlementAssignment ea WHERE ea.resourceId = :resourceId AND ea.tenantId = :tenantId "
            + "AND ea.source = 'IMPORT' AND (ea.lastSyncRunId IS NULL OR ea.lastSyncRunId <> :syncRunId)")
    int deleteStaleAssignmentsBulk(@Param("resourceId") UUID resourceId,
                                   @Param("tenantId") String tenantId,
                                   @Param("syncRunId") String syncRunId);

    /**
     * G4: Delete assignments tied to absent entitlements before bulk-deleting the entitlements.
     * Uses a subquery to find entitlement IDs that were not seen in the current sync run.
     * Returns the count of deleted rows.
     */
    @Modifying
    @Query("DELETE FROM EntitlementAssignment ea WHERE ea.tenantId = :tenantId "
            + "AND ea.entitlementId IN (SELECT e.id FROM Entitlement e WHERE e.resourceId = :resourceId "
            + "AND e.tenantId = :tenantId AND (e.lastSyncRunId IS NULL OR e.lastSyncRunId <> :syncRunId))")
    int deleteAssignmentsForAbsentEntitlements(@Param("resourceId") UUID resourceId,
                                               @Param("tenantId") String tenantId,
                                               @Param("syncRunId") String syncRunId);

    // ===================================================================
    //  Analytics & KPI Queries (Tenant-wide)
    // ===================================================================

    /**
     * Count total assignments for a tenant (across all resources).
     * Used to calculate average users per entitlement KPI.
     */
    long countByTenantId(String tenantId);

    // ===================================================================
    //  Sprawl KPI Analytics Queries
    // ===================================================================

    @Query(value = """
                SELECT COUNT(*) FROM (
                    SELECT ea.entitlement_id
                    FROM entitlement_assignments ea
                    WHERE ea.tenant_id = :tenantId
                    GROUP BY ea.entitlement_id
                    HAVING COUNT(ea.id) > :threshold
                ) sub
            """, nativeQuery = true)
    Long countEntitlementsWithAssignmentCountGreaterThan(
            @Param("tenantId") String tenantId,
            @Param("threshold") int threshold);

    /**
     * Counts distinct entitlements with manual (direct) assignments for a tenant.
     * Used for tracking direct assignment count in sprawl analytics.
     * Returns count of unique entitlements with MANUAL source assignments.
     */
    @Query("SELECT COUNT(DISTINCT ea.entitlementId) FROM EntitlementAssignment ea "
            + "WHERE ea.tenantId = :tenantId AND ea.source = :source")
    long countDistinctEntitlementsByTenantIdAndSource(@Param("tenantId") String tenantId,
                                                      @Param("source") String source);
    // Attribute base rule assignment queries

    /**
     * Find all DYNAMIC assignments created by a specific rule.
     */
    List<EntitlementAssignment> findByTenantIdAndRuleId(String tenantId, UUID ruleId);

    /**
     * Check if a specific shadow already has a specific entitlement assigned.
     */
    boolean existsByTenantIdAndShadowIdAndEntitlementId(String tenantId, UUID shadowId, UUID entitlementId);

    /**
     * Delete all DYNAMIC assignments for a rule (used when rule is deleted).
     */
    @Modifying
    @Query("DELETE FROM EntitlementAssignment ea WHERE ea.tenantId = :tenantId AND ea.ruleId = :ruleId")
    int deleteByTenantIdAndRuleId(@Param("tenantId") String tenantId, @Param("ruleId") UUID ruleId);

    /**
     * Find all DYNAMIC assignments for a specific entitlement.
     */
    @Query("SELECT ea FROM EntitlementAssignment ea WHERE ea.tenantId = :tenantId AND ea.entitlementId = :entitlementId AND ea.source = 'DYNAMIC'")
    List<EntitlementAssignment> findDynamicAssignmentsByEntitlement(@Param("tenantId") String tenantId,
                                                                    @Param("entitlementId") UUID entitlementId);

    /**
     * Batch-loads assignment rows for a tenant across a set of shadows and entitlements.
     */
    @Query("SELECT ea FROM EntitlementAssignment ea WHERE ea.tenantId = :tenantId AND ea.shadowId IN :shadowIds AND ea.entitlementId IN :entitlementIds")
    List<EntitlementAssignment> findByTenantIdAndShadowIdInAndEntitlementIdIn(
            @Param("tenantId") String tenantId,
            @Param("shadowIds") Collection<UUID> shadowIds,
            @Param("entitlementIds") Collection<UUID> entitlementIds);

    /**
     * Retrieves all entitlement assignments for a set of shadow IDs within a tenant.
     * Supports server-side pagination for efficient handling of identities with
     * many assignments across multiple accounts.
     * <p>
     * This is the core query for the "identity entitlements" view. The caller
     * first resolves shadow IDs for an identity, then passes them here to get
     * all assignments in a single paginated query (no N+1).
     *
     * @param shadowIds collection of shadow UUIDs (typically 1 to 50 per identity)
     * @param tenantId  the tenant scope for multi-tenant isolation
     * @param pageable  pagination and sorting parameters
     * @return paginated entitlement assignments for the given shadows
     */
    @Query("SELECT ea FROM EntitlementAssignment ea WHERE ea.shadowId IN :shadowIds AND ea.tenantId = :tenantId")
    Page<EntitlementAssignment> findByShadowIdInAndTenantId(@Param("shadowIds") Collection<UUID> shadowIds,
                                                            @Param("tenantId") String tenantId,
                                                            Pageable pageable);

    /**
     * Retrieves entitlement assignments for a set of shadows, filtered by a search term
     * that matches against the linked entitlement's displayName or description.
     * Uses a subquery join to filter at the database level so pagination counts are accurate.
     *
     * @param shadowIds collection of shadow UUIDs (typically 1 to 50 per identity)
     * @param tenantId  tenant scope
     * @param search    search pattern (should be pre-wrapped with % wildcards by the caller)
     * @param pageable  pagination and sorting parameters
     * @return paginated assignments whose linked entitlement matches the search term
     */
    @Query("SELECT ea FROM EntitlementAssignment ea WHERE ea.shadowId IN :shadowIds AND ea.tenantId = :tenantId "
            + "AND ea.entitlementId IN ("
            + "  SELECT e.id FROM Entitlement e WHERE e.tenantId = :tenantId "
            + "  AND (LOWER(e.displayName) LIKE :search OR LOWER(e.description) LIKE :search)"
            + ")")
    Page<EntitlementAssignment> findByShadowIdInAndTenantIdAndSearch(
            @Param("shadowIds") Collection<UUID> shadowIds,
            @Param("tenantId") String tenantId,
            @Param("search") String search,
            Pageable pageable);

    /** Delete all assignments for a resource within a tenant (cascade delete on application removal). */
    @Modifying
    @Query("DELETE FROM EntitlementAssignment ea WHERE ea.resourceId = :resourceId AND ea.tenantId = :tenantId")
    void deleteAllByResourceIdAndTenantId(@Param("resourceId") UUID resourceId, @Param("tenantId") String tenantId);

    /**
     * Returns distinct entitlement IDs that are actually assigned (provisioned) for a
     * given access role within a tenant. Uses the indexed {@code access_role_id} column
     * for efficient lookup without joining through shadows.
     */
    @Query("SELECT DISTINCT ea.entitlementId FROM EntitlementAssignment ea " +
            "WHERE ea.tenantId = :tenantId AND ea.accessRoleId = :accessRoleId")
    List<UUID> findDistinctEntitlementIdsByTenantIdAndAccessRoleId(
            @Param("tenantId") String tenantId,
            @Param("accessRoleId") UUID accessRoleId);
}
