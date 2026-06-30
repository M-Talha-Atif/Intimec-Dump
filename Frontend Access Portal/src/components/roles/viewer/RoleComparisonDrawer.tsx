
import React, { useMemo, useState } from 'react';
import { Role } from '@/types/roles';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, ArrowLeftRight } from 'lucide-react';
import { getRiskBadgeClass } from '@/utils/getRiskColor';

interface RoleComparisonDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceRole: Role;
  allRoles: Role[];
}

const RoleComparisonDrawer: React.FC<RoleComparisonDrawerProps> = ({
  open, onOpenChange, sourceRole, allRoles,
}) => {
  const [compareRoleId, setCompareRoleId] = useState<string>('');
  const compareRole = allRoles.find(r => r.id === compareRoleId);

  const comparison = useMemo(() => {
    if (!compareRole) return null;
    const sourceEntNames = new Set(sourceRole.entitlements.map(e => e.name));
    const compareEntNames = new Set(compareRole.entitlements.map(e => e.name));
    const shared = [...sourceEntNames].filter(n => compareEntNames.has(n));
    const uniqueSource = [...sourceEntNames].filter(n => !compareEntNames.has(n));
    const uniqueCompare = [...compareEntNames].filter(n => !sourceEntNames.has(n));
    const total = new Set([...sourceEntNames, ...compareEntNames]).size;
    const overlapPct = total > 0 ? Math.round((shared.length / total) * 100) : 0;
    return { shared, uniqueSource, uniqueCompare, overlapPct };
  }, [sourceRole, compareRole]);

  const availableRoles = allRoles.filter(r => r.id !== sourceRole.id && r.status === 'Enabled');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Role Comparison
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Role Selector */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Compare "{sourceRole.name}" with:
            </label>
            <Select value={compareRoleId} onValueChange={setCompareRoleId}>
              <SelectTrigger><SelectValue placeholder="Select a role to compare..." /></SelectTrigger>
              <SelectContent>
                {availableRoles.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {comparison && compareRole && (
            <>
              {/* Overlap Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="text-center">
                  <CardContent className="pt-4 pb-3">
                    <div className="text-3xl font-bold text-primary">{comparison.overlapPct}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Overlap</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-4 pb-3">
                    <div className="text-3xl font-bold text-foreground">{comparison.shared.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Shared Entitlements</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-4 pb-3">
                    <div className="text-3xl font-bold text-foreground">{comparison.uniqueSource.length + comparison.uniqueCompare.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Unique Entitlements</p>
                  </CardContent>
                </Card>
              </div>

              {/* Side-by-side metadata */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{sourceRole.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{sourceRole.type}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Classification</span><Badge variant="outline" className="text-xs">{sourceRole.classification}</Badge></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Users</span><span>{sourceRole.userCount}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Risk</span>
                      <Badge variant="outline" className={`text-xs ${getRiskBadgeClass(sourceRole.risk?.score || 'Low')}`}>{sourceRole.risk?.score || 'Low'}</Badge>
                    </div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Entitlements</span><span>{sourceRole.entitlements.length}</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{compareRole.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{compareRole.type}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Classification</span><Badge variant="outline" className="text-xs">{compareRole.classification}</Badge></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Users</span><span>{compareRole.userCount}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Risk</span>
                      <Badge variant="outline" className={`text-xs ${getRiskBadgeClass(compareRole.risk?.score || 'Low')}`}>{compareRole.risk?.score || 'Low'}</Badge>
                    </div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Entitlements</span><span>{compareRole.entitlements.length}</span></div>
                  </CardContent>
                </Card>
              </div>

              {/* Entitlement Comparison */}
              {comparison.shared.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Shared Entitlements ({comparison.shared.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {comparison.shared.map(name => (
                      <Badge key={name} variant="outline" className="text-xs border-green-300 text-green-700 dark:border-green-700 dark:text-green-400">{name}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {comparison.uniqueSource.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-blue-600" />
                    Unique to {sourceRole.name} ({comparison.uniqueSource.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {comparison.uniqueSource.map(name => (
                      <Badge key={name} variant="outline" className="text-xs border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400">{name}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {comparison.uniqueCompare.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-purple-600" />
                    Unique to {compareRole.name} ({comparison.uniqueCompare.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {comparison.uniqueCompare.map(name => (
                      <Badge key={name} variant="outline" className="text-xs border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400">{name}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!compareRole && (
            <div className="text-center py-12 text-muted-foreground">
              <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Select a role to compare</p>
              <p className="text-sm mt-1">Choose another role from the dropdown to see a side-by-side comparison.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RoleComparisonDrawer;
