
import { useState, useCallback, useMemo } from 'react';
import { TreeNode } from '@/types/hierarchical-delegation';

export function useNodeContext(nodeId: string | undefined, allNodes: TreeNode[]) {
  const [, forceUpdate] = useState({});
  
  const findNodeById = useCallback((nodes: TreeNode[], id: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
    return null;
  }, []);

  const updateNodeInTree = useCallback((nodes: TreeNode[], targetId: string, updater: (node: TreeNode) => TreeNode): TreeNode[] => {
    return nodes.map(node => {
      if (node.id === targetId) {
        return updater(node);
      }
      return {
        ...node,
        children: updateNodeInTree(node.children, targetId, updater)
      };
    });
  }, []);

  const node = useMemo(() => {
    return nodeId ? findNodeById(allNodes, nodeId) : null;
  }, [nodeId, allNodes, findNodeById]);

  const updateNode = useCallback((updater: (node: TreeNode) => TreeNode) => {
    if (!nodeId || !node) return;
    
    // This would typically update the global state
    // For now, we'll just force a re-render
    forceUpdate({});
  }, [nodeId, node]);

  return { node, updateNode };
}

export function getTreeIdPath(nodeId: string, allNodes: TreeNode[]): string[] {
  const path: string[] = [];
  
  const findPath = (nodes: TreeNode[], targetId: string, currentPath: string[]): boolean => {
    for (const node of nodes) {
      const newPath = [...currentPath, node.id];
      
      if (node.id === targetId) {
        path.push(...newPath);
        return true;
      }
      
      if (findPath(node.children, targetId, newPath)) {
        return true;
      }
    }
    return false;
  };
  
  findPath(allNodes, nodeId, []);
  return path;
}
