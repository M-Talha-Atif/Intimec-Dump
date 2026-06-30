
import React, { useState } from 'react';
import { type User, mockUsers } from '@/data/mock-users';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Building, User as UserIcon, Briefcase, Users, RefreshCw, Mail, MapPin, Calendar, Clock } from 'lucide-react';
import IdentityQuickStatsCard from '@/components/human-identities/IdentityQuickStatsCard';
import { getIdentityProfile } from '@/data/mock-identity-profiles';
import { useIdentityDetail } from '@/contexts/IdentityDetailContext';

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | undefined }) => (
    <div className="flex items-start text-sm">
        <dt className="flex items-center text-slate-500">
            <Icon className="w-4 h-4 mr-2 shrink-0" />
            <span className="font-medium">{label}</span>
        </dt>
        <dd className="ml-auto text-slate-700 font-medium">{value || 'N/A'}</dd>
    </div>
);

const IdentityOverviewTab = ({ user }: { user: User }) => {
  const { isRegeneratingSummary, regenerateSummary } = useIdentityDetail();
  const profile = getIdentityProfile(user.id);
  const directReports = mockUsers.filter(u => u.manager === user.name);

  const getAccessSummary = () => {
    const numAccounts = profile?.accounts?.length || user.accounts?.length || 0;
    const numRoles = profile?.access?.filter(a => a.roleName).length || user.access?.filter(a => a.type === 'Role').length || 0;
    const privileged = user.isPrivileged ? 'Holds privileged access. ' : '';
    const riskInsights = profile?.aiInsights?.length ? ` AI has identified ${profile.aiInsights.length} insights for optimization.` : '';
    return `${user.name} is a ${user.type} in the ${user.department} department. ${privileged}They have ${numAccounts} accounts and ${numRoles} roles assigned.${riskInsights}`;
  };

  // Use profile data if available, otherwise fallback to user data
  const extendedData = profile ? {
    email: profile.email,
    jobTitle: profile.jobTitle,
    startDate: profile.startDate,
    workLocation: profile.workLocation,
    lastLogin: profile.lastLogin,
    probationEndDate: profile.probationEndDate
  } : {
    email: `${user.name.toLowerCase().replace(' ', '.')}@company.com`,
    jobTitle: user.department === 'Engineering' ? 'Senior Software Engineer' : 
              user.department === 'Marketing' ? 'Marketing Manager' : 
              user.department === 'Finance' ? 'Financial Analyst' :
              user.department === 'HR' ? 'HR Business Partner' : 'Analyst',
    startDate: '2023-01-15',
    workLocation: 'Hybrid',
    lastLogin: '2025-01-26 09:30 AM',
    probationEndDate: user.type === 'Employee' ? null : '2025-03-15'
  };

  return (
    <div className="space-y-6 pt-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Sparkles className="w-5 h-5 mr-2 text-brand-purple" />
              AI-Generated Summary
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={regenerateSummary}
              disabled={isRegeneratingSummary}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRegeneratingSummary ? 'animate-spin' : ''}`} />
              <span>{isRegeneratingSummary ? 'Regenerating...' : 'Regenerate Summary'}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 italic">
            {getAccessSummary()}
          </p>
          {user.riskFactors && user.riskFactors.length > 0 && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm font-medium text-amber-800 mb-1">AI Risk Insights:</p>
              <ul className="text-sm text-amber-700 space-y-1">
                {user.riskFactors.slice(0, 2).map((factor, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
      <IdentityQuickStatsCard user={user} />
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Identity Details</CardTitle>
            <CardDescription>Core user attributes and information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem icon={UserIcon} label="Full Name" value={user.name} />
            <DetailItem icon={Mail} label="Email" value={extendedData.email} />
            <DetailItem icon={Briefcase} label="Job Title" value={extendedData.jobTitle} />
            <DetailItem icon={Building} label="Department" value={user.department} />
            <DetailItem icon={UserIcon} label="Role Type" value={user.type} />
            <DetailItem icon={UserIcon} label="Status" value={user.status} />
            <DetailItem icon={Calendar} label="Start Date" value={extendedData.startDate} />
            <DetailItem icon={MapPin} label="Work Location" value={extendedData.workLocation} />
            <DetailItem icon={Clock} label="Last Login" value={extendedData.lastLogin} />
            {extendedData.probationEndDate && (
              <DetailItem icon={Calendar} label="Probation End" value={extendedData.probationEndDate} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>Position within the company structure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem icon={UserIcon} label="Manager" value={user.manager} />
            <DetailItem icon={Users} label="Direct Reports" value={String(directReports.length)} />
            {directReports.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">Direct Reports:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  {directReports.slice(0, 3).map((report, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                      {report.name} ({report.department})
                    </li>
                  ))}
                  {directReports.length > 3 && (
                    <li className="text-blue-600 font-medium">
                      +{directReports.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IdentityOverviewTab;
