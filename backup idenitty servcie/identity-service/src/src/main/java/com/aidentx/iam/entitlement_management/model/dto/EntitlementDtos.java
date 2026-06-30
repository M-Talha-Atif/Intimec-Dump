package com.aidentx.iam.entitlement_management.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTOs for the Entitlement Management domain.
 * Organized by concern: sync (import pipeline), response (API output),
 * update (governance edits), and member (assignment view).
 */
public final class EntitlementDtos {

    private EntitlementDtos() {} // Prevent instantiation

    /** DTO for creating or updating an entitlement from a synchronization event. */
    public record EntitlementSyncDto(
        @NotBlank String tenantId,
        @NotNull UUID resourceId,
        @NotBlank String sourceUid,
        @NotBlank String displayName,
        String description,
        String objectClass,
        String kind,
        Map<String, Object> attributes,
        String lastSyncRunId
    ) {}

    /** DTO for returning entitlement details via the API. */
    public record EntitlementResponseDto(
        UUID id,
        String tenantId,
        UUID resourceId,
        String sourceUid,
        String resourceName,
        String displayName,
        String description,
        String objectClass,
        String kind,
        Map<String, Object> attributes,
        Map<String, Object> customAttributes,
        // Governance metadata
        String lifecycle,
        String riskLevel,
        String riskReason,
        boolean requestable,
        List<String> classification,
        String identityType,
        String privilegeLevel,
        UUID ownerId,
        boolean requireApproval,
        boolean allowedAutomatedGrant,
        Long maxDurationMs,
        Long autoExpireDurationMs,
        // Computed
        long assignedUsersCount,
        // Timestamps
        Long createdAt,
        Long updatedAt
    ) {}

    /**
     * DTO for updating entitlement governance metadata.
     * Only governance fields — technical fields (sourceUid, objectClass, attributes)
     * are managed exclusively by the sync pipeline and cannot be edited manually.
     */
    public record EntitlementUpdateDto(
        String displayName,
        String description,
        String lifecycle,
        String riskLevel,
        String kind,
        String riskReason,
        Boolean requestable,
        List<String> classification,
        String identityType,
        String privilegeLevel,
        UUID ownerId,
        Boolean requireApproval,
        Boolean allowedAutomatedGrant,
        Long maxDurationMs,
        Long autoExpireDurationMs
    ) {}

    /**
     * DTO for representing a member (account) assigned to an entitlement.
     * Joins EntitlementAssignment → Shadow → Identity to produce a
     * human-readable view of "who holds this entitlement".
     *
     * <p>When the assignment originates from an access role, the role fields
     * provide the assignment path context. The {@code assignmentStatus} field
     * indicates provisioning state:</p>
     * <ul>
     *   <li>{@code ASSIGNED} — entitlement is provisioned to the account</li>
     *   <li>{@code PENDING_NO_ACCOUNT} — identity has no account on target application</li>
     *   <li>{@code NOT_ASSIGNED} — account exists but entitlement not yet provisioned</li>
     * </ul>
     */
    public record EntitlementMemberDto(
        UUID assignmentId,
        UUID shadowId,
        String accountName,
        UUID identityId,
        String identityName,
        String source,
        Long assignedAt,
        Long updatedAt,
        // Role context (populated when assignment originates from an access role)
        UUID accessRoleId,
        String accessRoleName,
        String assignmentPath,
        // Provisioning status
        String assignmentStatus,
        String assignmentStatusReason
    ) {}

    /**
     * DTO for returning entitlement assignment details for a given shadow (account).
     */
    public record ShadowEntitlementDto(
        UUID assignmentId,
        UUID entitlementId,
        String entitlementName,
        String entitlementType,
        String objectClass,
        String riskLevel,
        String source,
        Long assignedAt
    ) {}

    /**
     * DTO for filter options returned by the filters endpoint.
     */
    public record FilterOptionDto(
        String key,
        String label,
        List<FilterValueDto> options
    ) {}

    public record FilterValueDto(
        String value,
        String label,
        long count
    ) {}
}