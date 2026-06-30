package com.aidentx.iam.access_roles_management.repository;

import com.aidentx.iam.access_roles_management.model.entity.IdentityRoleAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for persisted identity-to-access-role assignment records.
 */
@Repository
public interface IdentityRoleAssignmentRepository extends JpaRepository<IdentityRoleAssignment, UUID> {

    /** Finds all assignments for a tenant. */
    List<IdentityRoleAssignment> findByTenantId(String tenantId);

    /** Finds all assignments for one identity in a tenant. */
    List<IdentityRoleAssignment> findByTenantIdAndIdentityId(String tenantId, UUID identityId);

    /** Finds assignments for one identity filtered by lifecycle status. */
    List<IdentityRoleAssignment> findByTenantIdAndIdentityIdAndStatus(
            String tenantId,
            UUID identityId,
            IdentityRoleAssignment.Status status);

    /** Finds all assignments for one role in a tenant. */
    List<IdentityRoleAssignment> findByTenantIdAndRoleId(String tenantId, UUID roleId);

    /** Finds assignments for one role filtered by lifecycle status. */
    List<IdentityRoleAssignment> findByTenantIdAndRoleIdAndStatus(
            String tenantId,
            UUID roleId,
            IdentityRoleAssignment.Status status);

    /** Finds assignments for one role filtered by source type and lifecycle status. */
    List<IdentityRoleAssignment> findByTenantIdAndRoleIdAndSourceTypeAndStatus(
            String tenantId,
            UUID roleId,
            IdentityRoleAssignment.SourceType sourceType,
            IdentityRoleAssignment.Status status);

    /** Finds one active assignment by ID within a tenant-role scope. */
    Optional<IdentityRoleAssignment> findByIdAndTenantIdAndRoleIdAndStatus(
            UUID id,
            String tenantId,
            UUID roleId,
            IdentityRoleAssignment.Status status);

    /** Counts assignments for one role in a tenant filtered by lifecycle status. */
    long countByTenantIdAndRoleIdAndStatus(String tenantId, UUID roleId, IdentityRoleAssignment.Status status);

    /** Counts distinct active identities assigned to one role in a tenant. */
    @Query("""
            SELECT COUNT(DISTINCT a.identityId)
            FROM IdentityRoleAssignment a
            WHERE a.tenantId = :tenantId
              AND a.roleId = :roleId
              AND a.status = :status
            """)
    long countDistinctIdentityIdByTenantIdAndRoleIdAndStatus(@Param("tenantId") String tenantId,
                                                             @Param("roleId") UUID roleId,
                                                             @Param("status") IdentityRoleAssignment.Status status);

    /** Finds assignments for a tenant by status. */
    List<IdentityRoleAssignment> findByTenantIdAndStatus(String tenantId, IdentityRoleAssignment.Status status);

    /** Finds assignments created by a specific source rule. */
    List<IdentityRoleAssignment> findByTenantIdAndAssignmentRuleId(
            String tenantId,
            UUID assignmentRuleId);

    /** Finds assignments created by a specific source rule and status. */
    List<IdentityRoleAssignment> findByTenantIdAndAssignmentRuleIdAndStatus(
            String tenantId,
            UUID assignmentRuleId,
            IdentityRoleAssignment.Status status);

    /** Finds assignments by source type and source key. */
    List<IdentityRoleAssignment> findByTenantIdAndSourceTypeAndSourceKey(
            String tenantId,
            IdentityRoleAssignment.SourceType sourceType,
            String sourceKey);

    /** Finds the source-specific assignment row used for idempotent create/reactivate. */
    Optional<IdentityRoleAssignment> findByTenantIdAndIdentityIdAndRoleIdAndSourceTypeAndSourceKey(
            String tenantId,
            UUID identityId,
            UUID roleId,
            IdentityRoleAssignment.SourceType sourceType,
            String sourceKey);

    /** Checks whether a source-specific identity-role assignment already exists. */
    boolean existsByTenantIdAndIdentityIdAndRoleIdAndSourceTypeAndSourceKey(
            String tenantId,
            UUID identityId,
            UUID roleId,
            IdentityRoleAssignment.SourceType sourceType,
            String sourceKey);
}

