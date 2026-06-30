import { OrgNodeData } from '@/types/organization';

export interface OrgDiff {
  type: 'added' | 'removed' | 'modified' | 'moved';
  nodeId: string;
  nodeName: string;
  path: string[];
  details?: string;
  oldValue?: any;
  newValue?: any;
}

export function compareOrgTrees(
  oldTree: OrgNodeData,
  newTree: OrgNodeData
): OrgDiff[] {
  const diffs: OrgDiff[] = [];
  
  // Build maps of all nodes
  const oldNodes = new Map<string, { node: OrgNodeData; path: string[] }>();
  const newNodes = new Map<string, { node: OrgNodeData; path: string[] }>();
  
  const mapNodes = (node: OrgNodeData, map: Map<string, any>, path: string[] = []) => {
    const currentPath = [...path, node.name];
    map.set(node.id, { node, path: currentPath });
    
    if (node.children) {
      node.children.forEach(child => mapNodes(child, map, currentPath));
    }
  };
  
  mapNodes(oldTree, oldNodes);
  mapNodes(newTree, newNodes);
  
  // Find added nodes
  newNodes.forEach(({ node, path }, id) => {
    if (!oldNodes.has(id)) {
      diffs.push({
        type: 'added',
        nodeId: id,
        nodeName: node.name,
        path,
        details: `Added ${node.type}: ${node.name}`,
      });
    }
  });
  
  // Find removed nodes
  oldNodes.forEach(({ node, path }, id) => {
    if (!newNodes.has(id)) {
      diffs.push({
        type: 'removed',
        nodeId: id,
        nodeName: node.name,
        path,
        details: `Removed ${node.type}: ${node.name}`,
      });
    }
  });
  
  // Find modified nodes
  oldNodes.forEach(({ node: oldNode, path: oldPath }, id) => {
    const newNodeData = newNodes.get(id);
    if (newNodeData) {
      const { node: newNode, path: newPath } = newNodeData;
      
      // Check if moved
      if (JSON.stringify(oldPath) !== JSON.stringify(newPath)) {
        diffs.push({
          type: 'moved',
          nodeId: id,
          nodeName: newNode.name,
          path: newPath,
          details: `Moved from ${oldPath.join(' > ')} to ${newPath.join(' > ')}`,
          oldValue: oldPath.join(' > '),
          newValue: newPath.join(' > '),
        });
      }
      
      // Check property changes
      const propertyChanges: string[] = [];
      
      if (oldNode.name !== newNode.name) {
        propertyChanges.push(`Name: "${oldNode.name}" → "${newNode.name}"`);
      }
      if (oldNode.head !== newNode.head) {
        propertyChanges.push(`Head: "${oldNode.head}" → "${newNode.head}"`);
      }
      if (oldNode.riskLevel !== newNode.riskLevel) {
        propertyChanges.push(`Risk: ${oldNode.riskLevel} → ${newNode.riskLevel}`);
      }
      if (oldNode.complianceStatus !== newNode.complianceStatus) {
        propertyChanges.push(`Compliance: ${oldNode.complianceStatus} → ${newNode.complianceStatus}`);
      }
      
      if (propertyChanges.length > 0) {
        diffs.push({
          type: 'modified',
          nodeId: id,
          nodeName: newNode.name,
          path: newPath,
          details: propertyChanges.join('; '),
        });
      }
    }
  });
  
  return diffs;
}

export function compareMultipleUnits(units: OrgNodeData[]): {
  metrics: {
    name: string;
    values: Record<string, number>;
  }[];
  outliers: {
    unitId: string;
    metric: string;
    value: number;
    avgValue: number;
    deviation: number;
  }[];
} {
  if (units.length === 0) {
    return { metrics: [], outliers: [] };
  }
  
  const metrics = [
    { key: 'userCount', name: 'Users' },
    { key: 'roleCount', name: 'Roles' },
    { key: 'adminCount', name: 'Admins' },
    { key: 'riskScore', name: 'Risk Score' },
    { key: 'healthScore', name: 'Health Score' },
  ];
  
  const comparisonData = metrics.map(metric => {
    const values: Record<string, number> = {};
    units.forEach(unit => {
      values[unit.name] = (unit as any)[metric.key] || 0;
    });
    return {
      name: metric.name,
      values,
    };
  });
  
  // Calculate outliers (values > 2 standard deviations from mean)
  const outliers: any[] = [];
  
  metrics.forEach(metric => {
    const values = units.map(u => (u as any)[metric.key] || 0);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    units.forEach(unit => {
      const value = (unit as any)[metric.key] || 0;
      const deviation = Math.abs(value - avg) / (stdDev || 1);
      
      if (deviation > 2) {
        outliers.push({
          unitId: unit.id,
          metric: metric.name,
          value,
          avgValue: avg,
          deviation,
        });
      }
    });
  });
  
  return {
    metrics: comparisonData,
    outliers,
  };
}
