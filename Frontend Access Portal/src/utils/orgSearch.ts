import { OrgNodeData } from '@/types/organization';

export interface SearchResult {
  node: OrgNodeData;
  score: number;
  matchedFields: string[];
  path: string[];
}

// Fuzzy search with weighted scoring
export function searchOrganization(
  tree: OrgNodeData,
  query: string,
  options: {
    fuzzy?: boolean;
    maxResults?: number;
    weights?: {
      name?: number;
      head?: number;
      location?: number;
      costCenter?: number;
      tags?: number;
    };
  } = {}
): SearchResult[] {
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();
  
  const weights = {
    name: 10,
    head: 5,
    location: 3,
    costCenter: 3,
    tags: 2,
    ...options.weights,
  };
  
  const searchNode = (node: OrgNodeData, path: string[] = []) => {
    let score = 0;
    const matchedFields: string[] = [];
    const currentPath = [...path, node.name];
    
    // Search name
    if (node.name.toLowerCase().includes(lowerQuery)) {
      score += weights.name;
      matchedFields.push('name');
    }
    
    // Search head
    if (node.head?.toLowerCase().includes(lowerQuery)) {
      score += weights.head;
      matchedFields.push('head');
    }
    
    // Search location
    if (node.location?.toLowerCase().includes(lowerQuery)) {
      score += weights.location;
      matchedFields.push('location');
    }
    
    // Search cost center
    if (node.costCenter?.toLowerCase().includes(lowerQuery)) {
      score += weights.costCenter;
      matchedFields.push('costCenter');
    }
    
    // Search tags
    if (node.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
      score += weights.tags;
      matchedFields.push('tags');
    }
    
    // Fuzzy matching bonus
    if (options.fuzzy && score === 0) {
      const fuzzyScore = calculateFuzzyScore(node.name.toLowerCase(), lowerQuery);
      if (fuzzyScore > 0.6) {
        score = fuzzyScore * 5;
        matchedFields.push('name (fuzzy)');
      }
    }
    
    if (score > 0) {
      results.push({
        node,
        score,
        matchedFields,
        path: currentPath,
      });
    }
    
    // Search children
    if (node.children) {
      node.children.forEach(child => searchNode(child, currentPath));
    }
  };
  
  searchNode(tree);
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  
  // Limit results
  const maxResults = options.maxResults || 50;
  return results.slice(0, maxResults);
}

// Calculate fuzzy match score (0-1)
function calculateFuzzyScore(str: string, query: string): number {
  if (str === query) return 1;
  if (query.length === 0) return 0;
  
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < str.length && queryIndex < query.length; i++) {
    if (str[i] === query[queryIndex]) {
      score += 1 / query.length;
      queryIndex++;
    }
  }
  
  return score;
}

// Get recent searches from localStorage
export function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem('orgRecentSearches');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save search to history
export function saveSearchToHistory(query: string): void {
  if (!query.trim()) return;
  
  try {
    const recent = getRecentSearches();
    const updated = [query, ...recent.filter(q => q !== query)].slice(0, 10);
    localStorage.setItem('orgRecentSearches', JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

// Clear search history
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem('orgRecentSearches');
  } catch {
    // Ignore localStorage errors
  }
}
