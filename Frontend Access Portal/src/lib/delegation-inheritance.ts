import { TreeNode } from "@/types/hierarchical-delegation";
import { EffectiveAccess } from "@/types/hierarchical-delegation";

export class DelegationInheritanceEngine {
  private nodes: Map<string, TreeNode> = new Map();
  private topLevelNodes: TreeNode[] = [];

  constructor(nodes: TreeNode[]) {
    this.buildNodeMap(nodes);
  }

  private buildNodeMap(nodes: TreeNode[]) {
    // Build lookup map
    nodes.forEach((node) => {
      this.nodes.set(node.id, node);
      if (!node.parentId) {
        this.topLevelNodes.push(node);
      }
    });
  }

  public getEffectiveAccess(
    userId: string,
    targetNodeId: string
  ): EffectiveAccess | null {
    const targetNode = this.nodes.get(targetNodeId);
    if (!targetNode) return null;

    // Check direct assignment
    const directAssignment = targetNode.delegates.find(
      (d) => d.userId === userId
    );
    if (directAssignment) {
      return {
        nodeId: targetNodeId,
        nodeName: targetNode.name,
        accessType: this.roleToAccessType(directAssignment.role),
        source: "direct",
        permissions: directAssignment.permissions,
      };
    }

    // Check inherited access from ancestors
    const inheritedAccess = this.checkInheritedAccess(userId, targetNodeId);
    if (inheritedAccess) return inheritedAccess;

    // Check sibling access
    const siblingAccess = this.checkSiblingAccess(userId, targetNodeId);
    if (siblingAccess) return siblingAccess;

    return null;
  }

  private checkInheritedAccess(
    userId: string,
    nodeId: string
  ): EffectiveAccess | null {
    const node = this.nodes.get(nodeId);
    if (!node || !node.parentId) return null;

    const parent = this.nodes.get(node.parentId);
    if (!parent) return null;

    // Check if user has assignment in parent
    const parentAssignment = parent.delegates.find((d) => d.userId === userId);
    if (
      parentAssignment &&
      (parentAssignment.role === "owner" || parentAssignment.role === "admin")
    ) {
      return {
        nodeId: nodeId,
        nodeName: node.name,
        accessType: "manage",
        source: "inherited",
        permissions: parentAssignment.permissions,
      };
    }

    // Recurse up the tree
    return this.checkInheritedAccess(userId, node.parentId);
  }

  private checkSiblingAccess(
    userId: string,
    targetNodeId: string
  ): EffectiveAccess | null {
    const targetNode = this.nodes.get(targetNodeId);
    if (!targetNode || !targetNode.parentId) return null;

    const parent = this.nodes.get(targetNode.parentId);
    if (!parent) return null;

    // Check siblings for assignments with sibling access enabled
    for (const sibling of parent.children) {
      if (sibling.id === targetNodeId) continue;

      const siblingAssignment = sibling.delegates.find(
        (d) => d.userId === userId && d.allowSiblingAccess === true
      );

      if (siblingAssignment) {
        return {
          nodeId: targetNodeId,
          nodeName: targetNode.name,
          accessType: this.roleToAccessType(siblingAssignment.role),
          source: "sibling",
          permissions: siblingAssignment.permissions,
        };
      }
    }

    return null;
  }

  private roleToAccessType(role: string): "manage" | "view" | "none" {
    switch (role) {
      case "owner":
      case "admin":
        return "manage";
      case "viewer":
        return "view";
      default:
        return "none";
    }
  }

  public getAllDescendants(nodeId: string): TreeNode[] {
    const node = this.nodes.get(nodeId);
    if (!node) return [];

    const descendants: TreeNode[] = [];
    const collectDescendants = (currentNode: TreeNode) => {
      currentNode.children.forEach((child) => {
        descendants.push(child);
        collectDescendants(child);
      });
    };

    collectDescendants(node);
    return descendants;
  }

  public getAncestors(nodeId: string): TreeNode[] {
    const ancestors: TreeNode[] = [];
    let currentNode = this.nodes.get(nodeId);

    while (currentNode && currentNode.parentId) {
      const parent = this.nodes.get(currentNode.parentId);
      if (parent) {
        ancestors.unshift(parent);
        currentNode = parent;
      } else {
        break;
      }
    }

    return ancestors;
  }
}

export const createMockHierarchicalData = (): TreeNode[] => {
  return [
    {
      id: "tln-1",
      name: "Global Organization",
      type: "organizational",
      children: [
        {
          id: "org-1",
          name: "North America",
          type: "geographical",
          parentId: "tln-1",
          children: [
            {
              id: "dept-1",
              name: "Engineering",
              type: "organizational",
              parentId: "org-1",
              children: [],
              status: "active",
              delegates: [
                {
                  id: "del-1",
                  userId: "user-1",
                  userName: "Alice Johnson",
                  role: "admin",
                  permissions: ["User Management", "Access Reviews"],
                  allowSiblingAccess: true,
                  assigned: "2024-01-15",
                  assignedBy: "system",
                },
              ],
              created: "2024-01-01",
              userCount: 45,
              applicationsCount: 8,
            },
            {
              id: "dept-2",
              name: "Sales",
              type: "organizational",
              parentId: "org-1",
              children: [],
              status: "active",
              delegates: [],
              created: "2024-01-01",
              userCount: 32,
              applicationsCount: 5,
            },
          ],
          status: "active",
          delegates: [
            {
              id: "del-2",
              userId: "user-2",
              userName: "Bob Smith",
              role: "owner",
              permissions: ["Full Access"],
              allowSiblingAccess: false,
              assigned: "2024-01-01",
              assignedBy: "admin",
            },
          ],
          created: "2024-01-01",
          userCount: 150,
          applicationsCount: 12,
        },
        {
          id: "org-2",
          name: "Europe",
          type: "geographical",
          parentId: "tln-1",
          children: [],
          status: "active",
          delegates: [],
          created: "2024-01-01",
          userCount: 85,
          applicationsCount: 7,
        },
      ],
      status: "active",
      delegates: [
        {
          id: "del-3",
          userId: "user-3",
          userName: "Charlie Brown",
          role: "owner",
          permissions: ["Global Admin"],
          assigned: "2024-01-01",
          assignedBy: "system",
        },
      ],
      created: "2024-01-01",
      userCount: 500,
      applicationsCount: 25,
    },
  ];
};
