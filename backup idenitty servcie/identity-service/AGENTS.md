# AGENTS.md

## Overview
This document provides essential knowledge for AI coding agents to be productive in the `identity-service` codebase. It highlights the architecture, workflows, conventions, and integration points specific to this project.

---

## Big Picture Architecture

### Core Modules
- **Access Roles Management**: Handles role-based access control (RBAC) within the Identity Governance and Administration (IGA) system.
  - Key entities: `AccessRole`, `AccessRoleEntitlement`, `AccessRoleComposition`.
  - REST API endpoints for CRUD operations, entitlement management, and role hierarchy.

### Multi-Tenancy
- All operations are tenant-aware, filtered by `tenant_id`.
- Unique constraints ensure data isolation (e.g., `tenant_id + name`).

### Data Flow
- **Entities**: Represent database tables (e.g., `AccessRole`).
- **DTOs**: Facilitate data transfer between layers.
- **Services**: Implement business logic.
- **Repositories**: Handle database interactions.
- **Controllers**: Expose REST endpoints.

---

## Developer Workflows

### Build and Run
- **Build**: `mvn clean install`
- **Run**: `java -jar target/identity-service-1.0.0.jar`
- **Development**: Use `application-dev.properties` for local configurations.

### Testing
- **Unit Tests**: Located under `src/test/java`.
- **Run Tests**: `mvn test`

### Debugging
- Enable debug logs by modifying `log4j2.json`.
- Use `X-Tenant-Id` header for tenant-specific debugging.

---

## Project-Specific Conventions

### DTO Mapping
- Use `AccessRoleMapper` (MapStruct) for entity-to-DTO conversions.
- Partial updates are handled with `NullValuePropertyMappingStrategy.IGNORE`.

### Cycle Detection
- Role hierarchy validations use BFS-based cycle detection (`AccessRoleCompositionValidator`).

### Constants
- Organized into `AccessRoleConstants`, `AccessRoleEntitlementConstants`, and `AccessRoleCompositionConstants`.

---

## Integration Points

### Dependencies
- **Spring Boot Data JPA**: ORM and database interactions.
- **MapStruct**: DTO mapping.
- **Hibernate Validator**: Input validation.

### External Communication
- REST APIs exposed under `/api/v1/access-roles`.
- Example endpoints:
  - `POST /api/v1/access-roles`: Create a new role.
  - `GET /api/v1/access-roles/{roleId}`: Retrieve role details.

---

## Key Files and Directories

### Source Code
- `src/main/java/com/aidentx/iam/`
  - `controller/`: REST controllers.
  - `service/`: Business logic.
  - `repository/`: Database access.
  - `model/`: Entities and DTOs.
  - `util/`: Utility classes (e.g., validators).

### Configuration
- `src/main/resources/`
  - `application.properties`: Default configurations.
  - `log4j2.json`: Logging configurations.

---

## Examples

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

---

## Error Handling
- Duplicate role names are rejected per tenant.
- Circular dependencies in role hierarchy are prevented.
- Descriptive error messages are provided for all operations.
