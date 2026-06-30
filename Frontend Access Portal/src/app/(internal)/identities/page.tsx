'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, } from "@/components/ui/tabs";

import { Users, Bot, UserCheck, UsersRound, BarChart3, BookOpen, AlertTriangle, Shield } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import IdentitiesAnalyticsDashboard from "@/components/identities/IdentitiesAnalyticsDashboard";
import StandardTabs from "@/components/shared/StandardTabs";
import PageHeader from "@/components/shared/PageHeader";

const directoryCards = [
  {
    to: '/identities/human',
    icon: Users,
    color: 'text-brand-teal',
    bgColor: 'bg-brand-teal/10',
    borderColor: 'group-hover:border-brand-teal',
    title: 'Employee Identities',
    desc: 'Internal Employees, Staff, Personnel',
    detail: 'Manage internal employee identities with AI-powered lifecycle automation, manager accountability, and smart risk assessment.',
    tooltip: 'Human workforce identity sourced from authoritative HR systems. Lifecycle automation should control provisioning and deprovisioning.',
    count: 1842,
    risk: 12,
    health: 'Healthy',
  },
  {
    to: '/identities/non-human',
    icon: Bot,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'group-hover:border-orange-500',
    title: 'Non-Human Identities',
    desc: 'Service Accounts, Bots, System Identities',
    detail: 'Manage machine identities, such as service accounts and API keys, used by applications and systems.',
    tooltip: 'Machine or service identity used by applications or automation. These accounts often lack lifecycle governance and require periodic review.',
    count: 412,
    risk: 37,
    health: 'At Risk',
  },
  {
    to: '/identities/non-employee',
    icon: UserCheck,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'group-hover:border-purple-500',
    title: 'Non-Employee Identities',
    desc: 'Vendors, Contractors, Interns, External Consultants',
    detail: 'Manage time-bound, sponsor-governed external identities, including their full lifecycle and access rights.',
    tooltip: 'External identities with time-bound access governed by sponsors. Expired contractors still active represent a critical compliance risk.',
    count: 438,
    risk: 14,
    health: 'Warning',
  },
  {
    to: '/identities/groups',
    icon: UsersRound,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'group-hover:border-blue-500',
    title: 'Identity Groups',
    desc: 'Reusable Groups, Teams, Workgroups',
    detail: 'Build and manage reusable groups of identities to streamline assignment of ownership, governance responsibilities, and collaborative tasks across the IGA platform.',
    tooltip: 'Collection of identities used to assign access collectively. Misconfigured groups frequently cause excessive access exposure.',
    count: 155,
    risk: 23,
    health: 'Warning',
  },
];

const IdentitiesPage = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-background">
      {/* Header */}
      <PageHeader
        title="Identity Governance Hub"
        description="Unified visibility into identity risk, lifecycle governance, and compliance posture"
        tooltip="Centralized intelligence across all identity types. Analytics surfaces risk, lifecycle maturity, and governance posture. Directory provides structured access to identity management."
        icon={<Users className="h-6 w-6 text-primary" />}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">

        <StandardTabs
          value={activeTab}
          onValueChange={setActiveTab}
          tabs={[
            {
              value: "analytics",
              label: "Analytics",
              icon: <BarChart3 className="h-4 w-4" />,
            },
            {
              value: "directory",
              label: "Directory",
              icon: <BookOpen className="h-4 w-4" />,
            },
          ]}
        />

        <TabsContent value="analytics" className="space-y-4">
          <IdentitiesAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="directory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {directoryCards.map(card => (
              <Link key={card.to} href={card.to} className="group">
                <Card
                  className={`h-full hover:shadow-lg transition-shadow duration-300 ${card.borderColor}`}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`${card.bgColor} p-3 rounded-lg shrink-0`}>
                        <card.icon className={`h-8 w-8 ${card.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl text-foreground truncate">
                            {card.title}
                          </CardTitle>
                          <InfoTooltip text={card.tooltip} />
                        </div>

                        <CardDescription className="mt-1">
                          {card.desc}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {card.detail}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IdentitiesPage;
