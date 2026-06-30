package com.aidentx.iam.access_roles_management.service.impl;

import com.aidentx.iam.access_roles_management.mapper.AccessRoleMapper;
import com.aidentx.iam.access_roles_management.model.dto.response.AccessRoleDeleteImpactResponse;
import com.aidentx.iam.access_roles_management.model.dto.response.AccessRoleGroupedMemberResponse;
import com.aidentx.iam.access_roles_management.model.dto.response.AccessRoleMemberEntitlementResponse;
import com.aidentx.iam.access_roles_management.model.dto.response.AccessRoleMemberResponse;
import com.aidentx.iam.access_roles_management.model.entity.AccessRole;
import com.aidentx.iam.access_roles_management.model.entity.AccessRoleComposition;
import com.aidentx.iam.access_roles_management.model.entity.IdentityRoleAssignment;
import com.aidentx.iam.access_roles_management.model.entity.RoleEntitlementClosure;
import com.aidentx.iam.access_roles_management.repository.AccessRoleAssignmentExecutionItemRepository;
import com.aidentx.iam.access_roles_management.repository.AccessRoleAssignmentExecutionRepository;
import com.aidentx.iam.access_roles_management.repository.AccessRoleAssignmentRuleRepository;
import com.aidentx.iam.access_roles_management.repository.AccessRoleAuditLogRepository;
import com.aidentx.iam.access_roles_management.repository.AccessRoleCompositionRepository;
import com.aidentx.iam.access_roles_management.repository.AccessRoleEntitlementRepository;
import com.aidentx.iam.access_roles_management.repository.AccessRoleRepository;
import com.aidentx.iam.access_roles_management.repository.IdentityRoleAssignmentRepository;
import com.aidentx.iam.access_roles_management.repository.RoleEntitlementClosureRepository;
import com.aidentx.iam.access_roles_management.service.AccessRoleCompositionService;
import com.aidentx.iam.access_roles_management.service.AccessRoleEntitlementService;
import com.aidentx.iam.access_roles_management.service.RoleEntitlementAssignmentService;
import com.aidentx.iam.access_roles_management.service.RoleEntitlementClosureService;
import com.aidentx.iam.entitlement_management.client.ApplicationClient;
import com.aidentx.iam.entitlement_management.model.entity.Entitlement;
import com.aidentx.iam.entitlement_management.repository.EntitlementAssignmentRepository;
import com.aidentx.iam.entitlement_management.repository.EntitlementRepository;
import com.aidentx.iam.identity_management.model.entity.Employee;
import com.aidentx.iam.identity_management.model.entity.NonHumanIdentity;
import com.aidentx.iam.identity_management.model.enums.IdentityType;
import com.aidentx.iam.identity_management.repository.IdentityRepository;
import com.aidentx.iam.shadow_management.repository.ShadowRepository;
import com.aidentx.logging.service.IUnifiedLogger;
import com.aidentx.logging.service.UnifiedLoggerFactory;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccessRoleServiceImplTest {

    private static final String TENANT_ID = "tenant-1";

    @Mock
    private AccessRoleRepository roleRepository;

    @Mock
    private AccessRoleEntitlementRepository entitlementLinkRepository;

    @Mock
    private AccessRoleCompositionRepository compositionRepository;

    @Mock
    private AccessRoleEntitlementService entitlementService;

    @Mock
    private AccessRoleCompositionService compositionService;

    @Mock
    private RoleEntitlementAssignmentService roleEntitlementAssignmentService;

    @Mock
    private RoleEntitlementClosureService roleEntitlementClosureService;

    @Mock
    private IdentityRoleAssignmentRepository identityRoleAssignmentRepository;

    @Mock
    private RoleEntitlementClosureRepository roleEntitlementClosureRepository;

    @Mock
    private AccessRoleAssignmentRuleRepository assignmentRuleRepository;

    @Mock
    private AccessRoleAssignmentExecutionRepository assignmentExecutionRepository;

    @Mock
    private AccessRoleAssignmentExecutionItemRepository assignmentExecutionItemRepository;

    @Mock
    private AccessRoleAuditLogRepository auditLogRepository;

    @Mock
    private EntitlementRepository entitlementRepository;

    @Mock
    private IdentityRepository identityRepository;

    @Mock
    private ApplicationClient applicationClient;

    @Mock
    private AccessRoleMapper roleMapper;

    @Mock
    private UnifiedLoggerFactory loggerFactory;

    @Mock
    private ShadowRepository shadowRepository;

    @Mock
    private EntitlementAssignmentRepository entitlementAssignmentRepository;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private IUnifiedLogger logger;

    private AccessRoleServiceImpl service;

    @BeforeEach
    void setUp() {
        when(loggerFactory.getLogger(eq(AccessRoleServiceImpl.class), anyString())).thenReturn(logger);
        service = new AccessRoleServiceImpl(
                roleRepository,
                entitlementLinkRepository,
                compositionRepository,
                entitlementService,
                compositionService,
                roleEntitlementAssignmentService,
                roleEntitlementClosureService,
                identityRoleAssignmentRepository,
                roleEntitlementClosureRepository,
                assignmentRuleRepository,
                assignmentExecutionRepository,
                assignmentExecutionItemRepository,
                auditLogRepository,
                entitlementRepository,
                identityRepository,
                applicationClient,
                roleMapper,
                loggerFactory,
                shadowRepository,
                entitlementAssignmentRepository);
    }

    @Test
    void getRoleMembersReturnsDirectAndChildRoleEntitlementPaths() {
        UUID roleId = UUID.randomUUID();
        UUID childRoleId = UUID.randomUUID();
        UUID assignmentId = UUID.randomUUID();
        UUID identityId = UUID.randomUUID();
        UUID directEntitlementId = UUID.randomUUID();
        UUID inheritedEntitlementId = UUID.randomUUID();
        UUID directResourceId = UUID.randomUUID();
        UUID inheritedResourceId = UUID.randomUUID();

        AccessRole role = accessRole(roleId, "Finance Parent Role", "Finance Parent");
        AccessRole childRole = accessRole(childRoleId, "Payroll Child Role", "Payroll Child");
        IdentityRoleAssignment assignment = assignment(assignmentId, identityId, roleId, 1778000000000L);
        Employee identity = employee(identityId, "Jane", "Doe", "Jane Doe");
        Entitlement directEntitlement = entitlement(directEntitlementId, directResourceId, "Direct Permission");
        Entitlement inheritedEntitlement = entitlement(inheritedEntitlementId, inheritedResourceId, "Inherited Permission");
        RoleEntitlementClosure directClosure = closure(roleId, directEntitlementId, roleId, true, 0, List.of(roleId));
        RoleEntitlementClosure inheritedClosure = closure(roleId, inheritedEntitlementId, childRoleId, false, 1, List.of(roleId, childRoleId));

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(identityRoleAssignmentRepository.findByTenantIdAndRoleIdAndStatus(
                TENANT_ID, roleId, IdentityRoleAssignment.Status.ACTIVE)).thenReturn(List.of(assignment));
        when(roleEntitlementClosureRepository.findByTenantIdAndRoleId(TENANT_ID, roleId))
                .thenReturn(List.of(directClosure, inheritedClosure));
        when(identityRepository.findAllById(Set.of(identityId))).thenReturn(List.of(identity));
        when(entitlementRepository.findAllById(anyList()))
                .thenReturn(List.of(directEntitlement, inheritedEntitlement));
        when(applicationClient.getApplicationNames(eq(TENANT_ID), anyList()))
                .thenReturn(Map.of(directResourceId, "Finance App", inheritedResourceId, "Payroll App"));
        when(roleRepository.findByIdIn(anySet())).thenReturn(List.of(role, childRole));

        Page<AccessRoleMemberResponse> result = getRoleMembers(roleId);

        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).allSatisfy(row -> {
            assertThat(row.assignmentId()).isEqualTo(assignmentId);
            assertThat(row.identityId()).isEqualTo(identityId);
            assertThat(row.identityName()).isEqualTo("Jane Doe");
            assertThat(row.identityType()).isEqualTo(IdentityType.EMPLOYEE.name());
            assertThat(row.roleId()).isEqualTo(roleId);
            assertThat(row.roleName()).isEqualTo("Finance Parent");
            assertThat(row.roleAssignedAt()).isEqualTo(1778000000000L);
        });

        AccessRoleMemberResponse directRow = result.getContent().stream()
                .filter(row -> directEntitlementId.equals(row.entitlementId()))
                .findFirst()
                .orElseThrow();
        assertThat(directRow.entitlementName()).isEqualTo("Direct Permission");
        assertThat(directRow.applicationName()).isEqualTo("Finance App");
        assertThat(directRow.accessPathType()).isEqualTo("Direct Role");
        assertThat(directRow.childRoleId()).isNull();
        assertThat(directRow.rolePath()).extracting(AccessRoleMemberResponse.RolePathNode::roleId)
                .containsExactly(roleId);

        AccessRoleMemberResponse inheritedRow = result.getContent().stream()
                .filter(row -> inheritedEntitlementId.equals(row.entitlementId()))
                .findFirst()
                .orElseThrow();
        assertThat(inheritedRow.entitlementName()).isEqualTo("Inherited Permission");
        assertThat(inheritedRow.applicationName()).isEqualTo("Payroll App");
        assertThat(inheritedRow.accessPathType()).isEqualTo("Child Role");
        assertThat(inheritedRow.childRoleId()).isEqualTo(childRoleId);
        assertThat(inheritedRow.childRoleName()).isEqualTo("Payroll Child");
        assertThat(inheritedRow.rolePath()).extracting(AccessRoleMemberResponse.RolePathNode::roleId)
                .containsExactly(roleId, childRoleId);
    }

    @Test
    void getRoleMembersAppliesSearchAndExactFiltersBeforePagination() {
        UUID roleId = UUID.randomUUID();
        UUID childRoleId = UUID.randomUUID();
        UUID assignmentId = UUID.randomUUID();
        UUID identityId = UUID.randomUUID();
        UUID directEntitlementId = UUID.randomUUID();
        UUID inheritedEntitlementId = UUID.randomUUID();
        UUID directResourceId = UUID.randomUUID();
        UUID inheritedResourceId = UUID.randomUUID();

        AccessRole role = accessRole(roleId, "Finance Parent Role", "Finance Parent");
        AccessRole childRole = accessRole(childRoleId, "Payroll Child Role", "Payroll Child");
        IdentityRoleAssignment assignment = assignment(assignmentId, identityId, roleId, 1778000000000L);
        Employee identity = employee(identityId, "Jane", "Doe", "Jane Doe");
        Entitlement directEntitlement = entitlement(directEntitlementId, directResourceId, "Direct Permission");
        Entitlement inheritedEntitlement = entitlement(inheritedEntitlementId, inheritedResourceId, "Inherited Permission");
        RoleEntitlementClosure directClosure = closure(roleId, directEntitlementId, roleId, true, 0, List.of(roleId));
        RoleEntitlementClosure inheritedClosure = closure(roleId, inheritedEntitlementId, childRoleId, false, 1, List.of(roleId, childRoleId));

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(identityRoleAssignmentRepository.findByTenantIdAndRoleIdAndStatus(
                TENANT_ID, roleId, IdentityRoleAssignment.Status.ACTIVE)).thenReturn(List.of(assignment));
        when(roleEntitlementClosureRepository.findByTenantIdAndRoleId(TENANT_ID, roleId))
                .thenReturn(List.of(directClosure, inheritedClosure));
        when(identityRepository.findAllById(Set.of(identityId))).thenReturn(List.of(identity));
        when(entitlementRepository.findAllById(anyList()))
                .thenReturn(List.of(directEntitlement, inheritedEntitlement));
        when(applicationClient.getApplicationNames(eq(TENANT_ID), anyList()))
                .thenReturn(Map.of(directResourceId, "Finance App", inheritedResourceId, "Payroll App"));
        when(roleRepository.findByIdIn(anySet())).thenReturn(List.of(role, childRole));

        Page<AccessRoleMemberResponse> searchResult = service.getRoleMembers(
                TENANT_ID,
                roleId,
                "payroll",
                null,
                null,
                null,
                null,
                null,
                null,
                PageRequest.of(0, 1));

        assertThat(searchResult.getTotalElements()).isEqualTo(1);
        assertThat(searchResult.getContent()).singleElement().satisfies(row -> {
            assertThat(row.entitlementId()).isEqualTo(inheritedEntitlementId);
            assertThat(row.accessPathType()).isEqualTo("Child Role");
            assertThat(row.childRoleName()).isEqualTo("Payroll Child");
        });

        Page<AccessRoleMemberResponse> filterResult = service.getRoleMembers(
                TENANT_ID,
                roleId,
                null,
                List.of("employee"),
                null,
                List.of("direct_through_role"),
                List.of("rule"),
                List.of(directResourceId),
                List.of(directEntitlementId),
                PageRequest.of(0, 10));

        assertThat(filterResult.getTotalElements()).isEqualTo(1);
        assertThat(filterResult.getContent()).singleElement().satisfies(row -> {
            assertThat(row.entitlementId()).isEqualTo(directEntitlementId);
            assertThat(row.applicationId()).isEqualTo(directResourceId);
            assertThat(row.accessPathType()).isEqualTo("Direct Role");
            assertThat(row.assignmentSourceType()).isEqualTo("RULE");
        });
    }

    @Test
    void getRoleMembersFiltersByIdentityRiskLevel() {
        UUID roleId = UUID.randomUUID();
        UUID assignmentId = UUID.randomUUID();
        UUID identityId = UUID.randomUUID();
        AccessRole role = accessRole(roleId, "Service Role", null);
        IdentityRoleAssignment assignment = assignment(assignmentId, identityId, roleId, 1778000000000L);
        NonHumanIdentity identity = nonHumanIdentity(identityId, "svc-payroll", "HIGH");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(identityRoleAssignmentRepository.findByTenantIdAndRoleIdAndStatus(
                TENANT_ID, roleId, IdentityRoleAssignment.Status.ACTIVE)).thenReturn(List.of(assignment));
        when(roleEntitlementClosureRepository.findByTenantIdAndRoleId(TENANT_ID, roleId)).thenReturn(List.of());
        when(identityRepository.findAllById(Set.of(identityId))).thenReturn(List.of(identity));

        Page<AccessRoleMemberResponse> highRiskResult = service.getRoleMembers(
                TENANT_ID,
                roleId,
                null,
                null,
                List.of("high"),
                null,
                null,
                null,
                null,
                PageRequest.of(0, 10));

        assertThat(highRiskResult.getTotalElements()).isEqualTo(1);
        assertThat(highRiskResult.getContent()).singleElement().satisfies(row -> {
            assertThat(row.identityName()).isEqualTo("svc-payroll");
            assertThat(row.identityRiskLevel()).isEqualTo("HIGH");
        });

        Page<AccessRoleMemberResponse> lowRiskResult = service.getRoleMembers(
                TENANT_ID,
                roleId,
                null,
                null,
                List.of("low"),
                null,
                null,
                null,
                null,
                PageRequest.of(0, 10));

        assertThat(lowRiskResult.getTotalElements()).isZero();
        assertThat(lowRiskResult.getContent()).isEmpty();
    }

    @Test
    void getRoleMembersReturnsAssignmentRowWhenRoleHasNoEffectiveEntitlements() {
        UUID roleId = UUID.randomUUID();
        UUID assignmentId = UUID.randomUUID();
        UUID identityId = UUID.randomUUID();
        AccessRole role = accessRole(roleId, "Empty Role", null);
        IdentityRoleAssignment assignment = assignment(assignmentId, identityId, roleId, 1778000000000L);
        Employee identity = employee(identityId, "John", "Smith", null);

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(identityRoleAssignmentRepository.findByTenantIdAndRoleIdAndStatus(
                TENANT_ID, roleId, IdentityRoleAssignment.Status.ACTIVE)).thenReturn(List.of(assignment));
        when(roleEntitlementClosureRepository.findByTenantIdAndRoleId(TENANT_ID, roleId)).thenReturn(List.of());
        when(identityRepository.findAllById(Set.of(identityId))).thenReturn(List.of(identity));

        Page<AccessRoleMemberResponse> result = getRoleMembers(roleId);

        assertThat(result.getTotalElements()).isEqualTo(1);
        AccessRoleMemberResponse row = result.getContent().get(0);
        assertThat(row.identityName()).isEqualTo("John Smith");
        assertThat(row.roleName()).isEqualTo("Empty Role");
        assertThat(row.entitlementId()).isNull();
        assertThat(row.entitlementName()).isNull();
        assertThat(row.applicationName()).isNull();
        assertThat(row.accessPathType()).isEqualTo("No Entitlement");
        assertThat(row.rolePath()).isEmpty();
    }

    @Test
    void getRoleMembersGroupedReturnsMemberSummaryWithEntitlementCountAndChildRoles() {
        UUID roleId = UUID.randomUUID();
        UUID childRoleId = UUID.randomUUID();
        UUID assignmentId = UUID.randomUUID();
        UUID identityId = UUID.randomUUID();
        UUID directEntitlementId = UUID.randomUUID();
        UUID inheritedEntitlementId = UUID.randomUUID();
        UUID directResourceId = UUID.randomUUID();
        UUID inheritedResourceId = UUID.randomUUID();

        AccessRole role = accessRole(roleId, "Finance Parent Role", "Finance Parent");
        AccessRole childRole = accessRole(childRoleId, "Payroll Child Role", "Payroll Child");
        IdentityRoleAssignment assignment = assignment(assignmentId, identityId, roleId, 1778000000000L);
        Employee identity = employee(identityId, "Jane", "Doe", "Jane Doe");
        RoleEntitlementClosure directClosure = closure(roleId, directEntitlementId, roleId, true, 0, List.of(roleId));
        RoleEntitlementClosure inheritedClosure = closure(roleId, inheritedEntitlementId, childRoleId, false, 1, List.of(roleId, childRoleId));

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(identityRoleAssignmentRepository.findByTenantIdAndRoleIdAndStatus(
                TENANT_ID, roleId, IdentityRoleAssignment.Status.ACTIVE)).thenReturn(List.of(assignment));
        when(roleEntitlementClosureRepository.findByTenantIdAndRoleId(TENANT_ID, roleId))
                .thenReturn(List.of(directClosure, inheritedClosure));
        when(identityRepository.findAllById(Set.of(identityId))).thenReturn(List.of(identity));
        when(roleRepository.findByIdIn(anySet())).thenReturn(List.of(role, childRole));

        Page<AccessRoleGroupedMemberResponse> result = getRoleMembersGrouped(roleId);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).singleElement().satisfies(member -> {
            assertThat(member.assignmentId()).isEqualTo(assignmentId);
            assertThat(member.identityId()).isEqualTo(identityId);
            assertThat(member.identityName()).isEqualTo("Jane Doe");
            assertThat(member.roleName()).isEqualTo("Finance Parent");
            assertThat(member.entitlementCount()).isEqualTo(2);
            assertThat(member.childRoleNames()).containsExactly("Payroll Child");
            assertThat(member.assignmentPathSummary()).isEqualTo("Direct + inherited through 1 child role");
        });

        verify(entitlementRepository, never()).findAllById(anyList());
        verify(applicationClient, never()).getApplicationNames(eq(TENANT_ID), anyList());
    }

    @Test
    void getRoleMembersGroupedSearchesByEmployeeNameAndPaginatesAcrossMembers() {
        UUID roleId = UUID.randomUUID();
        UUID childRoleId = UUID.randomUUID();
        UUID assignmentOneId = UUID.randomUUID();
        UUID assignmentTwoId = UUID.randomUUID();
        UUID identityOneId = UUID.randomUUID();
        UUID identityTwoId = UUID.randomUUID();
        UUID entitlementOneId = UUID.randomUUID();
        UUID entitlementTwoId = UUID.randomUUID();
        UUID resourceOneId = UUID.randomUUID();
        UUID resourceTwoId = UUID.randomUUID();

        AccessRole role = accessRole(roleId, "Finance Parent Role", "Finance Parent");
        AccessRole childRole = accessRole(childRoleId, "Payroll Child Role", "Payroll Child");
        IdentityRoleAssignment assignmentOne = assignment(assignmentOneId, identityOneId, roleId, 1778000002000L);
        IdentityRoleAssignment assignmentTwo = assignment(assignmentTwoId, identityTwoId, roleId, 1778000001000L);
        Employee identityOne = employee(identityOneId, "Jane", "Doe", "Jane Doe");
        Employee identityTwo = employee(identityTwoId, "John", "Smith", "John Smith");
        Entitlement directEntitlement = entitlement(entitlementOneId, resourceOneId, "Direct Permission");
        Entitlement inheritedEntitlement = entitlement(entitlementTwoId, resourceTwoId, "Payroll Permission");
        RoleEntitlementClosure directClosure = closure(roleId, entitlementOneId, roleId, true, 0, List.of(roleId));
        RoleEntitlementClosure inheritedClosure = closure(roleId, entitlementTwoId, childRoleId, false, 1, List.of(roleId, childRoleId));

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(identityRoleAssignmentRepository.findByTenantIdAndRoleIdAndStatus(
                TENANT_ID, roleId, IdentityRoleAssignment.Status.ACTIVE)).thenReturn(List.of(assignmentOne, assignmentTwo));
        when(roleEntitlementClosureRepository.findByTenantIdAndRoleId(TENANT_ID, roleId))
                .thenReturn(List.of(directClosure, inheritedClosure));
        when(identityRepository.findAllById(Set.of(identityOneId, identityTwoId))).thenReturn(List.of(identityOne, identityTwo));
        when(roleRepository.findByIdIn(anySet())).thenReturn(List.of(role, childRole));

        Page<AccessRoleGroupedMemberResponse> searchResult = service.getRoleMembersGrouped(
                TENANT_ID,
                roleId,
                "jane",
                PageRequest.of(0, 10));

        assertThat(searchResult.getTotalElements()).isEqualTo(1);
        assertThat(searchResult.getContent()).singleElement().satisfies(member ->
                assertThat(member.identityName()).isEqualTo("Jane Doe"));

        Page<AccessRoleGroupedMemberResponse> unmatchedSearchResult = service.getRoleMembersGrouped(
                TENANT_ID,
                roleId,
                "payroll",
                PageRequest.of(0, 10));

        assertThat(unmatchedSearchResult.getTotalElements()).isZero();

        Page<AccessRoleGroupedMemberResponse> pagedResult = service.getRoleMembersGrouped(
                TENANT_ID,
                roleId,
                null,
                PageRequest.of(0, 1));

        assertThat(pagedResult.getTotalElements()).isEqualTo(2);
        assertThat(pagedResult.getContent()).singleElement().satisfies(member -> {
            assertThat(member.assignmentId()).isEqualTo(assignmentOneId);
            assertThat(member.identityName()).isEqualTo("Jane Doe");
            assertThat(member.entitlementCount()).isEqualTo(2);
            assertThat(member.childRoleNames()).containsExactly("Payroll Child");
        });
    }

    @Test
    void getRoleMembersGroupedReturnsZeroEntitlementCountWhenRoleHasNoEffectiveEntitlements() {
        UUID roleId = UUID.randomUUID();
        UUID assignmentId = UUID.randomUUID();
        UUID identityId = UUID.randomUUID();
        AccessRole role = accessRole(roleId, "Empty Role", null);
        IdentityRoleAssignment assignment = assignment(assignmentId, identityId, roleId, 1778000000000L);
        Employee identity = employee(identityId, "John", "Smith", null);

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(identityRoleAssignmentRepository.findByTenantIdAndRoleIdAndStatus(
                TENANT_ID, roleId, IdentityRoleAssignment.Status.ACTIVE)).thenReturn(List.of(assignment));
        when(roleEntitlementClosureRepository.findByTenantIdAndRoleId(TENANT_ID, roleId)).thenReturn(List.of());
        when(identityRepository.findAllById(Set.of(identityId))).thenReturn(List.of(identity));

        Page<AccessRoleGroupedMemberResponse> result = getRoleMembersGrouped(roleId);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).singleElement().satisfies(member -> {
            assertThat(member.assignmentId()).isEqualTo(assignmentId);
            assertThat(member.identityName()).isEqualTo("John Smith");
            assertThat(member.roleName()).isEqualTo("Empty Role");
            assertThat(member.entitlementCount()).isZero();
            assertThat(member.childRoleNames()).isEmpty();
            assertThat(member.assignmentPathSummary()).isEqualTo("Direct role assignment");
        });
    }

    @Test
    void getRoleMemberEntitlementsReturnsUserFriendlyPathDetails() {
        UUID roleId = UUID.randomUUID();
        UUID childRoleId = UUID.randomUUID();
        UUID assignmentId = UUID.randomUUID();
        UUID identityId = UUID.randomUUID();
        UUID directEntitlementId = UUID.randomUUID();
        UUID inheritedEntitlementId = UUID.randomUUID();
        UUID directResourceId = UUID.randomUUID();
        UUID inheritedResourceId = UUID.randomUUID();

        AccessRole role = accessRole(roleId, "Finance Parent Role", "Finance Parent");
        AccessRole childRole = accessRole(childRoleId, "Payroll Child Role", "Payroll Child");
        IdentityRoleAssignment assignment = assignment(assignmentId, identityId, roleId, 1778000000000L);
        Employee identity = employee(identityId, "Jane", "Doe", "Jane Doe");
        Entitlement directEntitlement = entitlement(directEntitlementId, directResourceId, "Direct Permission");
        Entitlement inheritedEntitlement = entitlement(inheritedEntitlementId, inheritedResourceId, "Inherited Permission");
        RoleEntitlementClosure directClosure = closure(roleId, directEntitlementId, roleId, true, 0, List.of(roleId));
        RoleEntitlementClosure inheritedClosure = closure(roleId, inheritedEntitlementId, childRoleId, false, 1, List.of(roleId, childRoleId));

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(identityRoleAssignmentRepository.findByIdAndTenantIdAndRoleIdAndStatus(
                assignmentId, TENANT_ID, roleId, IdentityRoleAssignment.Status.ACTIVE)).thenReturn(Optional.of(assignment));
        when(roleEntitlementClosureRepository.findByTenantIdAndRoleId(TENANT_ID, roleId))
                .thenReturn(List.of(directClosure, inheritedClosure));
        when(identityRepository.findAllById(Set.of(identityId))).thenReturn(List.of(identity));
        when(entitlementRepository.findAllById(anyList()))
                .thenReturn(List.of(directEntitlement, inheritedEntitlement));
        when(applicationClient.getApplicationNames(eq(TENANT_ID), anyList()))
                .thenReturn(Map.of(directResourceId, "Finance App", inheritedResourceId, "Payroll App"));
        when(roleRepository.findByIdIn(anySet())).thenReturn(List.of(role, childRole));

        Page<AccessRoleMemberEntitlementResponse> result = getRoleMemberEntitlements(roleId, assignmentId);

        assertThat(result.getTotalElements()).isEqualTo(2);
        AccessRoleMemberEntitlementResponse directRow = result.getContent().stream()
                .filter(row -> directEntitlementId.equals(row.entitlementId()))
                .findFirst()
                .orElseThrow();
        assertThat(directRow.accessPathLabel()).isEqualTo("Directly linked to this role");
        assertThat(directRow.inheritanceDepthLabel()).isEqualTo("Direct");
        assertThat(directRow.assignmentPath()).isEqualTo("Finance Parent");
        assertThat(directRow.childRoleName()).isNull();

        AccessRoleMemberEntitlementResponse inheritedRow = result.getContent().stream()
                .filter(row -> inheritedEntitlementId.equals(row.entitlementId()))
                .findFirst()
                .orElseThrow();
        assertThat(inheritedRow.accessPathType()).isEqualTo("Child Role");
        assertThat(inheritedRow.accessPathLabel()).isEqualTo("Inherited through child role Payroll Child");
        assertThat(inheritedRow.inheritanceDepthLabel()).isEqualTo("Inherited from 1 child role");
        assertThat(inheritedRow.childRoleName()).isEqualTo("Payroll Child");
        assertThat(inheritedRow.assignmentPath()).isEqualTo("Finance Parent → Payroll Child");
    }

    @Test
    void getRoleMemberEntitlementsAppliesSearchAndFilters() {
        UUID roleId = UUID.randomUUID();
        UUID childRoleId = UUID.randomUUID();
        UUID assignmentId = UUID.randomUUID();
        UUID identityId = UUID.randomUUID();
        UUID directEntitlementId = UUID.randomUUID();
        UUID inheritedEntitlementId = UUID.randomUUID();
        UUID directResourceId = UUID.randomUUID();
        UUID inheritedResourceId = UUID.randomUUID();

        AccessRole role = accessRole(roleId, "Finance Parent Role", "Finance Parent");
        AccessRole childRole = accessRole(childRoleId, "Payroll Child Role", "Payroll Child");
        IdentityRoleAssignment assignment = assignment(assignmentId, identityId, roleId, 1778000000000L);
        Employee identity = employee(identityId, "Jane", "Doe", "Jane Doe");
        Entitlement directEntitlement = entitlement(directEntitlementId, directResourceId, "Direct Permission");
        Entitlement inheritedEntitlement = entitlement(inheritedEntitlementId, inheritedResourceId, "Payroll Permission");
        RoleEntitlementClosure directClosure = closure(roleId, directEntitlementId, roleId, true, 0, List.of(roleId));
        RoleEntitlementClosure inheritedClosure = closure(roleId, inheritedEntitlementId, childRoleId, false, 1, List.of(roleId, childRoleId));

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(identityRoleAssignmentRepository.findByIdAndTenantIdAndRoleIdAndStatus(
                assignmentId, TENANT_ID, roleId, IdentityRoleAssignment.Status.ACTIVE)).thenReturn(Optional.of(assignment));
        when(roleEntitlementClosureRepository.findByTenantIdAndRoleId(TENANT_ID, roleId))
                .thenReturn(List.of(directClosure, inheritedClosure));
        when(identityRepository.findAllById(Set.of(identityId))).thenReturn(List.of(identity));
        when(entitlementRepository.findAllById(List.of(directEntitlementId, inheritedEntitlementId)))
                .thenReturn(List.of(directEntitlement, inheritedEntitlement));
        when(applicationClient.getApplicationNames(eq(TENANT_ID), anyList()))
                .thenReturn(Map.of(directResourceId, "Finance App", inheritedResourceId, "Payroll App"));
        when(roleRepository.findByIdIn(anySet())).thenReturn(List.of(role, childRole));

        Page<AccessRoleMemberEntitlementResponse> searchResult = service.getRoleMemberEntitlements(
                TENANT_ID,
                roleId,
                assignmentId,
                "payroll",
                null,
                null,
                null,
                PageRequest.of(0, 10));

        assertThat(searchResult.getTotalElements()).isEqualTo(1);
        assertThat(searchResult.getContent()).singleElement().satisfies(row -> {
            assertThat(row.entitlementId()).isEqualTo(inheritedEntitlementId);
            assertThat(row.childRoleName()).isEqualTo("Payroll Child");
        });

        Page<AccessRoleMemberEntitlementResponse> filterResult = service.getRoleMemberEntitlements(
                TENANT_ID,
                roleId,
                assignmentId,
                null,
                List.of("direct_through_role"),
                List.of(directResourceId),
                List.of(directEntitlementId),
                PageRequest.of(0, 10));

        assertThat(filterResult.getTotalElements()).isEqualTo(1);
        assertThat(filterResult.getContent()).singleElement().satisfies(row -> {
            assertThat(row.entitlementId()).isEqualTo(directEntitlementId);
            assertThat(row.applicationId()).isEqualTo(directResourceId);
            assertThat(row.accessPathType()).isEqualTo("Direct Role");
        });
    }

    @Test
    void getRoleMembersRejectsRoleFromAnotherTenant() {
        UUID roleId = UUID.randomUUID();
        AccessRole role = accessRole(roleId, "Other Tenant Role", null);
        role.setTenantId("other-tenant");
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));

        assertThatThrownBy(() -> getRoleMembers(roleId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining(roleId.toString());

        verify(roleRepository).findById(roleId);
    }

    @Test
    void deleteRoleRevokesAssignmentsDeletesOnlyLinksAndSelectedRole() {
        UUID roleId = UUID.randomUUID();
        UUID parentRoleId = UUID.randomUUID();
        UUID childRoleId = UUID.randomUUID();
        UUID identityId = UUID.randomUUID();
        UUID assignmentRuleId = UUID.randomUUID();
        AccessRole role = accessRole(roleId, "Role To Delete", "Role To Delete");
        IdentityRoleAssignment assignment = assignment(UUID.randomUUID(), identityId, roleId, 1778000000000L);
        assignment.setAssignmentRuleId(assignmentRuleId);
        AccessRoleComposition parentLink = composition(parentRoleId, roleId);

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(compositionRepository.findByChildRoleId(roleId)).thenReturn(List.of(parentLink));
        when(identityRoleAssignmentRepository.findByTenantIdAndRoleIdAndStatus(
                TENANT_ID, roleId, IdentityRoleAssignment.Status.ACTIVE)).thenReturn(List.of(assignment));

        service.deleteRole(TENANT_ID, roleId);

        assertThat(assignment.getStatus()).isEqualTo(IdentityRoleAssignment.Status.REVOKED);
        assertThat(assignment.getRevokedAt()).isNotNull();
        InOrder revocationOrder = inOrder(identityRoleAssignmentRepository, roleEntitlementAssignmentService);
        revocationOrder.verify(identityRoleAssignmentRepository).saveAllAndFlush(List.of(assignment));
        revocationOrder.verify(roleEntitlementAssignmentService).revokeRoleEntitlements(TENANT_ID, identityId, roleId, assignmentRuleId);
        verify(entitlementLinkRepository).deleteByRoleId(roleId);
        verify(compositionRepository).deleteByParentRoleId(roleId);
        verify(compositionRepository).deleteByChildRoleId(roleId);
        verify(roleEntitlementClosureRepository).deleteByTenantIdAndRoleId(TENANT_ID, roleId);
        verify(roleEntitlementClosureService).rebuildRoleAndAncestors(TENANT_ID, parentRoleId);
        verify(roleRepository).delete(role);
        verify(roleRepository, never()).delete(accessRole(parentRoleId, "Parent", null));
        verify(roleRepository, never()).delete(accessRole(childRoleId, "Child", null));
    }

    @Test
    void getDeleteImpactReturnsCountsOnlyWithoutMutatingState() {
        UUID roleId = UUID.randomUUID();
        AccessRole role = accessRole(roleId, "Role To Delete", "Role To Delete");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(identityRoleAssignmentRepository.countByTenantIdAndRoleIdAndStatus(
                TENANT_ID, roleId, IdentityRoleAssignment.Status.ACTIVE)).thenReturn(14L);
        when(identityRoleAssignmentRepository.countDistinctIdentityIdByTenantIdAndRoleIdAndStatus(
                TENANT_ID, roleId, IdentityRoleAssignment.Status.ACTIVE)).thenReturn(12L);
        when(entitlementLinkRepository.countByRoleId(roleId)).thenReturn(3L);
        when(roleEntitlementClosureRepository.countByTenantIdAndRoleId(TENANT_ID, roleId)).thenReturn(9L);
        when(roleEntitlementClosureRepository.countDistinctEntitlementIdByTenantIdAndRoleId(TENANT_ID, roleId)).thenReturn(7L);
        when(compositionRepository.countByParentRoleId(roleId)).thenReturn(4L);
        when(compositionRepository.countByChildRoleId(roleId)).thenReturn(2L);
        when(compositionRepository.countDistinctParentRoleIdByChildRoleId(roleId)).thenReturn(2L);
        when(assignmentRuleRepository.countByTenantIdAndRoleId(TENANT_ID, roleId)).thenReturn(1L);
        when(assignmentRuleRepository.countByTenantIdAndRoleIdAndEnabledTrue(TENANT_ID, roleId)).thenReturn(1L);
        when(assignmentExecutionRepository.countByTenantIdAndRoleId(TENANT_ID, roleId)).thenReturn(5L);
        when(assignmentExecutionItemRepository.countByTenantIdAndRoleId(TENANT_ID, roleId)).thenReturn(21L);
        when(auditLogRepository.countByTenantIdAndRoleId(TENANT_ID, roleId)).thenReturn(8L);

        AccessRoleDeleteImpactResponse response = service.getDeleteImpact(TENANT_ID, roleId);

        assertThat(response.rolesDeletedCount()).isEqualTo(1);
        assertThat(response.activeAssignmentsRevoked()).isEqualTo(14);
        assertThat(response.distinctUsersAffected()).isEqualTo(12);
        assertThat(response.directEntitlementLinksRemoved()).isEqualTo(3);
        assertThat(response.effectiveEntitlementRowsRemoved()).isEqualTo(9);
        assertThat(response.distinctEffectiveEntitlementsAffected()).isEqualTo(7);
        assertThat(response.childRoleLinksRemoved()).isEqualTo(4);
        assertThat(response.parentRoleLinksRemoved()).isEqualTo(2);
        assertThat(response.parentRolesToRefresh()).isEqualTo(2);
        assertThat(response.assignmentRulesImpacted()).isEqualTo(1);
        assertThat(response.enabledAssignmentRulesImpacted()).isEqualTo(1);
        assertThat(response.executionRunsImpacted()).isEqualTo(5);
        assertThat(response.executionItemsImpacted()).isEqualTo(21);
        assertThat(response.auditRecordsImpacted()).isEqualTo(8);
        assertThat(response.totalLinksRemoved()).isEqualTo(9);
        verify(roleRepository, never()).delete(role);
        verify(identityRoleAssignmentRepository, never()).saveAllAndFlush(anyList());
    }

    private Page<AccessRoleMemberResponse> getRoleMembers(UUID roleId) {
        return service.getRoleMembers(
                TENANT_ID,
                roleId,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                PageRequest.of(0, 10));
    }

    private Page<AccessRoleGroupedMemberResponse> getRoleMembersGrouped(UUID roleId) {
        return service.getRoleMembersGrouped(
                TENANT_ID,
                roleId,
                null,
                PageRequest.of(0, 10));
    }

    private Page<AccessRoleMemberEntitlementResponse> getRoleMemberEntitlements(UUID roleId, UUID assignmentId) {
        return service.getRoleMemberEntitlements(
                TENANT_ID,
                roleId,
                assignmentId,
                null,
                null,
                null,
                null,
                PageRequest.of(0, 10));
    }

    private AccessRole accessRole(UUID id, String name, String displayName) {
        AccessRole role = new AccessRole();
        role.setId(id);
        role.setTenantId(TENANT_ID);
        role.setName(name);
        role.setDisplayName(displayName);
        role.setType("business");
        role.setStatus("active");
        return role;
    }

    private IdentityRoleAssignment assignment(UUID id, UUID identityId, UUID roleId, Long assignedAt) {
        IdentityRoleAssignment assignment = new IdentityRoleAssignment();
        assignment.setId(id);
        assignment.setTenantId(TENANT_ID);
        assignment.setIdentityId(identityId);
        assignment.setRoleId(roleId);
        assignment.setStatus(IdentityRoleAssignment.Status.ACTIVE);
        assignment.setSourceType(IdentityRoleAssignment.SourceType.RULE);
        assignment.setSourceKey("rule-1");
        assignment.setAssignedAt(assignedAt);
        return assignment;
    }

    private AccessRoleComposition composition(UUID parentRoleId, UUID childRoleId) {
        AccessRoleComposition composition = new AccessRoleComposition();
        composition.setParentRoleId(parentRoleId);
        composition.setChildRoleId(childRoleId);
        return composition;
    }

    private Employee employee(UUID id, String firstName, String lastName, String displayName) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setTenantId(TENANT_ID);
        employee.setIdentityType(IdentityType.EMPLOYEE);
        employee.setEmployeeId("emp-" + id);
        employee.setUsername(firstName.toLowerCase() + "." + lastName.toLowerCase());
        employee.setEmail(firstName.toLowerCase() + "." + lastName.toLowerCase() + "@example.com");
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setDisplayName(displayName);
        return employee;
    }

    private NonHumanIdentity nonHumanIdentity(UUID id, String serviceName, String riskLevel) {
        NonHumanIdentity identity = new NonHumanIdentity();
        identity.setId(id);
        identity.setTenantId(TENANT_ID);
        identity.setIdentityType(IdentityType.NON_HUMAN);
        identity.setServiceName(serviceName);
        identity.setRiskLevel(riskLevel);
        return identity;
    }

    private Entitlement entitlement(UUID id, UUID resourceId, String displayName) {
        Entitlement entitlement = new Entitlement();
        entitlement.setId(id);
        entitlement.setTenantId(TENANT_ID);
        entitlement.setResourceId(resourceId);
        entitlement.setSourceUid("source-" + id);
        entitlement.setDisplayName(displayName);
        return entitlement;
    }

    private RoleEntitlementClosure closure(UUID roleId,
                                           UUID entitlementId,
                                           UUID sourceRoleId,
                                           boolean direct,
                                           int depth,
                                           List<UUID> pathRoleIds) {
        RoleEntitlementClosure closure = new RoleEntitlementClosure();
        closure.setTenantId(TENANT_ID);
        closure.setRoleId(roleId);
        closure.setEntitlementId(entitlementId);
        closure.setSourceRoleId(sourceRoleId);
        closure.setDirect(direct);
        closure.setDepth(depth);
        closure.setPathRoleIds(pathRoleIds);
        return closure;
    }
}

