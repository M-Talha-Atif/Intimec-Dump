import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, ShieldCheck, Link, Code, Target } from "lucide-react";
import { Entitlement } from "../../data/mock-entitlements";
import EntitlementOverviewEditor from "../EntitlementOverviewEditor";
import EntitlementAttributesEditor from "../EntitlementAttributesEditor";
import EntitlementRelationshipsEditor from "../EntitlementRelationshipsEditor";
import EntitlementScriptingEditor from "../EntitlementScriptingEditor";
import EntitlementRiskEditor from "../EntitlementRiskEditor";

interface EditorTabsProps {
  entitlement: Entitlement;
  onChange: (updatedEntitlement: Partial<Entitlement>) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({ entitlement, onChange }) => {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="attributes">
          <ShieldCheck className="mr-2 h-4 w-4" />
          Attributes
        </TabsTrigger>
        <TabsTrigger value="relationships">
          <Link className="mr-2 h-4 w-4" />
          Relationships
        </TabsTrigger>
        <TabsTrigger value="scripting">
          <Code className="mr-2 h-4 w-4" />
          Scripting
        </TabsTrigger>
        <TabsTrigger value="risk">
          <Target className="mr-2 h-4 w-4" />
          Risk Analysis
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <EntitlementOverviewEditor
          entitlement={entitlement}
          onChange={onChange}
        />
      </TabsContent>

      <TabsContent value="attributes">
        <EntitlementAttributesEditor
          entitlement={entitlement}
          isEditing={true}
          onChange={onChange}
        />
      </TabsContent>

      <TabsContent value="relationships">
        <EntitlementRelationshipsEditor />
      </TabsContent>

      <TabsContent value="scripting">
        <EntitlementScriptingEditor />
      </TabsContent>

      <TabsContent value="risk">
        <EntitlementRiskEditor />
      </TabsContent>
    </Tabs>
  );
};

export default EditorTabs;
