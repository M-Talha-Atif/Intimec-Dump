import * as React from 'react';
import { Role } from '@/types/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pencil, Eye, Bot,
  LayoutDashboard, ShieldCheck, Link, AlertTriangle,
  Users, History, Target, User, Calendar, FileText, ArrowLeftRight,
  Shield, CheckCircle, XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { getRoleHealthIssues } from '@/lib/role-health';
import { getRiskBadgeClass, getRiskIconColor } from '@/utils/getRiskColor';
import RoleOverviewViewer from './RoleOverviewViewer';
import RoleEntitlementsViewer from './RoleEntitlementsViewer';
import RoleRelationshipGraph from '../RoleRelationshipGraph';
import RoleMembershipRulesViewer from './RoleMembershipRulesViewer';
import RoleHistoryViewer from './RoleHistoryViewer';
import RoleComparisonDrawer from './RoleComparisonDrawer';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import useIdentity from '@/hooks/identities/useIdentity';
import { IDENTITY_ENTITY_TYPES } from '@/constants/identity';
import '@xyflow/react/dist/style.css';
import IconTabs from '@/components/shared/IconTabs';

interface RoleViewerProps {
  role: Role;
  allRoles: Role[];
  onEdit: () => void;
  onSelectRole: (role: Role) => void;
}

/**
 * Formats an epoch timestamp (seconds or milliseconds) into a human-readable date string.
 * Handles both Unix seconds (e.g., 1776434513.311470000) and milliseconds (e.g., 1776434513311).
 * Also handles ISO date strings. Returns a fallback string if the value is missing or invalid.
 */
const formatEpochDate = (epoch: number | string | undefined | null, fallback = '—'): string => {
  if (epoch == null) return fallback;

  // Handle ISO / date strings
  if (typeof epoch === 'string') {
    const parsed = new Date(epoch);
    if (!isNaN(parsed.getTime())) {
      return format(parsed, 'MMM d, yyyy h:mm a');
    }
    const num = parseFloat(epoch);
    if (!isNaN(num) && num > 0) {
      const ms = num < 1e12 ? num * 1000 : num;
      return format(new Date(ms), 'MMM d, yyyy h:mm a');
    }
    return fallback;
  }

  // Handle numeric epoch
  if (typeof epoch === 'number') {
    if (isNaN(epoch) || epoch <= 0) return fallback;
    const ms = epoch < 1e12 ? epoch * 1000 : epoch;
    try {
      return format(new Date(ms), 'MMM d, yyyy h:mm a');
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const RoleViewer: React.FC<RoleViewerProps> = ({
  role,
  allRoles,
  onEdit,
  onSelectRole
}) => {
  const [isCompareOpen, setIsCompareOpen] = React.useState(false);
  const healthIssues = getRoleHealthIssues(role);
  const riskScore = role.risk?.score || 'Low';
  const highRiskEntitlements = role.entitlements.filter(e => e.isRisky);
  const adminEntitlements = role.entitlements.filter(e => e.privilegeLevel === 'Admin');

  // Detect if role.owner is a UUID (needs identity resolution) or already a display name
  const isOwnerUuid = role.owner
    ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(role.owner)
    : false;

  // Resolve owner identity once — shared across header and overview tab
  const {
    data: ownerIdentity,
    isLoading: ownerLoading,
  } = useIdentity(
    isOwnerUuid ? IDENTITY_ENTITY_TYPES.EMPLOYEE : null,
    isOwnerUuid ? role.owner : null
  );

  /**
   * Resolved owner display name.
   * - null means still loading (show skeleton)
   * - string means resolved (show name)
   */
  const ownerDisplayName = React.useMemo(() => {
    // No owner set
    if (!role.owner) return 'Unassigned';

    // Owner is already a human-readable name, not a UUID
    if (!isOwnerUuid) return role.owner;

    // Still fetching from identity service
    if (ownerLoading) return null;

    // Identity not found — fallback to truncated UUID
    if (!ownerIdentity?.coreAttributes) return `${role.owner.substring(0, 8)}…`;

    // Resolve best available name from core attributes
    const core = ownerIdentity.coreAttributes;
    return core.displayName
      ? String(core.displayName)
      : core.firstName || core.lastName
        ? `${String(core.firstName ?? '')} ${String(core.lastName ?? '')}`.trim()
        : core.username
          ? String(core.username)
          : core.email
            ? String(core.email)
            : `${role.owner.substring(0, 8)}…`;
  }, [role.owner, isOwnerUuid, ownerLoading, ownerIdentity]);

  return (
    <div className="space-y-0">
      {/* Role Header Section */}
      <div className="bg-card p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <h1 className="text-2xl font-bold text-foreground">{role.name}</h1>
              <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:border-blue-700 dark:text-blue-400">
                <Eye className="h-3 w-3 mr-1" />
                Viewing
              </Badge>
            </div>

            <p className="text-muted-foreground mb-4 max-w-3xl">{role.description}</p>

            {/* AI-Generated Summary */}
            {role.aiSummary && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-1">AI-generated Summary</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-400">{role.aiSummary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Role Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {/* Function */}
              <div className="flex items-center space-x-3">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Function</div>
                  <div className="font-medium">{role.businessFunction || role.businessUnit}</div>
                </div>
              </div>

              {/* Classification */}
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Classification</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(Array.isArray(role.classification)
                      ? role.classification
                      : role.classification
                        ? [role.classification]
                        : []
                    ).length > 0 ? (
                      (Array.isArray(role.classification)
                        ? role.classification
                        : [role.classification]
                      ).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className={cn(
                            "px-2 py-1",
                            tag === 'Admin Role'
                              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800'
                              : tag === 'Privileged'
                                ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800'
                                : tag === 'Sensitive'
                                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800'
                                  : 'bg-muted text-muted-foreground border'
                          )}
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary" className="px-2 py-1 bg-muted text-muted-foreground border">
                        Standard
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-3">
                {role.status === 'Enabled' ? (
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Status</div>
                  <Badge
                    variant="outline"
                    className={cn(
                      role.status === 'enabled'
                        ? 'border-green-300 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-700 dark:text-green-400'
                        : 'border-muted text-muted-foreground'
                    )}
                  >
                  {role?.status ? role.status.charAt(0).toUpperCase() + role.status.slice(1).toLowerCase() : ''}
                  </Badge>
                </div>
              </div>

              {/* Owner — resolved once, shared with overview tab */}
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Owner</div>
                  <div className="font-medium">
                    {ownerDisplayName === null ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      <span>{ownerDisplayName}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>


            {/* Tags */}
            {role.tags && role.tags.length > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                {role.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsCompareOpen(true)} className="flex items-center space-x-2">
              <ArrowLeftRight className="h-4 w-4" />
              <span>Compare</span>
            </Button>
            <Button onClick={onEdit} className="flex items-center space-x-2">
              <Pencil className="h-4 w-4" />
              <span>Edit Role</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Role Tabs */}
      <Tabs defaultValue="overview" className="bg-card">
        <div className="px-6">
          <IconTabs
            columns={6}
            tabs={[
              { value: "overview", label: "Overview", icon: LayoutDashboard },
              { value: "entitlements", label: "Entitlements", icon: ShieldCheck },
              { value: "relationships", label: "Relationships", icon: Link },
              { value: "risk", label: "Risk Insights", icon: AlertTriangle },
              { value: "membership", label: "Membership", icon: Users },
              { value: "history", label: "History", icon: History },
            ]}
          />
        </div>

        <div className="p-6">
          <TabsContent value="overview" className="mt-0">
            <RoleOverviewViewer role={role} ownerDisplayName={ownerDisplayName} />
          </TabsContent>

          <TabsContent value="entitlements" className="mt-0">
            <RoleEntitlementsViewer role={role} />
          </TabsContent>

          <TabsContent value="relationships" className="mt-0">
            <div className="h-[600px]">
              <RoleRelationshipGraph role={role} allRoles={allRoles} onSelectRole={onSelectRole} />
            </div>
          </TabsContent>

          <TabsContent value="risk" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>AI-Powered Risk & Health Analysis</span>
                  <InfoTooltip text="Automated analysis of risk factors, entitlement risks, SoD conflicts, and governance health issues for this role." />
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Dynamic risk assessment based on role composition, peer comparison, and governance posture.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Risk Score */}
                  <div>
                    <h3 className="font-medium mb-3">Overall Risk Score</h3>
                    <div className={cn("flex items-center justify-center p-8 rounded-lg border", getRiskBadgeClass(riskScore))}>
                      <div className="text-center">
                        <AlertTriangle className={cn("h-8 w-8 mx-auto mb-2", getRiskIconColor(riskScore))} />
                        <div className={cn("text-lg font-bold", getRiskIconColor(riskScore))}>{riskScore} Risk</div>
                        <div className="text-sm text-muted-foreground mt-1">Overall Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors Summary */}
                  <div>
                    <h3 className="font-medium mb-3">Risk Factors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg border text-center">
                        <div className="text-2xl font-bold text-foreground">{highRiskEntitlements.length}</div>
                        <div className="text-sm text-muted-foreground">High-Risk Entitlements</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg border text-center">
                        <div className="text-2xl font-bold text-foreground">{adminEntitlements.length}</div>
                        <div className="text-sm text-muted-foreground">Admin Privileges</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg border text-center">
                        <div className="text-2xl font-bold text-foreground">{role.risk?.conflict ? 1 : 0}</div>
                        <div className="text-sm text-muted-foreground">SoD / Overlap Conflicts</div>
                      </div>
                    </div>
                  </div>

                  {/* Peer Benchmark & Conflict */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {role.risk?.peerBenchmark && (
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Peer Benchmark</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{role.risk.peerBenchmark}</p>
                      </div>
                    )}
                    {role.risk?.conflict && (
                      <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          <span className="font-medium">Role Conflict</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {role.risk.conflict.overlap}% overlap with <strong>{role.risk.conflict.roleName}</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Entitlement Risks */}
                  {role.risk?.entitlementRisks && role.risk.entitlementRisks.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">High-Risk Entitlements</h4>
                      <div className="space-y-2">
                        {role.risk.entitlementRisks.map((er, i) => (
                          <div key={i} className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded">
                            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium text-foreground">{er.entitlementName}</div>
                              <div className="text-sm text-muted-foreground">{er.reason}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Maintenance Health */}
                  <div>
                    <h4 className="font-medium mb-2">Maintenance Health</h4>
                    {healthIssues.length === 0 ? (
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                          <span className="font-medium text-green-900 dark:text-green-300">No Health Issues</span>
                        </div>
                        <p className="text-sm text-green-800 dark:text-green-400 mt-1">This role appears to be well-maintained.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {healthIssues.map(issue => (
                          <div key={issue.key} className={cn("p-4 rounded-lg border",
                            issue.severity === 'warning'
                              ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                              : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                          )}>
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className={cn("h-4 w-4", issue.severity === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400')} />
                              <span className="font-medium text-foreground">{issue.severity === 'warning' ? 'Warning' : 'Info'}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{issue.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Governance Recommendation */}
                  <div>
                    <h4 className="font-medium mb-2">Governance Recommendation</h4>
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <p className="text-sm text-muted-foreground">
                        {riskScore === 'High'
                          ? 'This role requires immediate review. Consider reducing admin-level entitlements, enforcing just-in-time access, and increasing certification frequency to quarterly.'
                          : riskScore === 'Medium'
                            ? 'This role should be reviewed semi-annually. Evaluate if high-risk entitlements can be moved to a separate privileged role with tighter controls.'
                            : 'This role has a healthy risk posture. Continue standard annual reviews and monitor for any entitlement creep.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="membership" className="mt-0">
            <RoleMembershipRulesViewer role={role} />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <RoleHistoryViewer role={role} />
          </TabsContent>
        </div>
      </Tabs>

      <RoleComparisonDrawer
        open={isCompareOpen}
        onOpenChange={setIsCompareOpen}
        sourceRole={role}
        allRoles={allRoles}
      />
    </div>
  );
};

export default RoleViewer;