import {
  InternalRole,
  RoleFilters,
  RoleSortConfig,
  CreateRoleData,
  BulkRoleOperation,
  RoleStats,
  Permission,
  User,
} from "@/types/roleManagement";

// Mock data for development
const mockRoles: InternalRole[] = [
  {
    id: "app-owner",
    name: "Application Owner",
    type: "admin",
    status: "active",
    description:
      "Full administrative access to application management and configuration",
    businessJustification:
      "Required for platform administration and configuration management",
    owner: "john.doe@company.com",
    approver: "sarah.smith@company.com",
    permissions: [
      {
        id: "perm-1",
        name: "Manage Applications",
        description: "Create, update, and delete applications",
        category: "Application Management",
        level: "admin",
      },
      {
        id: "perm-2",
        name: "Manage Workflows",
        description: "Configure and manage identity workflows",
        category: "Workflow Management",
        level: "admin",
        isRisky: true,
      },
    ],
    scopes: ["Applications", "Workflows", "Configurations"],
    assignments: [
      {
        userId: "user-1",
        assignedBy: "admin@company.com",
        assignedDate: "2024-01-15",
        status: "active",
        justification: "Platform administration responsibilities",
      },
    ],
    userCount: 3,
    activeUserCount: 3,
    riskLevel: "high",
    riskScore: 85,
    violations: [
      {
        type: "excessive_permissions",
        severity: "medium",
        description: "Role has more permissions than typically required",
        recommendation: "Review and reduce permissions to minimum required",
      },
    ],
    complianceFrameworks: ["SOX", "ISO 27001"],
    requiresApproval: true,
    created: "2024-01-15",
    lastModified: "2024-03-10",
    lastReviewed: "2024-02-15",
    nextReviewDate: "2024-05-15",
    activityLog: [
      {
        id: "log-1",
        timestamp: "2024-03-10T10:30:00Z",
        action: "updated",
        actor: "john.doe@company.com",
        details: "Updated role permissions",
        metadata: { permissions: ["added: perm-2"] },
      },
    ],
    versions: [
      {
        version: 1,
        timestamp: "2024-03-10T10:30:00Z",
        changes: ["Added workflow management permission"],
        changedBy: "john.doe@company.com",
        rollbackable: true,
      },
    ],
    tags: ["critical", "admin"],
    isArchived: false,
  },
  {
    id: "campaign-reviewer",
    name: "Campaign Reviewer",
    type: "reviewer",
    status: "active",
    description: "Can review and approve access review campaigns",
    businessJustification: "Required for access certification and compliance",
    owner: "jane.smith@company.com",
    permissions: [
      {
        id: "perm-3",
        name: "Review Campaigns",
        description: "Review and approve access certification campaigns",
        category: "Access Reviews",
        level: "write",
      },
    ],
    scopes: ["Access Reviews", "Audit Logs"],
    assignments: [
      {
        userId: "user-2",
        assignedBy: "admin@company.com",
        assignedDate: "2024-01-20",
        status: "active",
      },
    ],
    userCount: 8,
    activeUserCount: 7,
    riskLevel: "medium",
    riskScore: 45,
    violations: [],
    complianceFrameworks: ["SOX"],
    requiresApproval: false,
    created: "2024-01-20",
    lastModified: "2024-03-05",
    lastReviewed: "2024-02-20",
    nextReviewDate: "2024-05-20",
    activityLog: [],
    versions: [],
    tags: ["reviewer", "compliance"],
    isArchived: false,
  },
];

const mockUsers: User[] = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "IT",
    manager: "sarah.smith@company.com",
    status: "active",
    lastLogin: "2024-03-15T09:30:00Z",
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    department: "Security",
    manager: "mike.jones@company.com",
    status: "active",
    lastLogin: "2024-03-14T14:15:00Z",
  },
];

const mockPermissions: Permission[] = [
  {
    id: "perm-1",
    name: "Manage Applications",
    description: "Create, update, and delete applications",
    category: "Application Management",
    level: "admin",
  },
  {
    id: "perm-2",
    name: "Manage Workflows",
    description: "Configure and manage identity workflows",
    category: "Workflow Management",
    level: "admin",
    isRisky: true,
  },
];

export class RoleManagementService {
  private roles: InternalRole[] = [...mockRoles];

  // Role CRUD operations
  async getRoles(
    filters?: RoleFilters,
    sort?: RoleSortConfig,
    page?: number,
    limit?: number
  ): Promise<{
    roles: InternalRole[];
    total: number;
    page: number;
    limit: number;
  }> {
    let filteredRoles = [...this.roles];

    // Apply filters
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredRoles = filteredRoles.filter(
          (role) =>
            role.name.toLowerCase().includes(searchLower) ||
            role.description.toLowerCase().includes(searchLower) ||
            role.owner.toLowerCase().includes(searchLower)
        );
      }

      if (filters.types.length > 0) {
        filteredRoles = filteredRoles.filter((role) =>
          filters.types.includes(role.type)
        );
      }

      if (filters.statuses.length > 0) {
        filteredRoles = filteredRoles.filter((role) =>
          filters.statuses.includes(role.status)
        );
      }

      if (filters.riskLevels.length > 0) {
        filteredRoles = filteredRoles.filter((role) =>
          filters.riskLevels.includes(role.riskLevel)
        );
      }

      if (filters.scopes.length > 0) {
        filteredRoles = filteredRoles.filter((role) =>
          role.scopes.some((scope) => filters.scopes.includes(scope))
        );
      }
    }

    // Apply sorting
    if (sort) {
      filteredRoles.sort((a, b) => {
        let aValue: any = a[sort.field as keyof InternalRole];
        let bValue: any = b[sort.field as keyof InternalRole];

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sort.direction === "desc") {
          return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    // Apply pagination
    const currentPage = page || 1;
    const pageLimit = limit || 10;
    const startIndex = (currentPage - 1) * pageLimit;
    const paginatedRoles = filteredRoles.slice(
      startIndex,
      startIndex + pageLimit
    );

    return {
      roles: paginatedRoles,
      total: filteredRoles.length,
      page: currentPage,
      limit: pageLimit,
    };
  }

  async getRoleById(id: string): Promise<InternalRole | null> {
    return this.roles.find((role) => role.id === id) || null;
  }

  async createRole(data: CreateRoleData): Promise<InternalRole> {
    const newRole: InternalRole = {
      id: `role-${Date.now()}`,
      name: data.name,
      type: data.type,
      status: "active",
      description: data.description,
      businessJustification: data.businessJustification,
      owner: data.owner,
      approver: data.approver,
      permissions: [],
      scopes: data.scopes,
      assignments: [],
      userCount: 0,
      activeUserCount: 0,
      riskLevel: "low",
      riskScore: 0,
      violations: [],
      complianceFrameworks: data.complianceFrameworks,
      requiresApproval: data.requiresApproval,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      activityLog: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: "created",
          actor: data.owner,
          details: `Role "${data.name}" created`,
        },
      ],
      versions: [],
      tags: data.tags,
      customFields: data.customFields,
      isArchived: false,
    };

    this.roles.push(newRole);
    return newRole;
  }

  async updateRole(
    id: string,
    updates: Partial<InternalRole>
  ): Promise<InternalRole | null> {
    const roleIndex = this.roles.findIndex((role) => role.id === id);
    if (roleIndex === -1) return null;

    const role = this.roles[roleIndex];
    const updatedRole = {
      ...role,
      ...updates,
      lastModified: new Date().toISOString(),
    };

    this.roles[roleIndex] = updatedRole;
    return updatedRole;
  }

  async deleteRole(id: string): Promise<boolean> {
    const roleIndex = this.roles.findIndex((role) => role.id === id);
    if (roleIndex === -1) return false;

    this.roles.splice(roleIndex, 1);
    return true;
  }

  async archiveRole(id: string, reason?: string): Promise<boolean> {
    const role = await this.getRoleById(id);
    if (!role) return false;

    await this.updateRole(id, {
      status: "archived",
      isArchived: true,
      archiveReason: reason,
    });

    return true;
  }

  // User assignment operations
  async assignUsersToRole(
    roleId: string,
    userIds: string[],
    assignedBy: string
  ): Promise<boolean> {
    const role = await this.getRoleById(roleId);
    if (!role) return false;

    const newAssignments = userIds.map((userId) => ({
      userId,
      assignedBy,
      assignedDate: new Date().toISOString(),
      status: "active" as const,
    }));

    await this.updateRole(roleId, {
      assignments: [...role.assignments, ...newAssignments],
      userCount: role.userCount + userIds.length,
      activeUserCount: role.activeUserCount + userIds.length,
    });

    return true;
  }

  async unassignUserFromRole(roleId: string, userId: string): Promise<boolean> {
    const role = await this.getRoleById(roleId);
    if (!role) return false;

    const updatedAssignments = role.assignments.filter(
      (assignment) => assignment.userId !== userId
    );

    await this.updateRole(roleId, {
      assignments: updatedAssignments,
      userCount: role.userCount - 1,
      activeUserCount: role.activeUserCount - 1,
    });

    return true;
  }

  // Bulk operations
  async bulkOperation(operation: BulkRoleOperation): Promise<boolean> {
    try {
      for (const roleId of operation.roleIds) {
        switch (operation.operation) {
          case "archive":
            await this.archiveRole(roleId, operation.options?.reason);
            break;
          case "delete":
            await this.deleteRole(roleId);
            break;
          case "activate":
            await this.updateRole(roleId, {
              status: "active",
              isArchived: false,
            });
            break;
        }
      }
      return true;
    } catch (error) {
      console.error("Bulk operation failed:", error);
      return false;
    }
  }

  // Statistics and analytics
  async getRoleStats(): Promise<RoleStats> {
    const stats: RoleStats = {
      total: this.roles.length,
      active: this.roles.filter((role) => role.status === "active").length,
      archived: this.roles.filter((role) => role.isArchived).length,
      highRisk: this.roles.filter(
        (role) => role.riskLevel === "high" || role.riskLevel === "critical"
      ).length,
      withViolations: this.roles.filter((role) => role.violations.length > 0)
        .length,
      recentlyModified: this.roles.filter((role) => {
        const lastModified = new Date(role.lastModified);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastModified > thirtyDaysAgo;
      }).length,
    };

    return stats;
  }

  // Helper methods for UI
  async getUsers(): Promise<User[]> {
    return mockUsers;
  }

  async getPermissions(): Promise<Permission[]> {
    return mockPermissions;
  }

  async getAvailableScopes(): Promise<string[]> {
    const allScopes = this.roles.flatMap((role) => role.scopes);
    return [...new Set(allScopes)];
  }

  async exportRole(roleId: string): Promise<string> {
    const role = await this.getRoleById(roleId);
    if (!role) throw new Error("Role not found");

    return JSON.stringify(role, null, 2);
  }

  async cloneRole(
    roleId: string,
    newName: string
  ): Promise<InternalRole | null> {
    const originalRole = await this.getRoleById(roleId);
    if (!originalRole) return null;

    const clonedRole: InternalRole = {
      ...originalRole,
      id: `role-${Date.now()}`,
      name: newName,
      assignments: [],
      userCount: 0,
      activeUserCount: 0,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      activityLog: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: "created",
          actor: originalRole.owner,
          details: `Role cloned from "${originalRole.name}"`,
        },
      ],
      versions: [],
    };

    this.roles.push(clonedRole);
    return clonedRole;
  }
}
