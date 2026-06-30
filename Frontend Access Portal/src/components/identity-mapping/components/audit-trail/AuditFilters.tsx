import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar, Filter, User } from "lucide-react";

interface AuditFiltersProps {
  searchTerm: string;
  timeFilter: string;
  actionFilter: string;
  userFilter: string;
  uniqueUsers: string[];
  onSearchChange: (value: string) => void;
  onTimeFilterChange: (value: string) => void;
  onActionFilterChange: (value: string) => void;
  onUserFilterChange: (value: string) => void;
}

export const AuditFilters = ({
  searchTerm,
  timeFilter,
  actionFilter,
  userFilter,
  uniqueUsers,
  onSearchChange,
  onTimeFilterChange,
  onActionFilterChange,
  onUserFilterChange,
}: AuditFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search mappings, users..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={timeFilter} onValueChange={onTimeFilterChange}>
        <SelectTrigger>
          <Calendar className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1h">Last Hour</SelectItem>
          <SelectItem value="24h">Last 24 Hours</SelectItem>
          <SelectItem value="7d">Last 7 Days</SelectItem>
          <SelectItem value="30d">Last 30 Days</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>
      <Select value={actionFilter} onValueChange={onActionFilterChange}>
        <SelectTrigger>
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Actions</SelectItem>
          <SelectItem value="CREATE">Create</SelectItem>
          <SelectItem value="UPDATE">Update</SelectItem>
          <SelectItem value="DELETE">Delete</SelectItem>
          <SelectItem value="BULK_UPDATE">Bulk Update</SelectItem>
          <SelectItem value="SYNC">Sync</SelectItem>
        </SelectContent>
      </Select>
      <Select value={userFilter} onValueChange={onUserFilterChange}>
        <SelectTrigger>
          <User className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          {uniqueUsers.map((user) => (
            <SelectItem key={user} value={user}>
              {user}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
