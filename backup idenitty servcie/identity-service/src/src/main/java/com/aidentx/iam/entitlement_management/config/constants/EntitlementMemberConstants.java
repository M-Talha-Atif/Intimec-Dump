package com.aidentx.iam.entitlement_management.config.constants;

/**
 * Constants for the entitlement member (assignment view) domain.
 *
 * <p>Centralises log messages, detail keys, and assignment-status values
 * used when building {@code EntitlementMemberDto} responses.</p>
 */
public final class EntitlementMemberConstants {

    private EntitlementMemberConstants() {
        throw new UnsupportedOperationException("Utility class — cannot be instantiated");
    }

    // ============================================================
    //  Log Category
    // ============================================================

    public static final String LOG_CATEGORY = "EntitlementMembers";

    // ============================================================
    //  Log Messages
    // ============================================================

    public static final String LOG_MEMBERS_FETCHED = "Entitlement members fetched";
    public static final String LOG_ROLE_RESOLVED = "Resolved access role for entitlement member";
    public static final String LOG_ROLE_NOT_FOUND = "Access role referenced by assignment not found";

    // ============================================================
    //  Log Detail Keys
    // ============================================================

    public static final String DETAIL_TENANT_ID = "tenantId";
    public static final String DETAIL_ENTITLEMENT_ID = "entitlementId";
    public static final String DETAIL_ASSIGNMENT_ID = "assignmentId";
    public static final String DETAIL_ACCESS_ROLE_ID = "accessRoleId";
    public static final String DETAIL_IDENTITY_ID = "identityId";
    public static final String DETAIL_MEMBER_COUNT = "memberCount";

    // ============================================================
    //  Assignment Status Values
    // ============================================================

    /** Entitlement row exists in entitlement_assignments — fully provisioned. */
    public static final String STATUS_ASSIGNED = "ASSIGNED";

    /** Identity has no account (shadow) on the target application. */
    public static final String STATUS_PENDING_NO_ACCOUNT = "PENDING_NO_ACCOUNT";

    /** Account exists but entitlement is not yet provisioned to it. */
    public static final String STATUS_NOT_ASSIGNED = "NOT_ASSIGNED";

    // ============================================================
    //  Assignment Status Reason Messages
    // ============================================================

    public static final String REASON_NO_ACCOUNT = "Identity has no account on the target application";
    public static final String REASON_NOT_PROVISIONED = "Entitlement not yet provisioned to identity's account";
}

