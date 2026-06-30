# Entitlements in IGA - Complete Guide

## 📋 Table of Contents
1. [What are Entitlements?](#what-are-entitlements)
2. [Role in IGA](#role-in-iga)
3. [Real-World Examples](#real-world-examples)
4. [Entitlement Operations](#entitlement-operations)
5. [Entitlement Analytics API](#entitlement-analytics-api)

---

## What are Entitlements?

**Entitlements** are **fine-grained units of access** - they represent what users can do on a system.

### Core Concept
```
Entitlement = A specific permission/role/group on a target system

Examples:
- Active Directory Group: "Finance_ReadOnly"
- Salesforce Permission Set: "Admin", "ReadOnly"  
- SAP Role: "Z_FINANCE_VIEWER"
- Database Role: "SELECT_USERS_TABLE"
- Azure AD Group: "Sales_Team"
```

---

## Role in IGA

In Identity Governance & Administration, entitlements form the cornerstone of access control:

### The "Who Has What" Model
```
┌─────────────────────────────────────────────────────┐
│  ENTITLEMENTS = WHAT (The Permissions)              │
│  Examples: Finance_RO, Admin, Editor roles          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  ENTITLEMENT ASSIGNMENTS = THE LINK                 │
│  "User john.doe HAS Finance_RO"                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  IDENTITIES/ACCOUNTS = WHO (The Users)              │
│  Examples: john.doe, jane.smith                     │
└─────────────────────────────────────────────────────┘
```

### Key Responsibilities in IGA

1. **Access Governance**
   - Catalog all available permissions in target systems
   - Ensure users only have appropriate entitlements
   - Detect excessive access (segregation of duties violations)

2. **Compliance & Risk Management**
   - Classify entitlements by risk level (High, Medium, Low)
   - Mark entitlements requiring approval before assignment
   - Track who has high-risk entitlements
   - Identify orphaned entitlements (no owner)

3. **Access Reviews & Certification**
   - Managers review who has what entitlements
   - Certify access is still needed
   - Request removal of excessive permissions

4. **Provisioning & Deprovisioning**
   - Automatically grant birthright entitlements during onboarding
   - Process access requests for additional entitlements
   - Revoke entitlements during offboarding

---

## Real-World Examples

### Example 1: Active Directory Finance Group

**Scenario**: Your company uses Active Directory. The Finance department has a group "Finance_Managers".

```
ENTITLEMENT CATALOG (Discovered from AD):
├── Entitlement ID: 550e8400-e29b-41d4-a716-446655440000
├── Name: Finance_Managers
├── Resource: Active Directory (192.168.1.100)
├── Lifecycle: Active ✓
├── Owner: CFO (jane.smith)
├── Risk Level: HIGH (access to financial data)
├── Requires Approval: YES
└── Classified As: ["SOX", "PII", "FinancialData"]

ASSIGNMENTS (Who has this group):
├── john.doe@company.com → Finance_Managers (since 2023-01-15)
├── alice.johnson@company.com → Finance_Managers (since 2023-02-20)
└── bob.wilson@company.com → Finance_Managers (since 2023-03-10)

GOVERNANCE FLOW:
1. Quarterly Access Review
2. CFO (owner) certifies: "Yes, these 3 users need this access"
3. If certification fails → Request removal from IGA
4. IGA Provisioning Engine → Removes from AD group
```

### Example 2: SaaS Application - Salesforce

**Scenario**: Salesforce Permission Sets controlling what users can do.

```
ENTITLEMENTS IN CATALOG:
├── Permission Set 1
│   ├── ID: 880e9500-e29b-41d4-a716-446655440111
│   ├── Name: Sales_Manager
│   ├── Description: Can view all leads, create opportunities
│   ├── Lifecycle: Active
│   ├── Risk Level: MEDIUM
│   └── Assigned To: 45 sales managers
│
├── Permission Set 2
│   ├── ID: 990e9600-e29b-41d4-a716-446655440222
│   ├── Name: Sales_Admin
│   ├── Description: Full administrative access to Salesforce
│   ├── Lifecycle: Active
│   ├── Risk Level: HIGH ⚠️
│   ├── Owner: VP Sales (mark.johnson)
│   ├── Requires Approval: YES
│   └── Assigned To: 2 sales admins
│
└── Permission Set 3
    ├── ID: 770e9700-e29b-41d4-a716-446655440333
    ├── Name: Sales_ReadOnly (DEPRECATED)
    ├── Lifecycle: Deprecated ⚠️ (should be removed)
    ├── Risk Level: LOW
    └── Assigned To: 3 users (should revoke)
```

### Example 3: Orphaned & Unclassified Entitlements

```
ORPHANED ENTITLEMENT (Governance Risk):
├── Entitlement: Database_Backup_Role
├── Owner: NULL (No owner assigned) ⚠️
├── Risk Level: HIGH (can delete all data)
├── Assigned To: 8 users
├── Problem: Who governs access? No one to certify during reviews!

ACTION: 
1. IGA Dashboard flags this
2. Admin assigns owner
3. Owner then certifies access

UNCLASSIFIED ENTITLEMENT (Missing Context):
├── Entitlement: Reports_Generator
├── Classification: [] (empty - no governance labels)
├── Problem: Is this SOX-compliant? PII-related? Low-risk?
├── Risk: Can't enforce proper governance without classification

ACTION:
1. Admin adds classifications: ["Reporting", "Analytics"]
2. Now proper access review workflows apply
```

---

## Entitlement Operations

### 1. Discovery (Import from Target Systems)

```
FLOW:
Connector (e.g., AD Connector)
  ↓
  └─→ Query target system for groups: [Finance_RO, Sales_Admins, ...]
      ↓
      └─→ IGA creates Entitlements in catalog
          ├── Entitlement: Finance_RO (source_uid = AD GUID)
          ├── Entitlement: Sales_Admins (source_uid = AD GUID)
          └── ...

CODE LOCATION: connector/EntitlementImporter
```

### 2. Classification & Governance

```
ADMIN CONFIGURES:
1. Set lifecycle: Active/Deprecated/Orphaned
2. Assign owner: UUID of identity responsible for this entitlement
3. Set risk level: High/Medium/Low
4. Add classifications: SOX, PII, GDPR, HighRisk, etc.
5. Set requestability: Can users request this via self-service?
6. Set approval requirement: Does granting require manager approval?

ENTITY: Entitlement (JPA Entity)
├── lifecycle: "Active"
├── ownerId: UUID of owner
├── riskLevel: "High"
├── classification: ["SOX", "PII"]
├── requestable: true
└── requireApproval: true
```

### 3. Assignment (Linking Entitlements to Accounts)

```
DISCOVERED ASSIGNMENTS (from target system):
Connector reads: "User john.doe is member of AD group Finance_RO"
  ↓
  IGA creates EntitlementAssignment:
  ├── shadowId: john.doe's account ID
  ├── entitlementId: Finance_RO entitlement ID
  ├── resourceId: Active Directory resource ID
  ├── source: "IMPORT" (discovered, not manually assigned)
  └── lastSyncRunId: sync-run-2024-01-15

MANUAL ASSIGNMENTS (via provisioning requests):
User requests: "I need Finance_RO access"
  ↓
Manager approves
  ↓
IGA creates EntitlementAssignment:
  ├── shadowId: requester's account ID
  ├── entitlementId: Finance_RO entitlement ID
  ├── source: "MANUAL" (provisioning request)
  └── lastSyncRunId: null (not yet synced back from target)
```

### 4. Reconciliation (Sync Validation)

```
PERIODIC SYNC RUN:
Connector queries AD: "Who is member of Finance_RO?"
  ↓
Result: [john.doe, alice.johnson, bob.wilson]
  ↓
IGA compares with stored EntitlementAssignments:
├── john.doe ✓ (matches DB, update lastSyncRunId)
├── alice.johnson ✓ (matches DB, update lastSyncRunId)
├── bob.wilson ✓ (matches DB, update lastSyncRunId)
└── carol.smith ✗ (in DB but NOT in AD - REVOKED from target)
    → Flag for deletion or investigate

ASSIGNMENTS WITHOUT LASTSYNCRUIDID UPDATE:
→ These were revoked on the target system
→ Can be auto-deleted from IGA or reported for review
```

### 5. Access Reviews (Certification)

```
QUARTERLY REVIEW WORKFLOW:
Owner (CFO): "Certify who should have Finance_RO"
  ↓
IGA shows:
├── john.doe - Finance_RO (Certify? YES/NO)
├── alice.johnson - Finance_RO (Certify? YES/NO)
└── bob.wilson - Finance_RO (Certify? YES/NO)

Owner clicks NO on bob.wilson
  ↓
IGA creates Deprovisioning Task
  ↓
Provisioning Engine removes from AD
  ↓
Next sync run validates removed from target
```

---

## Entitlement Analytics API

### Endpoint: POST /api/v1/entitlements/analytics/kpi

**Purpose**: Retrieve comprehensive KPI metrics for a resource's entitlements.

### Request

```json
{
  "resourceId": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "tenant-acme-corp"
}
```

### Response

```json
{
  "resourceId": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "tenant-acme-corp",
  "totalEntitlements": 250,
  "activeEntitlements": 235,
  "orphanedEntitlements": 8,
  "unclassifiedEntitlements": 12,
  "highRiskEntitlements": 45,
  "averageUsersPerEntitlement": 3.50,
  "timestamp": 1704067200000
}
```

### KPI Definitions

| Metric | Definition | Risk Indicator | Action |
|--------|-----------|-----------------|--------|
| **totalEntitlements** | Sum of all entitlements for this resource | - | Baseline metric |
| **activeEntitlements** | Entitlements with lifecycle = "Active" | Low if < 80% of total | Investigate deprecated entitlements still in use |
| **orphanedEntitlements** | Entitlements with ownerId = NULL | 🔴 HIGH | Assign owners immediately - governance risk |
| **unclassifiedEntitlements** | Entitlements with no classification labels | 🟡 MEDIUM | Classify entitlements - needed for reviews |
| **highRiskEntitlements** | Entitlements with riskLevel = "High" | Monitor closely | These need extra approval/review controls |
| **averageUsersPerEntitlement** | totalAssignments ÷ totalEntitlements | 🟡 If > 10 | Excessive permissions (least privilege risk) |

### Usage Examples

#### Example 1: Dashboard KPI Display
```bash
curl -X POST http://localhost:8080/api/v1/entitlements/analytics/kpi \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "550e8400-e29b-41d4-a716-446655440000",
    "tenantId": "tenant-123"
  }'
```

#### Example 2: Governance Alert Logic
```java
EntitlementKpiResponse kpi = analyticsService.getEntitlementKpis(request);

// Alert if too many orphaned entitlements
if (kpi.getOrphanedEntitlements() > 10) {
    alertService.sendAlert(
        "CRITICAL: " + kpi.getOrphanedEntitlements() + " orphaned entitlements detected"
    );
}

// Alert if unclassified entitlements are high
if (kpi.getUnclassifiedEntitlements() > kpi.getTotalEntitlements() * 0.2) {
    alertService.sendAlert(
        "WARNING: " + (kpi.getUnclassifiedEntitlements()/kpi.getTotalEntitlements()*100) + 
        "% of entitlements are unclassified"
    );
}

// Alert if average users per entitlement is too high
if (kpi.getAverageUsersPerEntitlement() > 5.0) {
    alertService.sendAlert(
        "MEDIUM: Avg " + kpi.getAverageUsersPerEntitlement() + 
        " users per entitlement (least privilege risk)"
    );
}
```

#### Example 3: Compliance Reporting
```java
EntitlementKpiResponse kpi = analyticsService.getEntitlementKpis(request);

report.addSection("Entitlement Governance Status", 
    "Total Entitlements: " + kpi.getTotalEntitlements() + 
    "\nActive: " + kpi.getActiveEntitlements() +
    "\nHigh-Risk: " + kpi.getHighRiskEntitlements() +
    "\nOrphaned (No Owner): " + kpi.getOrphanedEntitlements() +
    "\nUnclassified: " + kpi.getUnclassifiedEntitlements()
);
```

### Repository Methods Used

The analytics API relies on these optimized database queries:

```java
// Core counts
entitlementRepository.countByResourceIdAndTenantId(resourceId, tenantId);
entitlementRepository.countByLifecycle(resourceId, tenantId, "Active");
entitlementRepository.countOrphanedEntitlements(resourceId, tenantId);
entitlementRepository.countUnclassifiedEntitlements(resourceId, tenantId);
entitlementRepository.countByRiskLevel(resourceId, tenantId, "High");

// For average calculation
entitlementAssignmentRepository.countByResourceIdAndTenantId(resourceId, tenantId);
```

All queries:
- Use proper indexes for fast execution
- Filter by tenant (multi-tenant isolation)
- Support pagination where applicable
- Avoid N+1 query problems

---

## Implementation Checklist

- [x] Create Constants file: `EntitlementKpisConstants.java`
- [x] Create Request DTO: `EntitlementKpiRequest.java`
- [x] Create Response DTO: `EntitlementKpiResponse.java`
- [x] Add Repository queries: `EntitlementRepository` & `EntitlementAssignmentRepository`
- [x] Create Service interface: `EntitlementAnalyticsService`
- [x] Create Service impl: `EntitlementAnalyticsServiceImpl`
- [x] Create Controller: `EntitlementAnalyticsController`
- [x] Add comprehensive logging
- [x] Add validation & error handling
- [x] Document all components

---

## Next Steps

1. **Integration Testing**: Test the KPI calculation with real data
2. **Performance Testing**: Ensure queries perform well with large datasets
3. **Dashboard Integration**: Wire up analytics endpoint to governance dashboard
4. **Alerting**: Implement governance alerts based on KPI thresholds
5. **Advanced Analytics**: Add trend analysis, predictive models for risk

