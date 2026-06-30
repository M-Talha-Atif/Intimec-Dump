import { OrgNodeData } from '@/types/organization';

export function moveOrgUnit(
  tree: OrgNodeData,
  nodeId: string,
  newParentId: string
): OrgNodeData | null {
  // Clone the tree
  const clonedTree = JSON.parse(JSON.stringify(tree));
  
  // Find and remove the node
  const nodeToMove = removeNode(clonedTree, nodeId);
  if (!nodeToMove) return null;
  
  // Add to new parent
  if (newParentId === 'root') {
    // Move to root level (this would need special handling)
    return clonedTree;
  }
  
  const added = addNodeToParent(clonedTree, newParentId, nodeToMove);
  return added ? clonedTree : null;
}

function removeNode(tree: OrgNodeData, nodeId: string): OrgNodeData | null {
  if (!tree.children) return null;
  
  for (let i = 0; i < tree.children.length; i++) {
    if (tree.children[i].id === nodeId) {
      const [removed] = tree.children.splice(i, 1);
      return removed;
    }
    
    const found = removeNode(tree.children[i], nodeId);
    if (found) return found;
  }
  
  return null;
}

function addNodeToParent(tree: OrgNodeData, parentId: string, node: OrgNodeData): boolean {
  if (tree.id === parentId) {
    if (!tree.children) tree.children = [];
    tree.children.push(node);
    return true;
  }
  
  if (tree.children) {
    for (const child of tree.children) {
      if (addNodeToParent(child, parentId, node)) return true;
    }
  }
  
  return false;
}

export function mergeOrgUnits(
  tree: OrgNodeData,
  sourceIds: string[],
  targetId: string,
  newName?: string
): OrgNodeData | null {
  const clonedTree = JSON.parse(JSON.stringify(tree));
  
  // Find target node
  const target = findNodeById(clonedTree, targetId);
  if (!target) return null;
  
  // Merge all source nodes into target
  sourceIds.forEach(sourceId => {
    const source = findNodeById(clonedTree, sourceId);
    if (source && source.id !== targetId) {
      // Aggregate metrics
      target.userCount += source.userCount;
      target.roleCount += source.roleCount;
      target.adminCount += source.adminCount;
      
      // Merge children
      if (source.children) {
        if (!target.children) target.children = [];
        target.children.push(...source.children);
      }
      
      // Remove source node
      removeNode(clonedTree, sourceId);
    }
  });
  
  if (newName) target.name = newName;
  
  return clonedTree;
}

export function splitOrgUnit(
  tree: OrgNodeData,
  nodeId: string,
  splitConfig: {
    name1: string;
    name2: string;
    childrenIds1: string[];
    childrenIds2: string[];
  }
): OrgNodeData | null {
  const clonedTree = JSON.parse(JSON.stringify(tree));
  
  const node = findNodeById(clonedTree, nodeId);
  if (!node || !node.children) return null;
  
  // Create two new units
  const unit1: OrgNodeData = {
    id: `${nodeId}_split1`,
    name: splitConfig.name1,
    type: node.type,
    userCount: 0,
    roleCount: 0,
    adminCount: 0,
    children: [],
  };
  
  const unit2: OrgNodeData = {
    id: `${nodeId}_split2`,
    name: splitConfig.name2,
    type: node.type,
    userCount: 0,
    roleCount: 0,
    adminCount: 0,
    children: [],
  };
  
  // Distribute children
  node.children.forEach(child => {
    if (splitConfig.childrenIds1.includes(child.id)) {
      unit1.children!.push(child);
      unit1.userCount += child.userCount;
      unit1.roleCount += child.roleCount;
      unit1.adminCount += child.adminCount;
    } else if (splitConfig.childrenIds2.includes(child.id)) {
      unit2.children!.push(child);
      unit2.userCount += child.userCount;
      unit2.roleCount += child.roleCount;
      unit2.adminCount += child.adminCount;
    }
  });
  
  // Replace original node with the two new units
  node.children = [unit1, unit2];
  
  return clonedTree;
}

export function findNodeById(tree: OrgNodeData, id: string): OrgNodeData | null {
  if (tree.id === id) return tree;
  
  if (tree.children) {
    for (const child of tree.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  
  return null;
}

export function bulkUpdateNodes(
  tree: OrgNodeData,
  nodeIds: string[],
  updates: Partial<OrgNodeData>
): OrgNodeData {
  const clonedTree = JSON.parse(JSON.stringify(tree));
  
  const updateNode = (node: OrgNodeData) => {
    if (nodeIds.includes(node.id)) {
      Object.assign(node, updates);
    }
    
    if (node.children) {
      node.children.forEach(updateNode);
    }
  };
  
  updateNode(clonedTree);
  return clonedTree;
}

export function getAllNodeIds(tree: OrgNodeData): string[] {
  const ids: string[] = [tree.id];
  
  if (tree.children) {
    tree.children.forEach(child => {
      ids.push(...getAllNodeIds(child));
    });
  }
  
  return ids;
}

export function getNodePath(tree: OrgNodeData, nodeId: string, path: string[] = []): string[] | null {
  if (tree.id === nodeId) {
    return [...path, tree.name];
  }
  
  if (tree.children) {
    for (const child of tree.children) {
      const found = getNodePath(child, nodeId, [...path, tree.name]);
      if (found) return found;
    }
  }
  
  return null;
}
