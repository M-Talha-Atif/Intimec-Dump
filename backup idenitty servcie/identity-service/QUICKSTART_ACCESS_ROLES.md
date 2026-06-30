# Access Roles Management - Quick Start Guide

## 🚀 Quick Start

### 1. Module Location
```
com.aidentx.iam.access_roles_management
```

### 2. Main Components

#### Entities
- `AccessRole` - Main role entity
- `AccessRoleEntitlement` - Role-entitlement link
- `AccessRoleComposition` - Parent-child role link

#### Services
- `AccessRoleService` - Role lifecycle (CRUD)
- `AccessRoleEntitlementService` - Entitlement management
- `AccessRoleCompositionService` - Role hierarchy management

#### Controller
- `AccessRoleController` - REST endpoints at `/api/v1/access-roles`

#### Key Classes
- `AccessRoleMapper` - MapStruct mapper for DTOs
- `AccessRoleCompositionValidator` - Cycle detection utility
- `AccessRoleConstants`, `AccessRoleEntitlementConstants`, `AccessRoleCompositionConstants` - Constants

### 3. REST Endpoints Cheat Sheet

```bash
# Create role
curl -X POST http://localhost:8080/api/v1/access-roles \
  -H "X-Tenant-Id: tenant-123" \
  -H "Content-Type: application/json" \
  -d '{"name":"Finance Manager","type":"business"}'

# List roles
curl -X GET "http://localhost:8080/api/v1/access-roles?page=0&size=20" \
  -H "X-Tenant-Id: tenant-123"

# Get role detail
curl -X GET http://localhost:8080/api/v1/access-roles/{roleId} \
  -H "X-Tenant-Id: tenant-123"

# Update role
curl -X PUT http://localhost:8080/api/v1/access-roles/{roleId} \
  -H "X-Tenant-Id: tenant-123" \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'

# Delete role
curl -X DELETE http://localhost:8080/api/v1/access-roles/{roleId} \
  -H "X-Tenant-Id: tenant-123"

# Add entitlements
curl -X POST http://localhost:8080/api/v1/access-roles/{roleId}/entitlements \
  -H "X-Tenant-Id: tenant-123" \
  -H "Content-Type: application/json" \
  -d '{"entitlementIds":["uuid1","uuid2"]}'

# Remove entitlements
curl -X DELETE http://localhost:8080/api/v1/access-roles/{roleId}/entitlements \
  -H "X-Tenant-Id: tenant-123" \
  -H "Content-Type: application/json" \
  -d '{"entitlementIds":["uuid1"]}'

# Add child roles
curl -X POST http://localhost:8080/api/v1/access-roles/{roleId}/children \
  -H "X-Tenant-Id: tenant-123" \
  -H "Content-Type: application/json" \
  -d '{"childRoleIds":["child-uuid1","child-uuid2"]}'

# Remove child roles
curl -X DELETE http://localhost:8080/api/v1/access-roles/{roleId}/children \
  -H "X-Tenant-Id: tenant-123" \
  -H "Content-Type: application/json" \
  -d '{"childRoleIds":["child-uuid1"]}'

# Get child roles
curl -X GET http://localhost:8080/api/v1/access-roles/{roleId}/children \
  -H "X-Tenant-Id: tenant-123"
```

### 4. Database Tables

The module expects these three tables:
1. `access_roles` - Main role definitions
2. `access_role_entitlements` - Role-entitlement links
3. `access_role_compositions` - Parent-child role links

### 5. Key Features

| Feature | Implementation |
|---------|-----------------|
| Multi-tenancy | ✅ Tenant ID filtering on all queries |
| No Enums | ✅ All categories as VARCHAR strings |
| Cycle Detection | ✅ BFS-based prevention in role hierarchy |
| Duplicate Prevention | ✅ Unique constraints + app-level checks |
| Cascading Deletes | ✅ Removes all linked data on role delete |
| Audit Timestamps | ✅ created_at, updated_at on all entities |
| Transactional Safety | ✅ @Transactional on all write operations |

### 6. Data Validation

#### Required Fields
- Role name (unique per tenant)
- Role type (business, technical, functional, application)

#### Optional Fields
- Description, display name
- Risk level (low, medium, high, critical)
- Classification (Confidential, Internal, etc.)
- Business unit
- Owner ID
- Certification schedule
- Requestable flag
- Require approval flag

#### Automatic Validation
- No circular role hierarchies
- No self-references
- No duplicate entitlement links
- No duplicate role compositions

### 7. Error Messages

| Scenario | Status | Message |
|----------|--------|---------|
| Duplicate name | 400 | Role with name already exists |
| Circular hierarchy | 400 | Cannot add child role: circular dependency |
| Self-reference | 400 | Role cannot be a child of itself |
| Not found | 404 | Role not found with id |
| Role exists | 400 | Entitlement already linked to role |

### 8. Service Layer Usage Example

```java
@RestController
public class MyController {
    
    @Autowired
    private AccessRoleService roleService;
    
    @PostMapping("/my-endpoint")
    public void createRoleWithChildren() {
        CreateAccessRoleRequest request = new CreateAccessRoleRequest();
        request.setName("New Role");
        request.setType("technical");
        request.setEntitlementIds(List.of(uuid1, uuid2));
        request.setChildRoleIds(List.of(childUuid1));
        
        AccessRoleResponse response = roleService.createRole("tenant-123", request);
        // response contains created role
    }
    
    @GetMapping("/my-endpoint/{roleId}")
    public void getRoleDetail() {
        AccessRoleDetailResponse detail = roleService.getRoleDetail("tenant-123", roleId);
        // detail contains role + entitlementIds + childRoles + parentRoles
    }
}
```

### 9. Constants Usage

```java
// All constants in dedicated files
import com.aidentx.iam.access_roles_management.config.constants.*;

// Role constants
String endpoint = AccessRoleConstants.BASE_PATH; // /api/v1/access-roles
String errorMsg = String.format(AccessRoleConstants.ERROR_ROLE_NOT_FOUND, roleId);

// Entitlement constants
String entLog = AccessRoleEntitlementConstants.LOG_ENTITLEMENT_LINKED;

// Composition constants
String compLog = AccessRoleCompositionConstants.LOG_CHILD_ADDED;
```

### 10. Mapper Usage

```java
@Autowired
private AccessRoleMapper mapper;

// Entity to DTO
AccessRoleResponse dto = mapper.entityToResponse(entity);

// Request to Entity
AccessRole entity = mapper.createRequestToEntity(request);

// Update Entity from Request
mapper.updateEntityFromRequest(updateRequest, entity);
```

### 11. Common Workflows

#### Workflow 1: Create Business Role with Child Roles
```
1. Create AccessRole (type=business, status=draft)
2. Add technical roles as children
3. Add entitlements to children
4. Move business role to active status
```

#### Workflow 2: Request Role
```
1. Check role.requestable = true
2. If role.requireApproval = true, trigger approval workflow
3. Upon approval, assign role to user
4. Assign all linked entitlements transitively
```

#### Workflow 3: Certification Cycle
```
1. Get all roles with certification_schedule = QUARTERLY
2. List assigned users
3. Request re-certification from owners
4. Update role metadata or archive stale roles
```

### 12. Important Notes

- ✅ All operations are tenant-aware (X-Tenant-Id header required)
- ✅ No enums means new role types/statuses can be added without code changes
- ✅ Cycle detection prevents data corruption in hierarchy
- ✅ Cascading deletes ensure referential integrity
- ✅ All timestamps in UTC (Instant type)
- ⚠️ Unique constraint on (tenant_id, name) - role names are unique per tenant, not globally
- ⚠️ Entitlements are external IDs - this module doesn't create entitlements
- ⚠️ Owner ID points to Identity entities - role owner is an identity user

### 13. Performance Considerations

- Indexed queries: tenant_id, type, status, owner_id
- Use pagination: `/api/v1/access-roles?page=0&size=50`
- Cycle detection uses BFS (efficient even for large hierarchies)
- Unique constraints prevent duplicate entitlements/compositions

### 14. Testing

Test these scenarios:
```java
✓ Create role with name that already exists (should fail)
✓ Add circular role hierarchy (should fail)
✓ Add self as child (should fail)
✓ Add same entitlement twice (should skip duplicate)
✓ Get role detail with complex hierarchy
✓ Delete role with linked entitlements/children
✓ List roles with filters (type, status, owner)
✓ Update role status workflow
```

### 15. Integration Checklist

- [ ] Add module to Spring component scan
- [ ] Create database migration SQL
- [ ] Add transaction manager configuration
- [ ] Add request/response logging
- [ ] Add security/authorization checks
- [ ] Add global exception handler
- [ ] Add Swagger/OpenAPI documentation
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Deploy and verify

---

## 📞 Support

For issues or questions:
1. Check JavaDoc comments in source files
2. Review error messages and error constants
3. Check README_ACCESS_ROLES_MANAGEMENT.md for detailed docs
4. Check IMPLEMENTATION_SUMMARY_ACCESS_ROLES.md for architecture

