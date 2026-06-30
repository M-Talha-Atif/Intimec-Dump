
import { TreeNode } from '@/types/hierarchical-delegation';

interface DelegatedScope {
  id: string;
  name: string;
  type: 'organizational' | 'geographical' | 'application' | 'identity';
  administrator: string;
  userCount: number;
  applicationsCount: number;
  permissions: string[];
  timeRestriction?: {
    start: string;
    end: string;
  };
  created: string;
  status: 'active' | 'pending' | 'expired';
}

interface ScopeNodeMapping {
  scopeId: string;
  nodeId: string;
}

// Extended TreeNode with score for internal scoring
interface ScoredTreeNode extends TreeNode {
  score: number;
}

class CardsTreeBridge {
  private mappings: Map<string, string> = new Map();
  private readonly STORAGE_KEY = 'delegation-scope-node-mappings';

  constructor() {
    this.loadFromStorage();
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private loadFromStorage(): void {
    if (!this.canUseStorage()) return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const mappings: ScopeNodeMapping[] = JSON.parse(stored);
        mappings.forEach(({ scopeId, nodeId }) => {
          this.mappings.set(scopeId, nodeId);
        });
      }
    } catch (error) {
      console.warn('Failed to load scope-node mappings from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (!this.canUseStorage()) return;

    try {
      const mappings: ScopeNodeMapping[] = Array.from(this.mappings.entries()).map(
        ([scopeId, nodeId]) => ({ scopeId, nodeId })
      );
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mappings));
    } catch (error) {
      console.warn('Failed to save scope-node mappings to storage:', error);
    }
  }

  linkScopeToNode(scopeId: string, nodeId: string): void {
    this.mappings.set(scopeId, nodeId);
    this.saveToStorage();
  }

  unlinkScope(scopeId: string): void {
    this.mappings.delete(scopeId);
    this.saveToStorage();
  }

  getLinkedNodeId(scopeId: string): string | undefined {
    return this.mappings.get(scopeId);
  }

  findCandidateNodesForScope(scope: DelegatedScope, nodes: TreeNode[]): TreeNode[] {
    const candidates: ScoredTreeNode[] = [];
    
    const searchNodes = (nodeList: TreeNode[]) => {
      nodeList.forEach(node => {
        // Score based on similarity
        let score = 0;
        
        // Name similarity (partial match)
        if (node.name.toLowerCase().includes(scope.name.toLowerCase()) ||
            scope.name.toLowerCase().includes(node.name.toLowerCase())) {
          score += 3;
        }
        
        // Type match
        if (node.type === scope.type) {
          score += 2;
        }
        
        // Administrator match (check delegates)
        const hasMatchingAdmin = node.delegates.some(delegate => 
          delegate.userName.toLowerCase().includes(scope.administrator.toLowerCase()) ||
          scope.administrator.toLowerCase().includes(delegate.userName.toLowerCase())
        );
        if (hasMatchingAdmin) {
          score += 2;
        }
        
        // User count similarity (within 20% range)
        if (node.userCount && scope.userCount) {
          const diff = Math.abs(node.userCount - scope.userCount);
          const avgCount = (node.userCount + scope.userCount) / 2;
          if (diff / avgCount < 0.2) {
            score += 1;
          }
        }
        
        // Add to candidates if has any similarity
        if (score > 0) {
          candidates.push({ ...node, score });
        }
        
        // Recursively search children
        if (node.children.length > 0) {
          searchNodes(node.children);
        }
      });
    };
    
    searchNodes(nodes);
    
    // Sort by score descending and return top candidates without score property
    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ score, ...node }) => node);
  }

  getAllMappings(): Map<string, string> {
    return new Map(this.mappings);
  }
}

// Singleton instance
export const cardsTreeBridge = new CardsTreeBridge();

// Export the interface for TypeScript
export type { DelegatedScope };
