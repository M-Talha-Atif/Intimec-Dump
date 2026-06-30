package com.aidentx.iam.access_roles_management.repository;

import com.aidentx.iam.access_roles_management.model.entity.RoleEntitlementClosure;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Repository for materialized effective role-entitlement mappings.
 */
@Repository
public interface RoleEntitlementClosureRepository extends JpaRepository<RoleEntitlementClosure, UUID> {

    List<RoleEntitlementClosure> findByTenantIdAndRoleId(String tenantId, UUID roleId);

    List<RoleEntitlementClosure> findByTenantIdAndRoleIdAndDirect(String tenantId, UUID roleId, boolean direct);

    List<RoleEntitlementClosure> findByTenantIdAndRoleIdAndEntitlementId(String tenantId, UUID roleId, UUID entitlementId);

    List<RoleEntitlementClosure> findByTenantIdAndRoleIdInAndEntitlementIdIn(
            String tenantId,
            Collection<UUID> roleIds,
            Collection<UUID> entitlementIds);

    List<RoleEntitlementClosure> findByTenantIdAndSourceRoleId(String tenantId, UUID sourceRoleId);

    boolean existsByTenantIdAndRoleIdAndEntitlementId(String tenantId, UUID roleId, UUID entitlementId);

    long countByTenantIdAndRoleId(String tenantId, UUID roleId);

    @Query("""
            SELECT COUNT(DISTINCT c.entitlementId)
            FROM RoleEntitlementClosure c
            WHERE c.tenantId = :tenantId AND c.roleId = :roleId
            """)
    long countDistinctEntitlementIdByTenantIdAndRoleId(@Param("tenantId") String tenantId,
                                                       @Param("roleId") UUID roleId);

    @Query("""
            SELECT DISTINCT c.entitlementId
            FROM RoleEntitlementClosure c
            WHERE c.tenantId = :tenantId AND c.roleId = :roleId
            ORDER BY c.entitlementId
            """)
    List<UUID> findDistinctEntitlementIdsByTenantIdAndRoleId(@Param("tenantId") String tenantId,
                                                              @Param("roleId") UUID roleId);

    @Query("""
            SELECT DISTINCT c.entitlementId
            FROM RoleEntitlementClosure c
            WHERE c.tenantId = :tenantId AND c.roleId = :roleId AND c.direct = :direct
            ORDER BY c.entitlementId
            """)
    List<UUID> findDistinctEntitlementIdsByTenantIdAndRoleIdAndDirect(@Param("tenantId") String tenantId,
                                                                       @Param("roleId") UUID roleId,
                                                                       @Param("direct") boolean direct);

    @Query(value = """
            SELECT a.entitlementId,
                   SUM(CASE WHEN a.direct = true THEN 1 ELSE 0 END),
                   SUM(CASE WHEN a.direct = false THEN 1 ELSE 0 END),
                   COUNT(DISTINCT a.sourceRoleId),
                   SUM(CASE WHEN b.direct = true THEN 1 ELSE 0 END),
                   SUM(CASE WHEN b.direct = false THEN 1 ELSE 0 END),
                   COUNT(DISTINCT b.sourceRoleId)
            FROM RoleEntitlementClosure a
            JOIN RoleEntitlementClosure b
              ON b.tenantId = a.tenantId
             AND b.entitlementId = a.entitlementId
            WHERE a.tenantId = :tenantId
              AND a.roleId = :roleAId
              AND b.roleId = :roleBId
              AND (
                   :sourceFilter = 'ALL'
                   OR (:sourceFilter = 'DIRECT' AND (a.direct = true OR b.direct = true))
                   OR (:sourceFilter = 'INHERITED' AND (a.direct = false OR b.direct = false))
              )
            GROUP BY a.entitlementId
            ORDER BY a.entitlementId
            """,
            countQuery = """
            SELECT COUNT(DISTINCT a.entitlementId)
            FROM RoleEntitlementClosure a
            JOIN RoleEntitlementClosure b
              ON b.tenantId = a.tenantId
             AND b.entitlementId = a.entitlementId
            WHERE a.tenantId = :tenantId
              AND a.roleId = :roleAId
              AND b.roleId = :roleBId
              AND (
                   :sourceFilter = 'ALL'
                   OR (:sourceFilter = 'DIRECT' AND (a.direct = true OR b.direct = true))
                   OR (:sourceFilter = 'INHERITED' AND (a.direct = false OR b.direct = false))
              )
            """)
    Page<Object[]> findOverlappingEntitlementSummaries(@Param("tenantId") String tenantId,
                                                       @Param("roleAId") UUID roleAId,
                                                       @Param("roleBId") UUID roleBId,
                                                       @Param("sourceFilter") String sourceFilter,
                                                       Pageable pageable);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    void deleteByTenantIdAndRoleId(String tenantId, UUID roleId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    void deleteByTenantIdAndRoleIdIn(String tenantId, Collection<UUID> roleIds);
}

