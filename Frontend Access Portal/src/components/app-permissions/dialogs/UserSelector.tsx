
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Building } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'Employee' | 'NonEmployee';
  department?: string;
}

interface UserSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  filterType?: 'Employee' | 'NonEmployee' | 'All';
  placeholder?: string;
}

// Mock users data
const mockUsers: User[] = [
  { id: '1', name: 'John Smith', email: 'john@company.com', type: 'Employee', department: 'Engineering' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', type: 'Employee', department: 'Marketing' },
  { id: '3', name: 'Mike Wilson', email: 'mike@contractor.com', type: 'NonEmployee' },
  { id: '4', name: 'Lisa Brown', email: 'lisa@company.com', type: 'Employee', department: 'HR' },
  { id: '5', name: 'David Chen', email: 'david@consultant.com', type: 'NonEmployee' },
];

const UserSelector: React.FC<UserSelectorProps> = ({
  value,
  onValueChange,
  filterType = 'All',
  placeholder = "Select a user..."
}) => {
  const filteredUsers = React.useMemo(() => {
    if (filterType === 'All') return mockUsers;
    return mockUsers.filter(user => user.type === filterType);
  }, [filterType]);

  const selectedUser = React.useMemo(() => {
    return filteredUsers.find(user => user.id === value);
  }, [filteredUsers, value]);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {selectedUser && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{selectedUser.name}</span>
              <Badge variant={selectedUser.type === 'Employee' ? 'default' : 'secondary'} className="text-xs">
                {selectedUser.type}
              </Badge>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {filteredUsers.length === 0 ? (
          <SelectItem value="" disabled>
            No users found
          </SelectItem>
        ) : (
          filteredUsers.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex items-center gap-2 w-full">
                <User className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                  {user.department && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building className="h-3 w-3" />
                      {user.department}
                    </div>
                  )}
                </div>
                <Badge variant={user.type === 'Employee' ? 'default' : 'secondary'} className="text-xs ml-auto">
                  {user.type}
                </Badge>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default UserSelector;
