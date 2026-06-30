# Access Roles Management Module - Complete Implementation

## Overview
The `access_roles_management` module provides comprehensive REST and service-layer operations for managing access roles in the Identity Governance and Administration (IGA) system.

## Architecture

### Entities (JPA)
- **AccessRole**: Main entity representing a governed access role
  - Contains role metadata: name, type, status, risk level, classification
  - Supports multi-tenancy via tenant_id
  - Hierarchical relationships with other roles via AccessRoleComposition
  - Links to entitlements via AccessRoleEntitlement

- **AccessRoleEntitlement**: Join entity for many-to-many role-entitlement relationship
  - Stores roleId and entitlementId pairs
  - Prevents duplicates with unique constraint

- **AccessRoleComposition**: Join entity for parent-child role hierarchy
  - Enables role nesting (e.g., business role containing technical roles)
  - Supports role tree visualization on frontend
  - Includes cycle detection to prevent circular dependencies

### Data Transfer Objects (DTOs)

#### Request DTOs
- **CreateAccessRoleRequest**: For creating new roles
  - Includes initial entitlementIds and childRoleIds
  - Validates required fields (name, type)

- **UpdateAccessRoleRequest**: For partial updates
  - All fields optional (only non-null fields are applied)

- **ManageRoleEntitlementsRequest**: For adding/removing entitlements

- **ManageRoleCompositionsRequest**: For managing parent-child relationships

#### Response DTOs
- **AccessRoleResponse**: Basic role information
  - Contains all role attributes and timestamps

- **AccessRoleDetailResponse**: Extended response with related data
  - Includes entitlementIds, childRoles, and parentRoles lists

### Repositories (Spring Data JPA)
- **AccessRoleRepository**: CRUD and filtered queries for AccessRole
  - Supports filtering by tenant, type, status, and owner
  - Unique constraint on tenant+name

- **AccessRoleEntitlementRepository**: Manages role-entitlement links
  - Duplicate prevention via existsByRoleIdAndEntitlementId()

- **AccessRoleCompositionRepository**: Manages role hierarchy
  - Cycle detection via wouldCreateCycle() utility

### Services

#### Service Interfaces
1. **AccessRoleService**: Role lifecycle management
2. **AccessRoleEntitlementService**: Entitlement link management
3. **AccessRoleCompositionService**: Hierarchy management

#### Service Implementations
- **AccessRoleServiceImpl**: 
  - Create, read, update, delete roles
  - Cascading deletions of related links
  - Delegates entitlement/composition ops to respective services

- **AccessRoleEntitlementServiceImpl**: 
  - Add/remove entitlements with duplicate detection
  - Retrieve entitlement IDs for a role

- **AccessRoleCompositionServiceImpl**: 
  - Add/remove child roles with cycle detection
  - Retrieve child and parent roles

### Utilities
- **AccessRoleCompositionValidator**: 
  - Implements BFS-based cycle detection
  - Prevents circular dependencies in role hierarchy

### Mapper
- **AccessRoleMapper** (MapStruct):
  - Converts between entities and DTOs
  - Handles partial updates via NullValuePropertyMappingStrategy.IGNORE

### Constants
Three constants files for organized constant management:
- **AccessRoleConstants**: General role operations, error messages, logging
- **AccessRoleEntitlementConstants**: Entitlement-specific operations
- **AccessRoleCompositionConstants**: Composition-specific operations

### Controller
- **AccessRoleController**: REST endpoint handler
  - Base path: `/api/v1/access-roles`
  - Supports CRUD operations on roles
  - Separate endpoints for managing entitlements and compositions
  - Tenant-aware via X-Tenant-Id header
  - Returns appropriate HTTP status codes

## API Endpoints

### Role Management
```
POST   /api/v1/access-roles                    - Create role
GET    /api/v1/access-roles                    - List roles (with optional filters)
GET    /api/v1/access-roles/{roleId}           - Get role detail
PUT    /api/v1/access-roles/{roleId}           - Update role
DELETE /api/v1/access-roles/{roleId}           - Delete role
```

### Entitlement Management
```
POST   /api/v1/access-roles/{roleId}/entitlements     - Add entitlements
DELETE /api/v1/access-roles/{roleId}/entitlements     - Remove entitlements
GET    /api/v1/access-roles/{roleId}/entitlements     - Get entitlements
```

### Composition Management
```
POST   /api/v1/access-roles/{roleId}/children        - Add child roles
DELETE /api/v1/access-roles/{roleId}/children        - Remove child roles
GET    /api/v1/access-roles/{roleId}/children        - Get child roles
```

## Key Features

### Multi-Tenancy
- All operations filtered by tenant_id
- Unique constraint on tenant+name

### Flexible Categorization
- All categorical fields (type, status, riskLevel, classification) stored as VARCHAR
- No enums - allows tenant-driven extensibility without code changes

### Cycle Detection
- BFS-based validation prevents circular dependencies
- Self-reference prevention

### Duplicate Prevention
- Unique constraints at database level
- Additional application-level checks

### Transactional Integrity
- Read-only transactions for queries
- Transactional cascading for bulk operations

### Comprehensive Logging
- Debug logs for individual operations
- Info logs for batch operations

## Dependencies
- Spring Boot Data JPA
- MapStruct (DTO mapping)
- Jakarta Persistence API
- Hibernate Validator

## File Structure
```
access_roles_management/
├── config/
│   └── constants/
│       ├── AccessRoleConstants.java
│       ├── AccessRoleEntitlementConstants.java
│       └── AccessRoleCompositionConstants.java
├── controller/
│   └── AccessRoleController.java
├── mapper/
│   └── AccessRoleMapper.java
├── model/
│   ├── dto/
│   │   ├── request/
│   │   │   ├── CreateAccessRoleRequest.java
│   │   │   ├── UpdateAccessRoleRequest.java
│   │   │   ├── ManageRoleEntitlementsRequest.java
│   │   │   └── ManageRoleCompositionsRequest.java
│   │   └── response/
│   │       ├── AccessRoleResponse.java
│   │       └── AccessRoleDetailResponse.java
│   └── entity/
│       ├── AccessRole.java
│       ├── AccessRoleEntitlement.java
│       └── AccessRoleComposition.java
├── repository/
│   ├── AccessRoleRepository.java
│   ├── AccessRoleEntitlementRepository.java
│   └── AccessRoleCompositionRepository.java
├── service/
│   ├── AccessRoleService.java
│   ├── AccessRoleEntitlementService.java
│   ├── AccessRoleCompositionService.java
│   └── impl/
│       ├── AccessRoleServiceImpl.java
│       ├── AccessRoleEntitlementServiceImpl.java
│       └── AccessRoleCompositionServiceImpl.java
└── util/
    └── AccessRoleCompositionValidator.java
```

## Usage Example

### Creating a Role
```json
POST /api/v1/access-roles
Header: X-Tenant-Id: tenant-123

{
  "name": "Finance Manager",
  "type": "business",
  "description": "Access for finance management",
  "riskLevel": "medium",
  "requestable": true,
  "requireApproval": true,
  "entitlementIds": ["uuid1", "uuid2"],
  "childRoleIds": ["uuid3", "uuid4"]
}
```

### Retrieving Role Details
```
GET /api/v1/access-roles/{roleId}
Header: X-Tenant-Id: tenant-123
```

Returns full role detail including linked entitlements and child/parent roles.

## Error Handling
- Duplicate role names rejected per tenant
- Circular dependencies prevented in role hierarchy
- Self-reference validation
- EntityNotFoundException for missing resources
- All operations provide descriptive error messages

