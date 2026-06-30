
import React, { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Bot, UserCheck, Plus, X, Search, AlertCircle, CheckCircle, User, Loader2 } from 'lucide-react';
import { DynamicRulesBuilder } from './DynamicRulesBuilder';
import { createGroup, updateGroup, checkNameUnique, DynamicRule, PreviewResult } from '@/services/groups';
import { searchIdentities, Identity } from '@/services/identities';
import { toast } from "@/hooks/use-toast";

interface CreateIdentityGroupModalProps {
  isOpen: boolean;
  group?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateIdentityGroupModal({ isOpen, group, onClose, onSuccess }: CreateIdentityGroupModalProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!group;

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [groupType, setGroupType] = useState<'static' | 'dynamic'>('static');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [selectedIdentities, setSelectedIdentities] = useState<Identity[]>([]);
  const [owners, setOwners] = useState<Identity[]>([]);
  const [rules, setRules] = useState<DynamicRule[]>([]);
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [ownerSearchTerm, setOwnerSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'employee' | 'non-employee' | 'non-human'>('all');
  const [isDirty, setIsDirty] = useState(false);
  const [showDirtyDialog, setShowDirtyDialog] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Load existing group data for edit mode
  useEffect(() => {
    if (group) {
      setGroupName(group.name);
      setDescription(group.description || '');
      setEmail(group.email || '');
      setGroupType(group.type);
      setTags(group.tags || []);
      setOwners(group.ownerDetails?.map((o: any) => ({ id: o.id, name: o.name, email: o.email, type: 'employee', riskScore: 0 })) || []);
      setRules(group.rules || []);
    }
  }, [group]);

  // Track dirty state
  useEffect(() => {
    if (isOpen) {
      const hasChanges = groupName.trim() !== '' || description.trim() !== '' ||
        email.trim() !== '' || tags.length > 0 || selectedIdentities.length > 0 ||
        owners.length > 0 || rules.length > 0;
      setIsDirty(hasChanges);
    }
  }, [groupName, description, email, tags, selectedIdentities, owners, rules, isOpen]);

  // Debounced identity search
  const { data: identitiesData, isLoading: isLoadingIdentities } = useQuery({
    queryKey: ['identities', searchTerm, filterType],
    queryFn: () => searchIdentities({
      query: searchTerm,
      type: filterType === 'all' ? undefined : filterType
    }),
    enabled: isOpen
  });

  // Debounced owner search
  const { data: ownersData, isLoading: isLoadingOwners } = useQuery({
    queryKey: ['owners', ownerSearchTerm],
    queryFn: () => searchIdentities({ query: ownerSearchTerm, type: 'employee' }),
    enabled: isOpen
  });

  const filteredIdentities = useMemo(() => {
    if (!identitiesData) return [];
    return identitiesData.identities.filter(identity =>
      !selectedIdentities.find(sel => sel.id === identity.id) &&
      !owners.find(o => o.id === identity.id)
    );
  }, [identitiesData, selectedIdentities, owners]);

  const filteredOwners = useMemo(() => {
    if (!ownersData) return [];
    return ownersData.identities.filter(identity =>
      !owners.find(o => o.id === identity.id)
    );
  }, [ownersData, owners]);

  // Name uniqueness validation
  const validateName = async (name: string) => {
    if (!name.trim()) {
      setNameError('Group name is required');
      return false;
    }
    if (name.length > 100) {
      setNameError('Group name must be less than 100 characters');
      return false;
    }
    const isUnique = await checkNameUnique(name, group?.id);
    if (!isUnique) {
      setNameError('A group with this name already exists');
      return false;
    }
    setNameError('');
    return true;
  };

  // Email validation
  const validateEmail = (emailValue: string) => {
    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setEmailError('Invalid email format');
      return false;
    }
    if (emailValue && emailValue.length > 255) {
      setEmailError('Email must be less than 255 characters');
      return false;
    }
    setEmailError('');
    return true;
  };

  const createMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      onSuccess?.();
      resetForm();
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      onSuccess?.();
      resetForm();
      onClose();
    }
  });

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addIdentity = (identity: Identity) => {
    setSelectedIdentities([...selectedIdentities, identity]);
    setSearchTerm('');
  };

  const removeIdentity = (identityId: string) => {
    setSelectedIdentities(selectedIdentities.filter(id => id.id !== identityId));
  };

  const addOwner = (owner: Identity) => {
    setOwners([...owners, owner]);
    setOwnerSearchTerm('');
  };

  const removeOwner = (ownerId: string) => {
    setOwners(owners.filter(o => o.id !== ownerId));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'employee': return <Users className="h-4 w-4 text-green-600" />;
      case 'non-employee': return <UserCheck className="h-4 w-4 text-purple-600" />;
      case 'non-human': return <Bot className="h-4 w-4 text-orange-600" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-green-600';
    if (score <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSubmit = async () => {
    // Validate
    const isNameValid = await validateName(groupName);
    const isEmailValid = validateEmail(email);

    if (!isNameValid || !isEmailValid) {
      return;
    }

    if (owners.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one owner is required",
        variant: "destructive"
      });
      return;
    }

    if (groupType === 'dynamic' && rules.length === 0) {
      toast({
        title: "Validation Error",
        description: "Dynamic groups require at least one rule",
        variant: "destructive"
      });
      return;
    }

    if (groupType === 'static' && selectedIdentities.length === 0) {
      toast({
        title: "Validation Error",
        description: "Static groups require at least one member",
        variant: "destructive"
      });
      return;
    }

    const data = {
      name: groupName.trim(),
      description: description.trim(),
      email: email.trim() || undefined,
      type: groupType,
      tags,
      owners: owners.map(o => o.email),
      rules: groupType === 'dynamic' ? rules : undefined,
      riskLevel: 'low' as const
    };

    if (isEditMode && group) {
      updateMutation.mutate({ id: group.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const resetForm = () => {
    setGroupName('');
    setDescription('');
    setEmail('');
    setGroupType('static');
    setTags([]);
    setCurrentTag('');
    setSelectedIdentities([]);
    setOwners([]);
    setRules([]);
    setPreview(null);
    setSearchTerm('');
    setOwnerSearchTerm('');
    setFilterType('all');
    setIsDirty(false);
    setNameError('');
    setEmailError('');
  };

  const handleClose = () => {
    if (isDirty) {
      setShowDirtyDialog(true);
    } else {
      resetForm();
      onClose();
    }
  };

  const confirmClose = () => {
    setShowDirtyDialog(false);
    resetForm();
    onClose();
  };

  const isFormValid = useMemo(() => {
    return groupName.trim() !== '' &&
      owners.length > 0 &&
      !nameError &&
      !emailError &&
      (groupType === 'static' ? selectedIdentities.length > 0 : rules.length > 0);
  }, [groupName, owners, nameError, emailError, groupType, selectedIdentities, rules]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {/* <Users className="h-5 w-5" /> */}
              <span>{isEditMode ? 'Edit' : 'Create'} Identity Group</span>
            </DialogTitle>

            <DialogDescription className="text-muted-foreground">
              {isEditMode
                ? "Update the identity group configuration, including membership rules, ownership, and governance settings."
                : "Create a new identity group to organize users and manage access assignments, ownership, and governance policies."}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full pt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="owners">Owners *</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Group Name *</Label>
                  <Input
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => {
                      setGroupName(e.target.value);
                      if (e.target.value) validateName(e.target.value);
                    }}
                    onBlur={() => groupName && validateName(groupName)}
                    className={nameError ? 'border-destructive' : ''}
                  />
                  {nameError && (
                    <p className="text-sm text-destructive">{nameError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Group Email</Label>
                  <Input
                    placeholder="group@company.com"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validateEmail(e.target.value);
                    }}
                    onBlur={() => validateEmail(email)}
                    className={emailError ? 'border-destructive' : ''}
                  />
                  {emailError && (
                    <p className="text-sm text-destructive">{emailError}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the purpose and scope of this identity group"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">{description.length}/500</p>
              </div>

              <div className="space-y-2">
                <Label>Group Type *</Label>
                <Select value={groupType} onValueChange={(value: 'static' | 'dynamic') => setGroupType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="static">Static (manually managed)</SelectItem>
                    <SelectItem value="dynamic">Dynamic (rule-based)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {groupType === 'static'
                    ? 'Members are added and removed manually'
                    : 'Members are automatically added/removed based on rules'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add tag (e.g., SOX, Critical, IT-Operations)"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    maxLength={50}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="owners" className="space-y-4 pt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  At least one owner is required. Owners can manage the group and its members.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Owners</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees to add as owners..."
                      className="pl-10"
                      value={ownerSearchTerm}
                      onChange={(e) => setOwnerSearchTerm(e.target.value)}
                    />
                  </div>

                  {isLoadingOwners ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {filteredOwners.length > 0 ? (
                        filteredOwners.slice(0, 10).map((owner) => (
                          <div key={owner.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
                            <div className="flex items-center space-x-3">
                              <Users className="h-4 w-4 text-green-600" />
                              <div>
                                <div className="font-medium text-sm">{owner.name}</div>
                                <div className="text-xs text-muted-foreground">{owner.email}</div>
                              </div>
                            </div>
                            <Button size="sm" onClick={() => addOwner(owner)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      ) : ownerSearchTerm ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No employees found</p>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Owners ({owners.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {owners.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No owners selected</p>
                  ) : (
                    <div className="space-y-2">
                      {owners.map((owner) => (
                        <div key={owner.id} className="flex items-center justify-between p-2 border rounded-lg bg-muted/30">
                          <div className="flex items-center space-x-3">
                            <Users className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="font-medium text-sm">{owner.name}</div>
                              <div className="text-xs text-muted-foreground">{owner.email}</div>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => removeOwner(owner.id)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-4 pt-4">
              {groupType === 'dynamic' ? (
                <div>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Define rules to automatically include identities in this group. Members will be dynamically added/removed based on these rules.
                    </AlertDescription>
                  </Alert>
                  <DynamicRulesBuilder rules={rules} onChange={setRules} onPreview={setPreview} />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Identity Search & Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Available Identities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search identities..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="non-employee">Non-Employee</SelectItem>
                            <SelectItem value="non-human">Non-Human</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {isLoadingIdentities ? (
                        <div className="flex justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : (
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {filteredIdentities.length > 0 ? (
                            filteredIdentities.slice(0, 20).map((identity) => (
                              <div key={identity.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
                                <div className="flex items-center space-x-3">
                                  {getTypeIcon(identity.type)}
                                  <div>
                                    <div className="font-medium text-sm">{identity.name}</div>
                                    <div className="text-xs text-muted-foreground">{identity.email}</div>
                                    {identity.department && (
                                      <div className="text-xs text-muted-foreground">{identity.department}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs font-medium ${getRiskColor(identity.riskScore)}`}>
                                    {identity.riskScore}
                                  </span>
                                  <Button size="sm" onClick={() => addIdentity(identity)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : searchTerm ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No identities found</p>
                          ) : null}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Selected Members */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Selected Members ({selectedIdentities.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {selectedIdentities.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No members selected</p>
                        ) : (
                          selectedIdentities.map((identity) => (
                            <div key={identity.id} className="flex items-center justify-between p-2 border rounded-lg bg-muted/30">
                              <div className="flex items-center space-x-3">
                                {getTypeIcon(identity.type)}
                                <div>
                                  <div className="font-medium text-sm">{identity.name}</div>
                                  <div className="text-xs text-muted-foreground">{identity.email}</div>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => removeIdentity(identity.id)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="review" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Review Group Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Name:</span>
                      <p className="font-medium">{groupName || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Type:</span>
                      <p className="font-medium capitalize">{groupType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Email:</span>
                      <p className="font-medium">{email || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Owners:</span>
                      <p className="font-medium">{owners.length}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Members:</span>
                      <p className="font-medium">
                        {groupType === 'dynamic'
                          ? `${preview?.totalMatched || 0} (dynamic)`
                          : selectedIdentities.length}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Rules:</span>
                      <p className="font-medium">{groupType === 'dynamic' ? rules.length : 'N/A'}</p>
                    </div>
                  </div>

                  {description && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Description:</span>
                      <p className="text-sm mt-1">{description}</p>
                    </div>
                  )}

                  {owners.length > 0 && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Owners:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {owners.map((owner) => (
                          <Badge key={owner.id} variant="secondary">{owner.name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tags.map((tag, index) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {isFormValid ? (
                    <div className="flex items-center space-x-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="text-sm">Ready to {isEditMode ? 'update' : 'create'} identity group</span>
                    </div>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please complete all required fields:
                        <ul className="list-disc list-inside mt-1 text-xs">
                          {!groupName.trim() && <li>Group name is required</li>}
                          {owners.length === 0 && <li>At least one owner is required</li>}
                          {groupType === 'static' && selectedIdentities.length === 0 && <li>At least one member is required for static groups</li>}
                          {groupType === 'dynamic' && rules.length === 0 && <li>At least one rule is required for dynamic groups</li>}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update' : 'Create'} Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDirtyDialog} onOpenChange={setShowDirtyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClose} className="bg-destructive text-destructive-foreground">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
