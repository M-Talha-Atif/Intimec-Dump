# Entitlement Classification KPI API - Design Documentation

## Overview
The Classification KPI API provides metrics for tracking entitlement governance and classification status within a tenant. It helps identify governance gaps and compliance risks related to entitlement ownership and requestability.

## Architecture

### Components Created

#### 1. **Constants File** - `EntitlementClassificationKpiConstants.java`
Central place for all hardcoded values, messages, and configuration:
- **Header Constants**: `X-Tenant-ID` header name
- **Logger Module**: `CLASSIFICATION_KPI`
- **Numeric Constants**: Precision settings and defaults (0, 0.0)
- **Log Messages**: INFO, DEBUG, and ERROR level messages
- **Validation Messages**: Tenant ID validation errors
- **Response Field Names**: Maps to JSON response structure
- **KPI Descriptions**: Documentation for each metric

#### 2. **Response DTO** - `EntitlementClassificationKpiResponse.java`
Encapsulates the classification KPI metrics:
```java
{
  "tenantId": "tenant-123",
  "ownershipGaps": 15,           // Real: count of entitlements without owners
  "unclassified": 0,             // Mock: count of unclassified entitlements
  "requestabilityRate": 0.0,     // Mock: percentage of requestable entitlements
  "requestableEntitlements": 42, // Real: count of requestable entitlements
  "timestamp": 1704067200000
}
```

#### 3. **Service Interface** - `EntitlementClassificationKpiService.java`
Defines the contract for classification KPI calculation:
```java
public interface EntitlementClassificationKpiService {
    EntitlementClassificationKpiResponse getClassificationKpis(String tenantId);
}
```

#### 4. **Service Implementation** - `EntitlementClassificationKpiServiceImpl.java`
Implements the business logic:
- Validates tenant ID
- Calculates ownership gaps (real)
- Returns unclassified count (mock - 0)
- Returns requestability rate (mock - 0.0)
- Calculates requestable entitlements count (real)
- Comprehensive logging at each step
- Read-only transactions for consistency

#### 5. **Repository Methods** - Added to `EntitlementRepository.java`
Two new query methods for classification KPI calculations:

```java
/**
 * Count entitlements without an owner (null ownerId) for a tenant.
 * These are classified as ownership gaps - governance risk.
 */
@Query("SELECT COUNT(e) FROM Entitlement e WHERE e.tenantId = :tenantId AND e.ownerId IS NULL")
long countEntitlementsWithoutOwner(@Param("tenantId") String tenantId);

/**
 * Count entitlements marked as requestable for a tenant.
 * Requestable entitlements can be self-service requested by users.
 */
@Query("SELECT COUNT(e) FROM Entitlement e WHERE e.tenantId = :tenantId AND e.requestable = true")
long countRequestableEntitlements(@Param("tenantId") String tenantId);
```

#### 6. **Controller Endpoint** - Updated `EntitlementAnalyticsController.java`
New REST endpoint for classification KPIs:
```
GET /api/v1/entitlements/analytics/classification-kpi
Header: X-Tenant-ID (required)
```

---

## KPI Definitions

### 1. **Ownership Gaps** ✅ REAL
**Purpose**: Identify entitlements without assigned owners

**Definition**: Count of entitlements where `ownerId = NULL`

**Risk Indicator**: 🔴 HIGH - Orphaned entitlements represent a critical governance gap
- No owner to certify access
- No responsible party for access reviews
- Compliance violation risk

**Business Logic**:
```java
SELECT COUNT(e) FROM Entitlement e 
WHERE e.tenantId = :tenantId 
AND e.ownerId IS NULL
```

**Action Items**:
1. Immediately identify these entitlements
2. Assign appropriate owners
3. Conduct access review with owner
4. Document owner assignment rationale

---

### 2. **Unclassified** ⏱️ MOCK (Returns 0)
**Purpose**: Track entitlements lacking classification labels

**Definition**: Count of entitlements with no classification tags

**Why Mock**:
- Classification field structure is complex (JSON array)
- Requires deep understanding of business classification scheme
- Currently not a priority governance metric
- Placeholder for future implementation

**Mock Logic**:
```java
response.setUnclassified(0); // Mock return
```

**Future Enhancement**:
```sql
SELECT COUNT(*) FROM entitlements 
WHERE tenant_id = :tenantId 
AND (classification IS NULL OR classification = '[]'::jsonb)
```

---

### 3. **Requestability Rate** ⏱️ MOCK (Returns 0.0%)
**Purpose**: Track percentage of entitlements available via self-service

**Definition**: Percentage of entitlements marked as `requestable = true`

**Why Mock**:
- Requires percentage calculation
- Needs context on what percentage is "healthy"
- Currently not measurable without business requirements
- Placeholder for future implementation

**Mock Logic**:
```java
response.setRequestabilityRate(0.0); // Mock return
```

**Future Enhancement**:
```java
long requestableCount = countRequestableEntitlements(tenantId);
long totalCount = countByTenantId(tenantId);
double rate = (requestableCount * 100.0) / totalCount;
response.setRequestabilityRate(rate);
```

---

### 4. **Requestable Entitlements** ✅ REAL
**Purpose**: Track how many entitlements users can request via self-service

**Definition**: Count of entitlements marked with `requestable = true`

**Risk Indicator**: 🟡 MEDIUM
- Higher = more self-service capability (good for user experience)
- Lower = fewer self-service options (may increase provisioning load)

**Business Logic**:
```java
SELECT COUNT(e) FROM Entitlement e 
WHERE e.tenantId = :tenantId 
AND e.requestable = true
```

**Action Items**:
1. Monitor requestable entitlements trend
2. Encourage marking appropriate entitlements as requestable
3. Reduce provisioning request backlog by enabling self-service

---

## API Endpoint Details

### Request
```http
GET /api/v1/entitlements/analytics/classification-kpi
X-Tenant-ID: tenant-123
```

### Success Response (200 OK)
```json
{
  "tenantId": "tenant-123",
  "ownershipGaps": 15,
  "unclassified": 0,
  "requestabilityRate": 0.0,
  "requestableEntitlements": 42,
  "timestamp": 1704067200000
}
```

### Error Response (400 Bad Request)
```
Invalid Classification KPI request parameters: Tenant ID cannot be null or blank
```

### Error Response (500 Internal Server Error)
```
Error calculating classification KPIs: Database connection timeout
```

---

## Data Flow

```
1. Client Request
   ↓
   GET /api/v1/entitlements/analytics/classification-kpi
   Header: X-Tenant-ID = "tenant-123"
   ↓

2. Controller Processing
   ↓
   EntitlementAnalyticsController.getClassificationKpis(tenantId)
   - Validates X-Tenant-ID header presence
   - Logs request details
   ↓

3. Service Execution
   ↓
   EntitlementClassificationKpiService.getClassificationKpis(tenantId)
   - Validates tenant ID (not null/blank)
   - Creates response object with tenantId + timestamp
   ↓

4. KPI Calculation
   ↓
   a) Ownership Gaps (REAL)
      → entitlementRepository.countEntitlementsWithoutOwner(tenantId)
      → Query: COUNT WHERE ownerId IS NULL
   
   b) Unclassified (MOCK)
      → response.setUnclassified(0)
   
   c) Requestability Rate (MOCK)
      → response.setRequestabilityRate(0.0)
   
   d) Requestable Entitlements (REAL)
      → entitlementRepository.countRequestableEntitlements(tenantId)
      → Query: COUNT WHERE requestable = true
   ↓

5. Response Construction
   ↓
   EntitlementClassificationKpiResponse
   - tenantId: from request
   - ownershipGaps: from repository query
   - unclassified: 0 (mock)
   - requestabilityRate: 0.0 (mock)
   - requestableEntitlements: from repository query
   - timestamp: System.currentTimeMillis()
   ↓

6. Client Response
   ↓
   HTTP 200 OK
   Content-Type: application/json
   {
     "tenantId": "tenant-123",
     "ownershipGaps": 15,
     "unclassified": 0,
     "requestabilityRate": 0.0,
     "requestableEntitlements": 42,
     "timestamp": 1704067200000
   }
```

---

## Logging Strategy

### INFO Level
- Request received: "Fetching entitlement classification KPIs for tenantId: {}"
- Calculation success: "Successfully calculated classification KPIs: ownershipGaps={}, unclassified={}, requestabilityRate={}, requestableEntitlements={}"
- Response ready: "Successfully returned classification KPIs"

### DEBUG Level
- Ownership gap calculation: "Calculating entitlements without owners for tenantId: {}"
- Requestable calculation: "Calculating requestable entitlements count for tenantId: {}"

### ERROR Level
- Validation error: "Invalid classification KPI request parameters: {}"
- Calculation error: "Error calculating classification KPIs: {}"

---

## Thread Safety & Performance

### Transaction Management
- `@Transactional(readOnly = true)` ensures:
  - Read-only consistency (no dirty reads)
  - Optimized query execution
  - Connection pooling efficiency
  - No lock contention

### Database Indexes (Recommended)
```sql
CREATE INDEX idx_entitlement_tenant_owner 
ON entitlements(tenant_id, owner_id);

CREATE INDEX idx_entitlement_tenant_requestable 
ON entitlements(tenant_id, requestable);
```

### Query Performance
| Query | Complexity | Expected Result |
|-------|-----------|-----------------|
| countEntitlementsWithoutOwner | O(n) | Fast on indexed tenant_id + owner_id |
| countRequestableEntitlements | O(n) | Fast on indexed tenant_id + requestable |

---

## Integration with Controller

The controller now manages 4 analytics endpoints with a single common controller:

1. **Intelligence Tab KPIs** → `/intelligence-kpi`
   - General entitlement health metrics
   
2. **Application Count** → `/application-count`
   - Entitlements per application
   
3. **Sprawl KPIs** → `/sprawl-kpi`
   - Entitlement sprawl metrics
   
4. **Classification KPIs** → `/classification-kpi` ← NEW
   - Entitlement classification & governance metrics

---

## Testing Checklist

- [ ] Test with valid tenant ID → Returns correct metrics
- [ ] Test with null tenant ID → Returns 400 Bad Request
- [ ] Test with blank tenant ID → Returns 400 Bad Request
- [ ] Test with tenant having no entitlements → Returns 0 for all metrics
- [ ] Test with tenant having orphaned entitlements → Returns correct count
- [ ] Test with tenant having requestable entitlements → Returns correct count
- [ ] Test response timestamps are current
- [ ] Test response JSON structure matches specification
- [ ] Test concurrent requests → No race conditions
- [ ] Test database connection failure → Returns 500 Internal Server Error

---

## Usage Examples

### Example 1: Dashboard Widget
```bash
curl -X GET http://localhost:8080/api/v1/entitlements/analytics/classification-kpi \
  -H "X-Tenant-ID: tenant-acme-corp"
```

Response:
```json
{
  "tenantId": "tenant-acme-corp",
  "ownershipGaps": 23,
  "unclassified": 0,
  "requestabilityRate": 0.0,
  "requestableEntitlements": 156,
  "timestamp": 1704067200000
}
```

### Example 2: Governance Alert Logic
```java
EntitlementClassificationKpiResponse kpi = analyticsService.getClassificationKpis(tenantId);

// Alert if too many orphaned entitlements
if (kpi.getOwnershipGaps() > 20) {
    alertService.sendAlert(
        "CRITICAL: " + kpi.getOwnershipGaps() + " orphaned entitlements detected. " +
        "Immediate action required to assign owners."
    );
}

// Monitor requestable entitlements
if (kpi.getRequestableEntitlements() > previousWeekValue) {
    logger.info("Positive trend: More entitlements are now available for self-service");
}
```

### Example 3: Compliance Report
```java
EntitlementClassificationKpiResponse kpi = analyticsService.getClassificationKpis(tenantId);

report.addSection("Entitlement Governance Status", 
    "Total Entitlements with Owners: " + (totalEntitlements - kpi.getOwnershipGaps()) + 
    "\nEntitlements Without Owners: " + kpi.getOwnershipGaps() +
    "\nRequestable Entitlements: " + kpi.getRequestableEntitlements()
);
```

---

## Future Enhancements

1. **Trend Analysis**
   - Track KPI changes over time
   - Alert on sudden spikes in ownership gaps
   
2. **Requestability Rate Calculation**
   - Implement percentage calculation
   - Define healthy percentage thresholds
   
3. **Unclassified Entitlements**
   - Implement complex classification checking
   - Support multiple classification schemes
   
4. **Predictive Analytics**
   - Forecast ownership gaps growth
   - Recommend entitlements for self-service

5. **Advanced Filtering**
   - Filter by risk level, lifecycle, application
   - Time-range based analytics

---

## Configuration

No additional configuration required. Uses existing:
- Spring Data JPA for database access
- Unified logging service for logging
- Multi-tenant support via tenant ID

