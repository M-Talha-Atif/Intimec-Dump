package com.aidentx.iam.entitlement_management.service;

import com.aidentx.iam.access_roles_management.model.entity.AccessRole;
import com.aidentx.iam.access_roles_management.model.entity.RoleEntitlementClosure;
import com.aidentx.iam.access_roles_management.repository.AccessRoleAssignmentRuleRepository;
import com.aidentx.iam.access_roles_management.repository.AccessRoleRepository;
import com.aidentx.iam.access_roles_management.repository.RoleEntitlementClosureRepository;
import com.aidentx.iam.entitlement_management.client.ApplicationClient;
import com.aidentx.iam.entitlement_management.mapper.EntitlementMapper;
import com.aidentx.iam.entitlement_management.model.entity.Entitlement;
import com.aidentx.iam.entitlement_management.model.entity.EntitlementAssignment;
import com.aidentx.iam.entitlement_management.repository.EntitlementAssignmentRepository;
import com.aidentx.iam.entitlement_management.repository.EntitlementRepository;
import com.aidentx.iam.identity_management.model.dto.IdentityEntitlementViewDto;
import com.aidentx.iam.identity_management.repository.EmployeeRepository;
import com.aidentx.iam.shadow_management.model.entity.Shadow;
import com.aidentx.iam.shadow_management.repository.ShadowRepository;
import com.aidentx.iam.shadow_management.sync.EntitlementMappingEngine;
import com.aidentx.logging.service.IUnifiedLogger;
import com.aidentx.logging.service.UnifiedLoggerFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EntitlementServiceImplTest {

    private static final String TENANT_ID = "tenant-1";

    @Mock
    private EntitlementRepository entitlementRepository;

    @Mock
    private EntitlementAssignmentRepository assignmentRepository;

    @Mock
    private EntitlementMapper entitlementMapper;

    @Mock
    private EntitlementMappingEngine mappingEngine;

    @Mock
    private ShadowRepository shadowRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ApplicationClient applicationClient;

    @Mock
    private EntitlementSchemaService entitlementSchemaService;

    @Mock
    private AccessRoleRepository accessRoleRepository;

    @Mock
    private AccessRoleAssignmentRuleRepository accessRoleAssignmentRuleRepository;

    @Mock
    private RoleEntitlementClosureRepository roleEntitlementClosureRepository;

    @Mock
    private UnifiedLoggerFactory loggerFactory;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private IUnifiedLogger logger;

    private EntitlementServiceImpl service;

    @BeforeEach
    void setUp() {
        when(loggerFactory.getLogger(EntitlementServiceImpl.class)).thenReturn(logger);
        service = new EntitlementServiceImpl(
                entitlementRepository,
                assignmentRepository,
                entitlementMapper,
                mappingEngine,
                shadowRepository,
                employeeRepository,
                applicationClient,
                entitlementSchemaService,
                accessRoleRepository,
                accessRoleAssignmentRuleRepository,
                roleEntitlementClosureRepository,
                loggerFactory);
    }

    @Test
    void getEntitlementsByIdentityIdAddsRoleDirectAndInheritedPathProvenance() {
        UUID identityId = UUID.randomUUID();
        UUID shadowId = UUID.randomUUID();
        UUID resourceId = UUID.randomUUID();
        UUID directEntitlementId = UUID.randomUUID();
        UUID roleDirectEntitlementId = UUID.randomUUID();
        UUID inheritedEntitlementId = UUID.randomUUID();
        UUID parentRoleId = UUID.randomUUID();
        UUID childRoleId = UUID.randomUUID();

        EntitlementAssignment directAssignment = assignment(shadowId, directEntitlementId, resourceId, "IMPORT", null);
        EntitlementAssignment roleDirectAssignment = assignment(shadowId, roleDirectEntitlementId, resourceId, "DYNAMIC", parentRoleId);
        EntitlementAssignment inheritedAssignment = assignment(shadowId, inheritedEntitlementId, resourceId, "DYNAMIC", parentRoleId);

        RoleEntitlementClosure directClosure = closure(parentRoleId, roleDirectEntitlementId, parentRoleId, true, 0, List.of(parentRoleId));
        RoleEntitlementClosure inheritedClosure = closure(parentRoleId, inheritedEntitlementId, childRoleId, false, 1, List.of(parentRoleId, childRoleId));

        when(shadowRepository.findShadowIdsByLinkedIdentityId(identityId, TENANT_ID)).thenReturn(List.of(shadowId));
        when(assignmentRepository.findByShadowIdInAndTenantId(eq(List.of(shadowId)), eq(TENANT_ID), eq(PageRequest.of(0, 20))))
                .thenReturn(new PageImpl<>(List.of(directAssignment, roleDirectAssignment, inheritedAssignment), PageRequest.of(0, 20), 3));
        when(entitlementRepository.findAllById(anyCollection())).thenReturn(List.of(
                entitlement(directEntitlementId, resourceId, "Imported Group"),
                entitlement(roleDirectEntitlementId, resourceId, "Parent Direct Group"),
                entitlement(inheritedEntitlementId, resourceId, "Child Group")));
        when(shadowRepository.findAllByIdInAndTenantId(List.of(shadowId), TENANT_ID)).thenReturn(List.of(shadow(shadowId, resourceId)));
        when(applicationClient.getApplicationNames(TENANT_ID, List.of(resourceId))).thenReturn(Map.of(resourceId, "Finance App"));
        when(roleEntitlementClosureRepository.findByTenantIdAndRoleIdInAndEntitlementIdIn(
                eq(TENANT_ID), anyCollection(), anyCollection())).thenReturn(List.of(directClosure, inheritedClosure));
        when(accessRoleRepository.findByIdIn(anyList())).thenReturn(List.of(
                role(parentRoleId, "Finance Manager"),
                role(childRoleId, "Finance Analyst")));

        Page<IdentityEntitlementViewDto> result = service.getEntitlementsByIdentityId(identityId, TENANT_ID, null, PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(3);
        IdentityEntitlementViewDto imported = result.getContent().get(0);
        IdentityEntitlementViewDto roleDirect = result.getContent().get(1);
        IdentityEntitlementViewDto inherited = result.getContent().get(2);

        assertThat(imported.accessPathType()).isEqualTo("DIRECT_ENTITLEMENT");
        assertThat(imported.accessRoleId()).isNull();
        assertThat(imported.rolePath()).isEmpty();

        assertThat(roleDirect.accessPathType()).isEqualTo("ROLE_DIRECT");
        assertThat(roleDirect.accessRoleId()).isEqualTo(parentRoleId);
        assertThat(roleDirect.accessRoleName()).isEqualTo("Finance Manager");
        assertThat(roleDirect.sourceRoleId()).isEqualTo(parentRoleId);
        assertThat(roleDirect.roleEntitlementDirect()).isTrue();
        assertThat(roleDirect.roleEntitlementDepth()).isZero();
        assertThat(roleDirect.rolePath()).extracting("roleName").containsExactly("Finance Manager");

        assertThat(inherited.accessPathType()).isEqualTo("ROLE_INHERITED_CHILD");
        assertThat(inherited.accessRoleId()).isEqualTo(parentRoleId);
        assertThat(inherited.accessRoleName()).isEqualTo("Finance Manager");
        assertThat(inherited.sourceRoleId()).isEqualTo(childRoleId);
        assertThat(inherited.sourceRoleName()).isEqualTo("Finance Analyst");
        assertThat(inherited.roleEntitlementDirect()).isFalse();
        assertThat(inherited.roleEntitlementDepth()).isEqualTo(1);
        assertThat(inherited.rolePath()).extracting("roleName").containsExactly("Finance Manager", "Finance Analyst");
    }

    private EntitlementAssignment assignment(UUID shadowId, UUID entitlementId, UUID resourceId, String source, UUID accessRoleId) {
        EntitlementAssignment assignment = new EntitlementAssignment();
        assignment.setId(UUID.randomUUID());
        assignment.setTenantId(TENANT_ID);
        assignment.setShadowId(shadowId);
        assignment.setEntitlementId(entitlementId);
        assignment.setResourceId(resourceId);
        assignment.setSource(source);
        assignment.setAccessRoleId(accessRoleId);
        assignment.setAssignedAt(100L);
        assignment.setUpdatedAt(200L);
        return assignment;
    }

    private Entitlement entitlement(UUID entitlementId, UUID resourceId, String displayName) {
        Entitlement entitlement = new Entitlement();
        entitlement.setId(entitlementId);
        entitlement.setTenantId(TENANT_ID);
        entitlement.setResourceId(resourceId);
        entitlement.setDisplayName(displayName);
        entitlement.setDescription(displayName + " description");
        entitlement.setKind("group");
        entitlement.setObjectClass("__GROUP__");
        entitlement.setSourceUid("src-" + entitlementId);
        return entitlement;
    }

    private Shadow shadow(UUID shadowId, UUID resourceId) {
        Shadow shadow = new Shadow();
        shadow.setId(shadowId);
        shadow.setTenantId(TENANT_ID);
        shadow.setResourceId(resourceId.toString());
        shadow.setResourceUid("account-1");
        return shadow;
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

    private AccessRole role(UUID roleId, String name) {
        AccessRole role = new AccessRole();
        role.setId(roleId);
        role.setTenantId(TENANT_ID);
        role.setName(name);
        role.setType("business");
        role.setStatus("active");
        return role;
    }
}


