import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search, User, Users, Building2, Briefcase,
  CheckCircle2, X
} from 'lucide-react';
import { AccessItem } from '@/data/mock-access-portal';
import { CategoryTileConfig } from '@/types/access-portal';
import { fetchAllUsers } from '../app-permissions/role-management/dialogs/utils/createRoleUtils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SelectableUser } from '@/data/mock-selectable-users';

interface TargetUserSelectionModalProps {
  open: boolean;
  conflictingUserIds?: string[];
  onOpenChange: (open: boolean) => void;
  accessItem: AccessItem | null;
  tileConfig: CategoryTileConfig | null;
  onConfirm: (data: {
    requestTarget: 'self' | 'others';
    beneficiaries: SelectableUser[];
  }) => void;
}

const TargetUserSelectionModal: React.FC<TargetUserSelectionModalProps> = ({
  open,
  onOpenChange,
  accessItem,
  tileConfig,
  conflictingUserIds = [],
  onConfirm,
}) => {
  const [requestTarget, setRequestTarget] = useState<'self' | 'others'>('self');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<SelectableUser[]>([]);

  // const [conflictingUserIds, setConflictingUserIds] = useState<string[]>([]);

  // NEW: User fetching state
  const [allUsers, setAllUsers] = useState<SelectableUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Check if tile allows request for others
  const allowRequestForOthers =
    tileConfig?.requestTypeConfig?.allowRequestForOthers ??
    (tileConfig as any)?.allowRequestForOthers ??
    false;

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      // Modal closed - reset all state
      setRequestTarget('self');
      setSearchQuery('');
      setSelectedDepartment('all');
      setSelectedRole('all');
      setSelectedUsers([]);
    }
  }, [open])

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const response = await fetchAllUsers(); // Your API call
      const transformedUsers = (response.users || []).map(user => ({
        id: user.id,
        // name: `${user.firstName} ${user.lastName}`, // Combine firstName and lastName
        name: user.username,
        email: user.email,
        username: user.username,
        // Add default/placeholder values for required fields
        department: 'IT', //  need to get this from your API or use a default
        role: 'Employee', //  need to get this from your API or use a default
        jobTitle: 'Employee', // need to get this from your API or use a default
        type: 'Employee' // Default type
      }));
      console.log(response)

      setAllUsers(transformedUsers || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      setUsersError(errorMessage);
      console.error('Error loading users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  console.log('[TargetUserSelectionModal] Config:', {
    open,
    allowRequestForOthers,
    tileConfig,
  });

  // Get eligible users based on tile eligibility rules
  const eligibleUsers = useMemo(() => {
    const allowedRoles = tileConfig?.requestEligibility?.allowedRoles || [];
    const allowedDepartments = tileConfig?.requestEligibility?.allowedDepartments || [];

    // If no restrictions, return all users
    if (allowedRoles.length === 0 && allowedDepartments.length === 0) {
      return allUsers;
    }

    // Filter users based on restrictions
    return allUsers.filter(user => {
      const matchesRole = allowedRoles.length === 0 || allowedRoles.includes(user.role);
      const matchesDepartment = allowedDepartments.length === 0 || allowedDepartments.includes(user.department);
      return matchesRole && matchesDepartment;
    });
  }, [allUsers, tileConfig]);

  //  Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return eligibleUsers.filter(user => {
      const matchesSearch = searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment;
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;

      return matchesSearch && matchesDepartment && matchesRole;
    });
  }, [eligibleUsers, searchQuery, selectedDepartment, selectedRole]);

  const departments = useMemo(() =>
    Array.from(new Set(allUsers.map(u => u.department))).sort(),
    [allUsers]
  );

  const roles = useMemo(() =>
    Array.from(new Set(allUsers.map(u => u.role))).sort(),
    [allUsers]
  );

  const toggleUser = (user: SelectableUser) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]); // Add to list instead of replacing
    }
  };

  const handleConfirm = () => {
    // Filter out conflicting users before confirming
    const validBeneficiaries = selectedUsers.filter(user => !isConflicting(user.id));

    console.log('[TargetUserSelectionModal] Confirming:', {
      requestTarget,
      beneficiaries: requestTarget === 'others' ? validBeneficiaries : [],
      removedConflicts: selectedUsers.length - validBeneficiaries.length,
    });

    onConfirm({
      requestTarget,
      beneficiaries: requestTarget === 'others' ? validBeneficiaries : [],
    });

    // Don't reset state here - parent will handle modal close on success
  };

  const canConfirm = () => {
    if (requestTarget === 'self') return true;
    if (selectedUsers.length === 0) return false;
    return true;
  };

  useEffect(() => {
    if (conflictingUserIds.length > 0) {
      setSelectedUsers(prev =>
        prev.filter(user => !conflictingUserIds.includes(user.id))
      );
    }
  }, [conflictingUserIds]);



  const handleClose = () => {
    onOpenChange(false);
    // Reset state
    setRequestTarget('self');
    setSearchQuery('');
    setSelectedDepartment('all');
    setSelectedRole('all');
    setSelectedUsers([]);

  };

  if (!accessItem) return null;

  const isConflicting = (userId: string) => conflictingUserIds.includes(userId);




  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Request Access For...
          </SheetTitle>
          <SheetDescription>
            Select who should receive access to <strong>{accessItem.name}</strong>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Target Selection */}
          <RadioGroup
            value={requestTarget}
            onValueChange={(value) => setRequestTarget(value as 'self' | 'others')}
            className="flex gap-4"
          >
            {/* For Myself - Always Available */}
            <div className="flex items-center space-x-2 flex-1 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="self" id="self" />
              <Label htmlFor="self" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">For Myself</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Request this access for your own account
                </p>
              </Label>
            </div>

            {/* For Others - Only show if tile allows it */}
            {allowRequestForOthers && (
              <div className="flex items-center space-x-2 flex-1 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="others" id="others" />
                <Label htmlFor="others" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">For Others</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Request on behalf of other users
                  </p>
                </Label>
              </div>
            )}
          </RadioGroup>

          {/* Show info message if request for others is disabled */}
          {!allowRequestForOthers && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> This tile only allows self-service requests. You can only request access for yourself.
              </p>
            </div>
          )}

          {/* User Selection UI - Only show if "others" is selected AND allowed */}
          {requestTarget === 'others' && allowRequestForOthers && (
            <>
              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-[180px]">
                      <Building2 className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-[180px]">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>


              {/* Selected Users Summary with Conflict Warning */}
              {selectedUsers.length > 0 && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Selected:</span>
                    {selectedUsers.map(user => {
                      const isConflict = isConflicting(user.id);
                      return (
                        <Badge
                          key={user.id}
                          variant={isConflict ? "destructive" : "secondary"}
                          className="gap-1"
                        >
                          {user.name}
                          {isConflict && <span className="text-xs">(Already has access)</span>}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => toggleUser(user)}
                          />
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Conflict Warning */}
                  {conflictingUserIds.length > 0 && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive font-medium">
                        ⚠️ Some users already have access to this item
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Please remove them from selection or proceed without them.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* User List with Conflict Indicators */}
              <ScrollArea className="flex-1 min-h-[200px] max-h-[250px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {filteredUsers.map(user => {
                    const isSelected = selectedUsers.some(u => u.id === user.id);
                    const isConflict = isConflicting(user.id);

                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isConflict
                          ? 'bg-destructive/5 border border-destructive/20'
                          : isSelected
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted/50'
                          }`}
                        onClick={() => !isConflict && toggleUser(user)}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={isConflict}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{user.name}</span>
                            {isConflict && (
                              <Badge variant="destructive" className="text-xs">
                                Has Access
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{user.jobTitle}</span>
                            <span>•</span>
                            <span>{user.department}</span>
                          </div>
                        </div>
                        {isSelected && !isConflict && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Selection info */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {filteredUsers.length} eligible users
                </span>
                <span className='text-amber-600'>
                  Selected: {selectedUsers.length}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm()}>
            {requestTarget === 'self'
              ? 'Add to Cart'
              : `Add for ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`
            }
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TargetUserSelectionModal;