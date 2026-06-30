package com.aidentx.iam.access_roles_management.service.impl;

import com.aidentx.iam.access_roles_management.model.entity.AccessRole;
import com.aidentx.iam.access_roles_management.model.entity.AccessRoleAssignmentRule;
import com.aidentx.iam.access_roles_management.model.entity.IdentityRoleAssignment;
import com.aidentx.iam.access_roles_management.repository.AccessRoleAssignmentRuleRepository;
import com.aidentx.iam.access_roles_management.repository.AccessRoleRepository;
import com.aidentx.iam.access_roles_management.repository.IdentityRoleAssignmentRepository;
import com.aidentx.iam.access_roles_management.service.RoleEntitlementAssignmentService;
import com.aidentx.iam.identity_management.model.entity.Employee;
import com.aidentx.iam.identity_management.repository.IdentityRepository;
import com.aidentx.logging.service.IUnifiedLogger;
import com.aidentx.logging.service.UnifiedLoggerFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IdentityRoleAssignmentServiceImplTest {

    private static final String TENANT_ID = "tenant-1";

    @Mock
    private IdentityRoleAssignmentRepository assignmentRepository;

    @Mock
    private IdentityRepository identityRepository;

    @Mock
    private AccessRoleRepository accessRoleRepository;

    @Mock
    private AccessRoleAssignmentRuleRepository ruleRepository;

    @Mock
    private RoleEntitlementAssignmentService roleEntitlementAssignmentService;

    @Mock
    private UnifiedLoggerFactory loggerFactory;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private IUnifiedLogger logger;

    private IdentityRoleAssignmentServiceImpl service;

    @BeforeEach
    void setUp() {
        when(loggerFactory.getLogger(eq(IdentityRoleAssignmentServiceImpl.class), anyString())).thenReturn(logger);
        service = new IdentityRoleAssignmentServiceImpl(
                assignmentRepository,
                identityRepository,
                accessRoleRepository,
                ruleRepository,
                roleEntitlementAssignmentService,
                loggerFactory);
    }

    @Test
    void assignRoleWhenExistingActiveAssignmentStillSyncsEntitlements() {
        UUID identityId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        UUID ruleId = UUID.randomUUID();
        IdentityRoleAssignment existing = assignment(identityId, roleId, IdentityRoleAssignment.Status.ACTIVE);

        when(identityRepository.findByTenantIdAndId(TENANT_ID, identityId)).thenReturn(Optional.of(identity(identityId)));
        when(accessRoleRepository.findById(roleId)).thenReturn(Optional.of(role(roleId)));
        when(ruleRepository.findByIdAndTenantId(ruleId, TENANT_ID)).thenReturn(Optional.of(rule(ruleId, roleId)));
        when(assignmentRepository.findByTenantIdAndIdentityIdAndRoleIdAndSourceTypeAndSourceKey(
                TENANT_ID,
                identityId,
                roleId,
                IdentityRoleAssignment.SourceType.RULE,
                ruleId.toString())).thenReturn(Optional.of(existing));

        IdentityRoleAssignment result = service.assignRole(
                TENANT_ID,
                identityId,
                roleId,
                IdentityRoleAssignment.SourceType.RULE,
                ruleId,
                ruleId.toString());

        assertThat(result).isSameAs(existing);
        verify(roleEntitlementAssignmentService).applyRoleEntitlements(TENANT_ID, identityId, roleId, ruleId, IdentityRoleAssignment.SourceType.RULE);
        verify(assignmentRepository, never()).save(existing);
    }

    @Test
    void revokeRoleRevokesDerivedEntitlementsAfterPersistingAssignment() {
        UUID identityId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        IdentityRoleAssignment existing = assignment(identityId, roleId, IdentityRoleAssignment.Status.ACTIVE);

        when(assignmentRepository.findByTenantIdAndIdentityIdAndRoleIdAndSourceTypeAndSourceKey(
                TENANT_ID,
                identityId,
                roleId,
                IdentityRoleAssignment.SourceType.MANUAL,
                IdentityRoleAssignment.SourceType.MANUAL.name())).thenReturn(Optional.of(existing));
        when(assignmentRepository.save(existing)).thenReturn(existing);

        Optional<IdentityRoleAssignment> result = service.revokeRole(
                TENANT_ID,
                identityId,
                roleId,
                IdentityRoleAssignment.SourceType.MANUAL,
                null,
                IdentityRoleAssignment.SourceType.MANUAL.name());

        assertThat(result).contains(existing);
        assertThat(existing.getStatus()).isEqualTo(IdentityRoleAssignment.Status.REVOKED);
        verify(roleEntitlementAssignmentService).revokeRoleEntitlements(TENANT_ID, identityId, roleId, null);
        verify(assignmentRepository).save(existing);
    }

    @Test
    void assignRoleReactivatesRevokedManualAssignmentUsingExplicitManualSourceKey() {
        UUID identityId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        IdentityRoleAssignment existing = assignment(identityId, roleId, IdentityRoleAssignment.Status.REVOKED);
        existing.setSourceType(IdentityRoleAssignment.SourceType.MANUAL);
        existing.setSourceKey(IdentityRoleAssignment.SourceType.MANUAL.name());

        when(identityRepository.findByTenantIdAndId(TENANT_ID, identityId)).thenReturn(Optional.of(identity(identityId)));
        when(accessRoleRepository.findById(roleId)).thenReturn(Optional.of(role(roleId)));
        when(assignmentRepository.findByTenantIdAndIdentityIdAndRoleIdAndSourceTypeAndSourceKey(
                TENANT_ID,
                identityId,
                roleId,
                IdentityRoleAssignment.SourceType.MANUAL,
                IdentityRoleAssignment.SourceType.MANUAL.name())).thenReturn(Optional.of(existing));
        when(assignmentRepository.save(existing)).thenReturn(existing);

        IdentityRoleAssignment result = service.assignRole(
                TENANT_ID,
                identityId,
                roleId,
                IdentityRoleAssignment.SourceType.MANUAL,
                null,
                IdentityRoleAssignment.SourceType.MANUAL.name());

        assertThat(result).isSameAs(existing);
        assertThat(existing.getStatus()).isEqualTo(IdentityRoleAssignment.Status.ACTIVE);
        verify(assignmentRepository).save(existing);
        verify(roleEntitlementAssignmentService).applyRoleEntitlements(TENANT_ID, identityId, roleId, null, IdentityRoleAssignment.SourceType.MANUAL);
    }

    private Employee identity(UUID identityId) {
        Employee identity = new Employee();
        identity.setId(identityId);
        identity.setTenantId(TENANT_ID);
        identity.setDisplayName("Jane Doe");
        return identity;
    }

    private AccessRole role(UUID roleId) {
        AccessRole role = new AccessRole();
        role.setId(roleId);
        role.setTenantId(TENANT_ID);
        role.setName("role-" + roleId);
        return role;
    }

    private AccessRoleAssignmentRule rule(UUID ruleId, UUID roleId) {
        AccessRoleAssignmentRule rule = new AccessRoleAssignmentRule();
        rule.setId(ruleId);
        rule.setTenantId(TENANT_ID);
        rule.setRoleId(roleId);
        return rule;
    }

    private IdentityRoleAssignment assignment(UUID identityId, UUID roleId, IdentityRoleAssignment.Status status) {
        IdentityRoleAssignment assignment = new IdentityRoleAssignment();
        assignment.setId(UUID.randomUUID());
        assignment.setTenantId(TENANT_ID);
        assignment.setIdentityId(identityId);
        assignment.setRoleId(roleId);
        assignment.setStatus(status);
        assignment.setSourceType(IdentityRoleAssignment.SourceType.RULE);
        assignment.setSourceKey("source-key");
        return assignment;
    }
}

