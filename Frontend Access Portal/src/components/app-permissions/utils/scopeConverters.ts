import type { TreeNode } from "@/types/hierarchical-delegation";
import type { DelegatedScope } from "@/lib/delegation/bridge/cards-tree-bridge";

export const convertNodeToScope = (node: TreeNode): DelegatedScope => {
  const primaryDelegate =
    node.delegates.find((d) => d.role === "owner") || node.delegates[0];

  return {
    id: node.id,
    name: node.name,
    type: node.type,
    administrator: primaryDelegate?.userName || "Unassigned",
    userCount: node.userCount || 0,
    applicationsCount: node.applicationsCount || 0,
    permissions: primaryDelegate?.permissions || [],
    timeRestriction: primaryDelegate?.timeWindow
      ? {
          start: primaryDelegate.timeWindow.start,
          end: primaryDelegate.timeWindow.end,
        }
      : undefined,
    created: node.created,
    status: node.status,
  };
};

export const flattenNodes = (nodes: TreeNode[]): DelegatedScope[] => {
  const flattened: DelegatedScope[] = [];

  const traverse = (nodeList: TreeNode[]) => {
    nodeList.forEach((node) => {
      flattened.push(convertNodeToScope(node));
      if (node.children.length > 0) {
        traverse(node.children);
      }
    });
  };

  traverse(nodes);
  return flattened;
};
