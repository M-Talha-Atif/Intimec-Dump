
import React, { useState, useEffect } from 'react';
import { TreeNode } from '@/types/hierarchical-delegation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, User, Settings, Shield, Database } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'object' | 'delegate' | 'settings';
  user: string;
  details: string;
  impact?: string;
}

interface ScopeAuditTabProps {
  nodeId: string;
  node?: TreeNode | null;
}

export function ScopeAuditTab({ nodeId, node }: ScopeAuditTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Generate mock audit data
  useEffect(() => {
    const mockLogs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-20T10:30:00Z',
        action: 'Object Assigned',
        category: 'object',
        user: 'john.doe@company.com',
        details: 'Assigned Salesforce application to scope',
        impact: 'Added 150 users to scope coverage'
      },
      {
        id: '2',
        timestamp: '2024-01-20T09:15:00Z',
        action: 'Delegate Added',
        category: 'delegate',
        user: 'admin@company.com',
        details: 'Added Jane Smith as Admin delegate',
        impact: 'Granted administrative access'
      },
      {
        id: '3',
        timestamp: '2024-01-19T16:45:00Z',
        action: 'Settings Updated',
        category: 'settings',
        user: 'john.doe@company.com',
        details: 'Enabled sibling access policy',
        impact: 'Expanded delegate permissions'
      },
      {
        id: '4',
        timestamp: '2024-01-19T14:20:00Z',
        action: 'Objects Bulk Unassign',
        category: 'object',
        user: 'jane.smith@company.com',
        details: 'Removed 5 users from scope',
        impact: 'Reduced scope coverage by 5 users'
      },
      {
        id: '5',
        timestamp: '2024-01-18T11:10:00Z',
        action: 'Delegate Permissions Updated',
        category: 'delegate',
        user: 'admin@company.com',
        details: 'Modified Mike Johnson permissions',
        impact: 'Restricted access to user management only'
      },
      {
        id: '6',
        timestamp: '2024-01-17T13:30:00Z',
        action: 'Scope Created',
        category: 'settings',
        user: 'admin@company.com',
        details: 'Initial scope configuration',
        impact: 'Created new delegation scope'
      }
    ];

    setAuditLogs(mockLogs);
  }, [nodeId]);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'object':
        return <Database className="h-4 w-4" />;
      case 'delegate':
        return <Shield className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'object':
        return 'bg-blue-100 text-blue-800';
      case 'delegate':
        return 'bg-green-100 text-green-800';
      case 'settings':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Audit Log</h3>
          <p className="text-sm text-muted-foreground">
            Track all changes made to this scope
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audit logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="object">Object Changes</SelectItem>
            <SelectItem value="delegate">Delegate Changes</SelectItem>
            <SelectItem value="settings">Settings Changes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Audit Log Entries */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || filterCategory !== 'all' 
                  ? 'No matching audit entries found'
                  : 'No audit entries available'
                }
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map(log => (
            <Card key={log.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-full ${getCategoryColor(log.category)}`}>
                      {getCategoryIcon(log.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{log.action}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {log.category}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {log.details}
                      </p>
                      
                      {log.impact && (
                        <p className="text-sm text-blue-600 font-medium">
                          Impact: {log.impact}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {auditLogs.filter(log => log.category === 'object').length}
              </p>
              <p className="text-sm text-muted-foreground">Object Changes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {auditLogs.filter(log => log.category === 'delegate').length}
              </p>
              <p className="text-sm text-muted-foreground">Delegate Changes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {auditLogs.filter(log => log.category === 'settings').length}
              </p>
              <p className="text-sm text-muted-foreground">Settings Changes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
