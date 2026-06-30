import React, { useMemo } from 'react';
import { Role } from '@/types/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Users2, Calendar, TrendingUp, Server, ShieldCheck, Target, Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { differenceInMonths, format } from 'date-fns';

interface RoleOverviewViewerProps {
  role: Role;
  /** Pre-resolved owner display name from parent. null = still loading. */
  ownerDisplayName: string | null;
}

const PRIV_COLORS: Record<string, string> = {
  Read: 'hsl(210, 80%, 55%)',
  Write: 'hsl(30, 80%, 55%)',
  Admin: 'hsl(0, 70%, 55%)',
  Other: 'hsl(210, 10%, 60%)',
};

/**
 * Formats an epoch timestamp (seconds or milliseconds) or ISO/date string
 * into a human-readable date string. Returns fallback if invalid.
 */
const formatDate = (value: number | string | undefined | null, fallback = '—'): string => {
  if (value == null) return fallback;

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return format(parsed, 'MMM d, yyyy h:mm a');
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      const ms = num < 1e12 ? num * 1000 : num;
      return format(new Date(ms), 'MMM d, yyyy h:mm a');
    }
    return fallback;
  }

  if (typeof value === 'number') {
    if (value <= 0) return fallback;
    const ms = value < 1e12 ? value * 1000 : value;
    try {
      return format(new Date(ms), 'MMM d, yyyy h:mm a');
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const RoleOverviewViewer: React.FC<RoleOverviewViewerProps> = ({ role, ownerDisplayName }) => {
  const userTrendData = role.userCountHistory?.map(h => ({ month: h.month, users: h.count })) || [];

  const appFootprint = useMemo(() => {
    const map: Record<string, number> = {};
    role.entitlements.forEach(e => {
      const app = e.application || 'Unknown';
      map[app] = (map[app] || 0) + 1;
    });
    return Object.entries(map).map(([app, count]) => ({ app, count })).sort((a, b) => b.count - a.count);
  }, [role.entitlements]);

  const entitlementComposition = useMemo(() => {
    const counts: Record<string, number> = { Read: 0, Write: 0, Admin: 0, Other: 0 };
    role.entitlements.forEach(e => {
      const lvl = e.privilegeLevel || 'Other';
      counts[lvl] = (counts[lvl] || 0) + 1;
    });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [role.entitlements]);

  const healthScore = useMemo(() => {
    let score = 100;
    if (!role.owner) score -= 20;
    if (!role.backupOwner) score -= 10;
    const monthsSinceReview = differenceInMonths(new Date(), new Date(role.lastReviewed));
    if (monthsSinceReview > 12) score -= 30;
    else if (monthsSinceReview > 6) score -= 15;
    if (role.risk?.score === 'High') score -= 15;
    else if (role.risk?.score === 'Medium') score -= 5;
    if (role.userCount > 0) {
      const inactiveRatio = (role.inactiveUserCount || 0) / role.userCount;
      if (inactiveRatio > 0.3) score -= 15;
      else if (inactiveRatio > 0.1) score -= 5;
    }
    if (role.userCount === 0 && role.status !== 'disabled') score -= 10;
    return Math.max(0, score);
  }, [role]);

  const healthColor = healthScore >= 80 ? 'text-green-600 dark:text-green-400' : healthScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
  const healthBg = healthScore >= 80 ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : healthScore >= 50 ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';

  return (
    <div className="space-y-6">
      {/* Ownership Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center space-x-3">
          <Users2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium text-muted-foreground">Assigned Users</div>
            <div className="text-foreground">{role.userCount}</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
            <div className="text-foreground">{formatDate(role.updatedAt)}</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Users2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium text-muted-foreground">Inactive Users (90d)</div>
            <div className="text-foreground">{role.inactiveUserCount ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Governance Health Score + Entitlement Composition */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`border ${healthBg}`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Heart className="h-5 w-5" />
              <span>Governance Health</span>
              <InfoTooltip text="Computed from ownership completeness, review freshness, risk level, and inactive user ratio. Higher is better." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${healthColor}`}>{healthScore}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              {healthScore >= 80 ? 'Well-governed role' : healthScore >= 50 ? 'Needs attention' : 'Critical issues detected'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Server className="h-5 w-5" />
              <span>Application Footprint</span>
              <InfoTooltip text="Applications this role touches via its entitlements." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appFootprint.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications</p>
            ) : (
              <div className="space-y-2">
                {appFootprint.map(({ app, count }) => (
                  <div key={app} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{app}</span>
                    <Badge variant="secondary" className="text-xs">{count} entitlement{count > 1 ? 's' : ''}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-base">
              <ShieldCheck className="h-5 w-5" />
              <span>Entitlement Composition</span>
              <InfoTooltip text="Distribution of privilege levels across entitlements in this role." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entitlementComposition.length === 0 ? (
              <p className="text-sm text-muted-foreground">No entitlements</p>
            ) : (
              <div className="flex items-center gap-4">
                <div className="h-24 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={entitlementComposition} dataKey="value" cx="50%" cy="50%" innerRadius={20} outerRadius={40} strokeWidth={1}>
                        {entitlementComposition.map((entry) => (
                          <Cell key={entry.name} fill={PRIV_COLORS[entry.name] || PRIV_COLORS.Other} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1">
                  {entitlementComposition.map(e => (
                    <div key={e.name} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PRIV_COLORS[e.name] || PRIV_COLORS.Other }} />
                      <span className="text-foreground">{e.name}: {e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Count Trend Chart */}
      {userTrendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base">
              <TrendingUp className="h-5 w-5" />
              <span>User Count Trend</span>
              <InfoTooltip text="Monthly membership count over time. Sudden spikes may indicate bulk provisioning events." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userTrendData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategic Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base">
            <Target className="h-5 w-5" />
            <span>Strategic Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {role.risk?.conflict && (
              <div>
                <h4 className="font-medium mb-2">Role Similarity</h4>
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{role.risk.conflict.overlap}% overlap with {role.risk.conflict.roleName}</span>
                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400">
                      Review Recommended
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            {role.objectives && role.objectives.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Role Objectives</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {role.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {role.derivedFrom && (
              <div>
                <h4 className="font-medium mb-1">Derived From</h4>
                <p className="text-sm text-muted-foreground">{role.derivedFrom}</p>
              </div>
            )}
            {role.composedOf && role.composedOf.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Composed Of</h4>
                <div className="flex flex-wrap gap-2">
                  {role.composedOf.map((r, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{r}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleOverviewViewer;