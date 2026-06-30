"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApplicationPermissions } from "../contexts/ApplicationPermissionsContext";
import { PermissionMatrixProvider } from "../contexts/PermissionMatrixContext";
import { GranularPermissionMatrix } from "../GranularPermissionMatrix";
import { RoleManagement } from "../RoleManagement";
import { AttributePermissions } from "../AttributePermissions";
import { DelegatedAdministration } from "../DelegatedAdministration";
import { Table, Shield, SlidersHorizontal, Users } from "lucide-react";
import IconTabs from "@/components/shared/IconTabs";

export const PermissionTabs: React.FC = () => {
  const { activeTab, setActiveTab } = useApplicationPermissions();

  return (
    <PermissionMatrixProvider>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <IconTabs
          columns={4}
          tabs={[
            {
              value: "granular-matrix",
              label: "Granular Matrix",
              icon: Table,
            },
            {
              value: "roles",
              label: "Role Management",
              icon: Shield,
            },
            {
              value: "attributes",
              label: "Attribute Controls",
              icon: SlidersHorizontal,
            },
            {
              value: "delegation",
              label: "Delegated Admin",
              icon: Users,
            },
          ]}
        />

        <TabsContent value="granular-matrix" className="space-y-6">
          <GranularPermissionMatrix />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="attributes" className="space-y-6">
          <AttributePermissions />
        </TabsContent>

        <TabsContent value="delegation" className="space-y-6">
          <DelegatedAdministration />
        </TabsContent>
      </Tabs>
    </PermissionMatrixProvider>
  );
};
