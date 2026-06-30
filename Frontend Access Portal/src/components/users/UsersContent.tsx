
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users2 } from "lucide-react";
import UsersTable from "./UsersTable";
import { type User, mockUsers } from "@/data/mock-users";
import { useMemo, useState } from "react";
import { usePeerComparison } from "@/contexts/PeerComparisonContext";
import PeerComparisonDialog from "./comparison/PeerComparisonDialog";

const humanTypes: User['type'][] = ['Employee', 'Contractor', 'Partner'];
const nonHumanTypes: User['type'][] = ['Service Account'];

type IdentityType = "human" | "non-human" | undefined;

const UsersContent = ({ title = "Users", identityType }: { title?: string, identityType?: IdentityType }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { setIsDialogOpen } = usePeerComparison();

  const users = useMemo(() => {
    let baseUsers: User[];
    if (identityType === 'human') {
      baseUsers = mockUsers.filter(user => humanTypes.includes(user.type));
    } else if (identityType === 'non-human') {
      baseUsers = mockUsers.filter(user => nonHumanTypes.includes(user.type));
    } else {
      baseUsers = mockUsers;
    }
    
    if (searchTerm.trim() === '') {
        return baseUsers;
    }

    return baseUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.manager && user.manager.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [identityType, searchTerm]);

  const placeholderText = identityType === 'non-human' ? "Search Service Accounts..." : "Search Users...";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm py-4 z-10 border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder={placeholderText} 
                className="pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              <Users2 />
              Compare
            </Button>
          </div>
          
          <div className="flex-1 flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            {identityType !== 'non-human' && (
              <>
                <Button variant="secondary" size="sm" className="bg-slate-200">👤 Active Users</Button>
                <Button variant="ghost" size="sm" className="text-slate-500">⚪ Inactive Users</Button>
                <Button variant="ghost" size="sm" className="text-slate-500">👥 Managers</Button>
                <Button variant="ghost" size="sm" className="text-slate-500">🧟 Orphan Accounts</Button>
                <Button variant="ghost" size="sm" className="text-slate-500">⚠️ High Risk Users</Button>
              </>
            )}
          </div>
          <Button className="bg-brand-teal hover:bg-brand-teal/90">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>
      
      <UsersTable users={users} identityType={identityType} />
      <PeerComparisonDialog allUsers={users} />
    </div>
  );
};

export default UsersContent;
