import * as React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Role, RoleFilterState } from '@/types/roles';
import { Briefcase, Building, Search, Server, AlertTriangle, ChevronDown, Ban, Filter, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getRoleHealthIssues } from '@/lib/role-health';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import useIdentity from '@/hooks/identities/useIdentity';
import { IDENTITY_ENTITY_TYPES } from '@/constants/identity';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ResolvedOwner: React.FC<{ owner: string | undefined }> = ({ owner }) => {
  const isUuid = owner ? UUID_REGEX.test(owner) : false;
  const { data: identity, isLoading } = useIdentity(
    isUuid ? IDENTITY_ENTITY_TYPES.EMPLOYEE : null,
    isUuid ? owner! : null
  );

  if (!owner) return <span>N/A</span>;
  if (!isUuid) return <span>{owner}</span>;
  if (isLoading) return <Skeleton className="h-3 w-24 inline-block" />;

  const core = identity?.coreAttributes;
  if (!core) return <span>{owner.substring(0, 8)}…</span>;

  const name = core.displayName
    ? String(core.displayName)
    : core.firstName || core.lastName
      ? `${String(core.firstName ?? '')} ${String(core.lastName ?? '')}`.trim()
      : core.username
        ? String(core.username)
        : core.email
          ? String(core.email)
          : `${owner.substring(0, 8)}…`;

  return <span>{name}</span>;
};

interface RoleHierarchyTreeProps {
  roles: Role[];
  selectedRole: Role | null;
  onSelectRole: (role: Role) => void;
  filters: RoleFilterState;
  onFiltersChange: (filters: RoleFilterState) => void;
  onToggleFilters: () => void;
}

const ICONS: { [key: string]: React.ElementType } = {
  'Functional Role': Building,
  'Business Role': Briefcase,
  'Technical Role': Server,
  'Application Role': Server,
};

const ROLE_TYPE_ICONS: { [key: string]: React.ElementType } = {
  ...ICONS,
  'Disabled Roles': Ban,
}

const ROLE_TYPE_ORDER = ['Functional Role', 'Business Role', 'Application Role', 'Technical Role', 'Disabled Roles'];

const RoleHierarchyTree = ({ roles, selectedRole, onSelectRole, filters, onFiltersChange, onToggleFilters }: RoleHierarchyTreeProps) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredRoles = React.useMemo(() => roles.filter(role => {
    const searchMatch = role.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeMatch = filters.types.length === 0 || filters.types.includes(role.type);
    const statusMatch = filters.statuses.length === 0 || filters.statuses.includes(role.status);
    const riskMatch = filters.risks.length === 0 || (role.risk && filters.risks.includes(role.risk.score));
    const classMatch = filters.classifications.length === 0 || filters.classifications.includes(role.classification);
    const buMatch = filters.businessUnits.length === 0 || filters.businessUnits.includes(role.businessUnit);
    
    return searchMatch && typeMatch && statusMatch && riskMatch && classMatch && buMatch;
  }), [roles, searchTerm, filters]);

  const groupedRoles = React.useMemo(() => {
    return filteredRoles.reduce((acc, role) => {
      const unit = role.businessUnit;
      if (!acc[unit]) {
        acc[unit] = {};
      }
      const groupKey = role.status === 'disabled' ? 'Disabled Roles' : role.type;
      if (!acc[unit][groupKey]) {
        acc[unit][groupKey] = [];
      }
      acc[unit][groupKey].push(role);
      return acc;
    }, {} as Record<string, Record<string, Role[]>>);
  }, [filteredRoles]);


  const businessUnits = Object.keys(groupedRoles).sort();

  const activeFilterCount = filters.types.length + filters.statuses.length + filters.risks.length + filters.classifications.length + filters.businessUnits.length;

  const clearFilters = () => {
    onFiltersChange({ types: [], statuses: [], risks: [], classifications: [], businessUnits: [] });
  };
  
  const handleRemoveFilter = <K extends keyof RoleFilterState>(
    category: K, 
    value: RoleFilterState[K][number]
  ) => {
    const newFilters = {
      ...filters,
      [category]: (filters[category] as any[]).filter(item => item !== value),
    };
    onFiltersChange(newFilters);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Role Navigator</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search roles..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="relative shrink-0" onClick={onToggleFilters}>
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-teal text-white text-[10px]">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
        {activeFilterCount > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 items-center">
            {filters.types.map(f => (
                <Badge key={f} variant="secondary" className="cursor-pointer flex items-center" onClick={() => handleRemoveFilter('types', f)}>
                    {f} <X className="ml-1 h-3 w-3" />
                </Badge>
            ))}
            {filters.statuses.map(f => (
                <Badge key={f} variant="secondary" className="cursor-pointer flex items-center" onClick={() => handleRemoveFilter('statuses', f)}>
                    {f} <X className="ml-1 h-3 w-3" />
                </Badge>
            ))}
            {filters.risks.map(f => (
                <Badge key={f} variant="secondary" className="cursor-pointer flex items-center" onClick={() => handleRemoveFilter('risks', f)}>
                    Risk: {f} <X className="ml-1 h-3 w-3" />
                </Badge>
            ))}
            {filters.classifications.map(f => (
                <Badge key={f} variant="secondary" className="cursor-pointer flex items-center" onClick={() => handleRemoveFilter('classifications', f)}>
                    {f} <X className="ml-1 h-3 w-3" />
                </Badge>
            ))}
            {filters.businessUnits.map(f => (
                <Badge key={f} variant="secondary" className="cursor-pointer flex items-center" onClick={() => handleRemoveFilter('businessUnits', f)}>
                    {f} <X className="ml-1 h-3 w-3" />
                </Badge>
            ))}
            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-brand-teal hover:bg-brand-teal/10" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>
      <TooltipProvider delayDuration={200}>
        <div className="flex-1 overflow-y-auto">
          {filteredRoles.length > 0 ? (
            <Accordion type="multiple" defaultValue={businessUnits} className="p-2">
              {businessUnits.map(unit => (
                <AccordionItem value={unit} key={unit} className="border-b-0">
                  <AccordionTrigger className="text-sm font-semibold text-slate-600 hover:no-underline py-2 px-2 rounded hover:bg-slate-100">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>{unit}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-3 pt-1 pb-0">
                    {ROLE_TYPE_ORDER
                      .filter(type => groupedRoles[unit][type])
                      .map(roleType => {
                        const rolesInGroup = groupedRoles[unit][roleType];
                        const GroupIcon = ROLE_TYPE_ICONS[roleType] || Briefcase;
                        const isDisabledGroup = roleType === 'Disabled Roles';

                        return (
                          <Collapsible key={roleType} defaultOpen={!isDisabledGroup} className="mb-1">
                            <CollapsibleTrigger className="flex items-center w-full text-left text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded p-1.5 group">
                              <GroupIcon className={`mr-2 h-3.5 w-3.5 ${isDisabledGroup ? 'text-amber-600' : ''}`} />
                              <span className="flex-1">{roleType}</span>
                              <span className="text-slate-400 mr-1">({rolesInGroup.length})</span>
                              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-4 pt-1">
                              {rolesInGroup.map(role => {
                                const Icon = ICONS[role.type] || Briefcase;
                                const healthIssues = getRoleHealthIssues(role);
                                return (
                                  <HoverCard key={role.id} openDelay={300} closeDelay={100}>
                                    <HoverCardTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        onClick={() => onSelectRole(role)}
                                        className={`w-full justify-start h-auto py-1.5 px-2 mb-1 text-left ${selectedRole?.id === role.id ? 'bg-brand-teal/10 text-brand-teal font-semibold' : 'text-slate-700'} ${role.status === 'Deprecated' ? 'opacity-60' : ''}`}
                                      >
                                        <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
                                        <span className="truncate flex-1">{role.name}</span>
                                        {healthIssues.length > 0 && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <AlertTriangle className="ml-2 h-4 w-4 text-amber-500" />
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                              <p className="font-semibold mb-1">Health Issues:</p>
                                              <ul className="list-disc list-inside text-xs space-y-1">
                                                {healthIssues.map(issue => <li key={issue.key}>{issue.message}</li>)}
                                              </ul>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </Button>
                                    </HoverCardTrigger>
                                    <HoverCardContent side="right" align="start" className="w-80 z-50">
                                      <div className="flex flex-col gap-2">
                                        <h4 className="font-semibold text-slate-900">{role.name}</h4>
                                        <p className="text-sm text-slate-600 leading-snug">{role.aiSummary || role.description}</p>
                                        <div className="text-xs text-slate-500 space-y-1 mt-2 border-t pt-2">
                                          <div className="flex justify-between">
                                            <span className="font-semibold text-slate-700">Owner:</span>
                                            <ResolvedOwner owner={role.owner} />
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-semibold text-slate-700">Risk:</span>
                                            <span>{role.risk?.score || 'Low'}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-semibold text-slate-700">Type:</span>
                                            <span>{role.type}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </HoverCardContent>
                                  </HoverCard>
                                );
                              })}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center p-8 text-sm text-slate-500">
              <p className="font-semibold mb-2">No roles found</p>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default RoleHierarchyTree;
