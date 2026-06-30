"use client"
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Briefcase, List, BarChart3, BookOpen, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { AccessCatalogAnalyticsDashboard } from '@/components/access-catalog/AccessCatalogAnalyticsDashboard';
import StandardTabs from "@/components/shared/StandardTabs";
import PageHeader from "@/components/shared/PageHeader";

const AccessCatalogPage = () => {
  const [primaryTab, setPrimaryTab] = useState('analytics');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Standardized Header */}
      <PageHeader
        title="Access Catalog"
        description="Discover, browse, and govern enterprise roles and entitlements"
        tooltip="Browse and manage the enterprise access catalog. Analytics provides insights into role and entitlement usage, sprawl, and health. Directory lets you explore available roles and entitlements for request or review."
        icon={<BookOpen className="h-6 w-6 text-primary" />}
      />

      {/* Primary 2-Tab Toggle */}
      <Tabs value={primaryTab} onValueChange={setPrimaryTab}>
        <StandardTabs
          value={primaryTab}
          onValueChange={setPrimaryTab}
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

        <TabsContent value="analytics" className="mt-4">
          <AccessCatalogAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="directory" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <Link href="/access-catalog/roles" className="group">
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group-hover:border-primary">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Briefcase className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">Roles</CardTitle>
                      <CardDescription>Browse and request business and technical roles</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Discover and request pre-defined roles that grant bundled access to multiple applications and systems.</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/access-catalog/entitlements" className="group">
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group-hover:border-accent">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-accent/10 p-3 rounded-lg">
                      <List className="h-8 w-8 text-accent-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">Entitlements</CardTitle>
                      <CardDescription>View application-level access and permissions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Explore granular permissions and entitlements within specific applications.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccessCatalogPage;
