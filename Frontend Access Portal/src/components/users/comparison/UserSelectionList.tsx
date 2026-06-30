
import React, { useState } from 'react';
import { type User } from '@/data/mock-users';
import { usePeerComparison } from '@/contexts/PeerComparisonContext';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

type UserSelectionListProps = {
  allUsers: User[];
};

const UserSelectionList = ({ allUsers }: UserSelectionListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const { selectedUsers, toggleUserSelection } = usePeerComparison();

  const departments = [...new Set(allUsers.flatMap(u => u.department ? [u.department] : []))];

  const filteredUsers = allUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDept = !departmentFilter || user.department === departmentFilter;
      return matchesSearch && matchesDept;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Search users by name or department..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mb-4 pb-4 border-b">
        <p className="text-sm font-medium text-slate-600 mb-2">Filter by Department</p>
        <div className="flex flex-wrap gap-2">
            <Badge 
                variant={!departmentFilter ? 'default' : 'outline'}
                onClick={() => setDepartmentFilter(null)}
                className="cursor-pointer transition-colors"
            >
                All Departments
            </Badge>
            {departments.map(dept => (
                <Badge 
                    key={dept} 
                    variant={departmentFilter === dept ? 'default' : 'outline'}
                    onClick={() => setDepartmentFilter(dept)}
                    className="cursor-pointer transition-colors"
                >
                    {dept}
                </Badge>
            ))}
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-2">Selected {selectedUsers.length} of 3 users.</p>
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="space-y-2">
          {filteredUsers.map(user => {
            const isSelected = selectedUsers.some(su => su.id === user.id);
            const isDisabled = !isSelected && selectedUsers.length >= 3;
            return (
              <div
                key={user.id}
                onClick={() => !isDisabled && toggleUserSelection(user)}
                className={`flex items-center p-3 rounded-md border transition-colors ${
                  isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Checkbox
                  checked={isSelected}
                  disabled={isDisabled}
                  id={`select-${user.id}`}
                  className="mr-4"
                  aria-label={`Select ${user.name}`}
                />
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.department} • {user.type}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserSelectionList;
