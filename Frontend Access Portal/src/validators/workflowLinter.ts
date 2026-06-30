// Workflow Linting Types
export interface LintIssue {
  id: string;
  type: 'error' | 'warning';
  message: string;
  description: string;
  fix?: string;
  nodeId?: string;
  edgeId?: string;
}

export interface ExtendedLintIssue extends LintIssue {
  severity: 'error' | 'warning' | 'info';
  fixAction?: {
    id: string;
    label: string;
    args?: any;
  };
}

// Workflow Linter Functions
export const validateWorkflow = (nodes: any[], edges: any[]): LintIssue[] => {
  const issues: LintIssue[] = [];

  // Check for start node (using stepType or node ID)
  const startNodes = nodes.filter(n => 
    n.id === 'start-node' || 
    n.data?.stepType === 'trigger.start' ||
    n.data?.stepType?.startsWith('trigger.start')
  );
  
  if (startNodes.length === 0) {
    issues.push({
      id: 'no-start',
      type: 'error',
      message: 'Missing Start Node',
      description: 'Workflow must have exactly one start node',
      fix: 'Add a start node from the node palette'
    });
  } else if (startNodes.length > 1) {
    issues.push({
      id: 'multiple-start',
      type: 'error',
      message: 'Multiple Start Nodes',
      description: 'Workflow can only have one start node',
      fix: 'Remove extra start nodes'
    });
  }

  // Check for end node (using stepType or node ID)
  const endNodes = nodes.filter(n => 
    n.id === 'end-node' || 
    n.data?.stepType === 'trigger.end' ||
    n.data?.stepType?.startsWith('trigger.end')
  );
  
  if (endNodes.length === 0) {
    issues.push({
      id: 'no-end',
      type: 'error',
      message: 'Missing End Node',
      description: 'Workflow must have at least one end node',
      fix: 'Add an end node from the node palette'
    });
  }

  // Helper to check if node is start/end
  const isStartOrEndNode = (node: any) => {
    return node.id === 'start-node' || 
           node.id === 'end-node' ||
           node.data?.stepType === 'trigger.start' ||
           node.data?.stepType === 'trigger.end' ||
           node.data?.stepType?.startsWith('trigger.start') ||
           node.data?.stepType?.startsWith('trigger.end');
  };

  // Check for disconnected nodes using graph reachability
  // Build adjacency list
  const adjacencyList = new Map<string, string[]>();
  nodes.forEach(node => adjacencyList.set(node.id, []));
  edges.forEach(edge => {
    const targets = adjacencyList.get(edge.source) || [];
    targets.push(edge.target);
    adjacencyList.set(edge.source, targets);
  });

  // Find start node
  const startNode = startNodes[0];
  if (startNode) {
    // BFS to find all reachable nodes from start
    const reachableFromStart = new Set<string>();
    const queue = [startNode.id];
    reachableFromStart.add(startNode.id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = adjacencyList.get(current) || [];
      
      for (const neighbor of neighbors) {
        if (!reachableFromStart.has(neighbor)) {
          reachableFromStart.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    // Check each node (except start/end) is reachable from start
    nodes.forEach(node => {
      if (!isStartOrEndNode(node) && !reachableFromStart.has(node.id)) {
        issues.push({
          id: `disconnected-${node.id}`,
          type: 'warning',
          message: 'Disconnected Node',
          description: `Node "${node.data?.label || node.id}" is not reachable from the workflow start`,
          fix: 'Connect this node to the workflow path or remove it',
          nodeId: node.id
        });
      }
    });

    // Check if end node is reachable from start
    if (endNodes.length > 0 && !reachableFromStart.has(endNodes[0].id)) {
      issues.push({
        id: 'unreachable-end',
        type: 'error',
        message: 'End Node Not Reachable',
        description: 'The end node cannot be reached from the start node',
        fix: 'Create a path from start to end node'
      });
    }
  }

  // Check for nodes without labels
  nodes.forEach(node => {
    if (!node.data?.label && !isStartOrEndNode(node)) {
      issues.push({
        id: `no-label-${node.id}`,
        type: 'warning',
        message: 'Missing Node Label',
        description: 'Node should have a descriptive label',
        fix: 'Add a label to this node',
        nodeId: node.id
      });
    }
  });

  return issues;
};
