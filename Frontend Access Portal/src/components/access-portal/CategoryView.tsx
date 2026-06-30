
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, Grid, List } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  type: string;
  itemCount?: number;
  approvalRate?: string;
  lastUpdated?: string;
  tags?: string[];
}

interface CategoryViewProps {
  category: string;
  onBack: () => void;
  onItemSelect: (item: CategoryItem) => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({ 
  category, 
  onBack, 
  onItemSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data for different categories
  const getCategoryItems = (category: string): CategoryItem[] => {
    switch (category) {
      case 'applications':
        return [
          {
            id: 'app-1',
            name: 'Salesforce CRM',
            description: 'Customer relationship management platform',
            type: 'Business Application',
            itemCount: 45,
            approvalRate: '92%',
            lastUpdated: '2 days ago',
            tags: ['CRM', 'Sales', 'Cloud']
          },
          {
            id: 'app-2',
            name: 'SAP ERP',
            description: 'Enterprise resource planning system',
            type: 'Business Application',
            itemCount: 156,
            approvalRate: '87%',
            lastUpdated: '1 week ago',
            tags: ['ERP', 'Finance', 'HR']
          },
          {
            id: 'app-3',
            name: 'Microsoft 365',
            description: 'Office productivity suite',
            type: 'Business Application',
            itemCount: 89,
            approvalRate: '95%',
            lastUpdated: '3 days ago',
            tags: ['Productivity', 'Cloud', 'Collaboration']
          }
        ];
      case 'directories':
        return [
          {
            id: 'dir-1',
            name: 'Active Directory',
            description: 'Corporate directory service',
            type: 'LDAP Directory',
            itemCount: 234,
            approvalRate: '89%',
            lastUpdated: '1 day ago',
            tags: ['LDAP', 'Authentication', 'On-Premise']
          },
          {
            id: 'dir-2',
            name: 'Azure Entra ID',
            description: 'Cloud identity and access management',
            type: 'Cloud Directory',
            itemCount: 167,
            approvalRate: '93%',
            lastUpdated: '2 days ago',
            tags: ['Cloud', 'Identity', 'Microsoft']
          }
        ];
      case 'roles':
        return [
          {
            id: 'role-1',
            name: 'Finance Analyst',
            description: 'Access to financial reporting and analysis tools',
            type: 'Business Role',
            itemCount: 12,
            approvalRate: '91%',
            lastUpdated: '1 week ago',
            tags: ['Finance', 'Reporting', 'Analysis']
          },
          {
            id: 'role-2',
            name: 'HR Administrator',
            description: 'Human resources management and employee data access',
            type: 'Business Role',
            itemCount: 18,
            approvalRate: '88%',
            lastUpdated: '3 days ago',
            tags: ['HR', 'Administration', 'Employee Data']
          }
        ];
      case 'shared-folders':
        return [
          {
            id: 'folder-1',
            name: 'Finance Shared Drive',
            description: 'Shared financial documents and reports',
            type: 'Network Share',
            itemCount: 5,
            approvalRate: '85%',
            lastUpdated: '2 days ago',
            tags: ['Finance', 'Documents', 'On-Premise']
          },
          {
            id: 'folder-2',
            name: 'SharePoint Finance',
            description: 'Cloud-based financial collaboration space',
            type: 'Cloud Storage',
            itemCount: 8,
            approvalRate: '92%',
            lastUpdated: '1 day ago',
            tags: ['Finance', 'Cloud', 'SharePoint']
          }
        ];
      default:
        return [];
    }
  };

  const items = getCategoryItems(category);
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryTitle = (category: string) => {
    const titles: { [key: string]: string } = {
      'applications': 'Business Applications',
      'directories': 'Directory Services',
      'roles': 'Business Roles',
      'shared-folders': 'Shared Folders',
      'peers': 'Peer Access Suggestions',
      'oracle': 'Oracle Applications'
    };
    return titles[category] || 'Access Categories';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Portal
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getCategoryTitle(category)}
            </h1>
            <p className="text-gray-600 mt-1">
              Select a {category.replace('-', ' ')} to view available access options
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={`Search ${category.replace('-', ' ')}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Items Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        {filteredItems.map((item) => (
          <Card 
            key={item.id}
            className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => onItemSelect(item)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-start justify-between">
                <span>{item.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {item.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
              
              <div className="flex flex-wrap gap-1">
                {item.tags?.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t text-sm">
                <div>
                  <span className="text-gray-500">Items</span>
                  <div className="font-semibold">{item.itemCount}</div>
                </div>
                <div>
                  <span className="text-gray-500">Approval Rate</span>
                  <div className="font-semibold text-green-600">{item.approvalRate}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No {category.replace('-', ' ')} found matching your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryView;
