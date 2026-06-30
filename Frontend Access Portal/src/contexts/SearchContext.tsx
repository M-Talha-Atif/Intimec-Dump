'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'Settings' | 'Users' | 'Applications' | 'Entitlements' | 'Reports' | 'Workflows' | 'Actions';
  path: string;
  icon: string;
  weight: number;
  keywords: string[];
  aliases: string[];
  visible: boolean;
  roleRequired?: string[];
}

interface SearchContextType {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  performSearch: (query: string) => void;
  isLoading: boolean;
  searchHistory: string[];
  addToHistory: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const mockSearchIndex: SearchResult[] = [
    // Settings
    { id: 'settings-email', title: 'Email Server Configuration', description: 'Configure SMTP settings and email templates', category: 'Settings', path: '/', icon: 'Mail', weight: 10, keywords: ['email', 'smtp', 'notifications'], aliases: ['mail server'], visible: true },
    { id: 'settings-ui', title: 'Application UI', description: 'Customize branding and interface', category: 'Settings', path: '/', icon: 'Palette', weight: 8, keywords: ['ui', 'branding', 'theme'], aliases: ['design', 'appearance'], visible: true },
    { id: 'settings-schema', title: 'Schema Management', description: 'Manage object schemas and attributes', category: 'Settings', path: '/', icon: 'Database', weight: 7, keywords: ['schema', 'attributes', 'objects'], aliases: ['data model'], visible: true },
    { id: 'settings-app-permissions', title: 'Application Permissions', description: 'Manage granular access controls for internal IGA platform features', category: 'Settings', path: '/', icon: 'KeyRound', weight: 9, keywords: ['permissions', 'access control', 'internal roles', 'rbac'], aliases: ['app permissions', 'platform permissions'], visible: true },
    
    // Applications
    { id: 'apps-list', title: 'Applications', description: 'Manage connected applications', category: 'Applications', path: '/applications', icon: 'AppWindow', weight: 10, keywords: ['applications', 'apps', 'systems'], aliases: ['software', 'platforms'], visible: true },
    
    // Users & Identities
    { id: 'identities-human', title: 'Human Identities', description: 'Manage employee identities', category: 'Users', path: '/identities/human', icon: 'Users', weight: 10, keywords: ['users', 'employees', 'people'], aliases: ['staff', 'workers'], visible: true },
    { id: 'identities-nonhuman', title: 'Non-Human Identities', description: 'Manage service accounts and bots', category: 'Users', path: '/identities/non-human', icon: 'Shield', weight: 8, keywords: ['service accounts', 'bots', 'automation'], aliases: ['machines'], visible: true },
    
    // Workflows
    { id: 'workflows-list', title: 'Workflows', description: 'Automate business processes', category: 'Workflows', path: '/workflows', icon: 'Workflow', weight: 9, keywords: ['automation', 'processes', 'approval'], aliases: ['business rules'], visible: true },
    { id: 'access-reviews', title: 'Access Reviews', description: 'Certification campaigns', category: 'Workflows', path: '/access-review', icon: 'UserCheck', weight: 9, keywords: ['certification', 'reviews', 'compliance'], aliases: ['attestation'], visible: true },
    
    // Reports & Analytics
    { id: 'monitoring', title: 'Monitoring', description: 'System health and performance', category: 'Reports', path: '/monitoring', icon: 'Monitor', weight: 8, keywords: ['monitoring', 'health', 'performance'], aliases: ['dashboard'], visible: true },
    { id: 'audit-logs', title: 'Audit Logs', description: 'Track system activities', category: 'Reports', path: '/audit-logs', icon: 'ScrollText', weight: 8, keywords: ['audit', 'logs', 'history'], aliases: ['activity'], visible: true },
    
    // Actions
    { id: 'action-create-user', title: 'Create User', description: 'Add new user identity', category: 'Actions', path: '/identities/human?action=create', icon: 'UserPlus', weight: 7, keywords: ['create', 'add', 'new user'], aliases: ['onboard'], visible: true },
    { id: 'action-launch-campaign', title: 'Launch Access Review Campaign', description: 'Start new certification campaign', category: 'Actions', path: '/access-review?action=create', icon: 'Play', weight: 7, keywords: ['launch', 'campaign', 'certification'], aliases: ['start review'], visible: true }
  ];

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const results = mockSearchIndex
        .filter(item => {
          if (!item.visible) return false;
          
          const searchTerm = query.toLowerCase();
          return (
            item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)) ||
            item.aliases.some(alias => alias.toLowerCase().includes(searchTerm))
          );
        })
        .sort((a, b) => {
          // Prioritize exact matches in title
          const aExact = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
          const bExact = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
          
          if (aExact !== bExact) return bExact - aExact;
          
          // Then by weight
          return b.weight - a.weight;
        })
        .slice(0, 10);

      setSearchResults(results);
      setIsLoading(false);
    }, 100);
  }, []);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setSearchHistory(prev => {
      const updated = [query, ...prev.filter(item => item !== query)];
      return updated.slice(0, 10); // Keep only last 10 searches
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        searchResults,
        performSearch,
        isLoading,
        searchHistory,
        addToHistory,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
