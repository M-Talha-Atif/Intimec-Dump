import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import UserScopeFilters from '../filters/UserScopeFilters';
import RoleScopeFilters from '../filters/RoleScopeFilters';
import ApplicationScopeFilters from '../filters/ApplicationScopeFilters';
import EntitlementScopeFilters from '../filters/EntitlementScopeFilters';
import SoDScopeFilters from '../filters/SoDScopeFilters';
import ScopePreview from '../preview/ScopePreview';
import { CampaignWizardData } from '../CampaignCreationWizard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface Step2Props {
  data: CampaignWizardData;
  updateData: (updates: Partial<CampaignWizardData>) => void;
}

const Step2Scope = ({ data, updateData }: Step2Props) => {
  const [activeTab, setActiveTab] = useState('users');

  // Set initial tab based on campaign type
  useEffect(() => {
    if (data.campaignType === 'role-based') setActiveTab('roles');
    else if (data.campaignType === 'application-based') setActiveTab('applications');
    else if (data.campaignType === 'entitlement-based') setActiveTab('entitlements');
    else if (data.campaignType === 'sod-based') setActiveTab('sod');
    else if (data.campaignType === 'hybrid') setActiveTab('users');
    else setActiveTab('users');
  }, [data.campaignType]);

  const updateScopeConfig = (key: string, value: any) => {
    updateData({
      scopeConfig: {
        ...data.scopeConfig,
        [key]: value,
      },
    });
  };

  const showUserFilters = data.campaignType === 'user-based' || data.campaignType === 'hybrid' || data.campaignType === 'event-driven' || data.campaignType === 'continuous';
  const showRoleFilters = data.campaignType === 'role-based' || data.campaignType === 'hybrid';
  const showAppFilters = data.campaignType === 'application-based' || data.campaignType === 'hybrid';
  const showEntitlementFilters = data.campaignType === 'entitlement-based' || data.campaignType === 'hybrid';
  const showSoDFilters = data.campaignType === 'sod-based';

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Define the scope of your review by applying filters. If no filters are selected, all items of the campaign type will be included.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          {data.campaignType === 'hybrid' ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 w-full">
                {showUserFilters && <TabsTrigger value="users">Users</TabsTrigger>}
                {showRoleFilters && <TabsTrigger value="roles">Roles</TabsTrigger>}
                {showAppFilters && <TabsTrigger value="applications">Applications</TabsTrigger>}
                {showEntitlementFilters && <TabsTrigger value="entitlements">Entitlements</TabsTrigger>}
                {showSoDFilters && <TabsTrigger value="sod">SoD</TabsTrigger>}
              </TabsList>

              {showUserFilters && (
                <TabsContent value="users">
                  <UserScopeFilters
                    filters={data.scopeConfig.userFilters || {}}
                    updateFilters={(filters) => updateScopeConfig('userFilters', filters)}
                  />
                </TabsContent>
              )}
              
              {showRoleFilters && (
                <TabsContent value="roles">
                  <RoleScopeFilters
                    filters={data.scopeConfig.roleFilters || {}}
                    updateFilters={(filters) => updateScopeConfig('roleFilters', filters)}
                  />
                </TabsContent>
              )}

              {showAppFilters && (
                <TabsContent value="applications">
                  <ApplicationScopeFilters
                    filters={data.scopeConfig.applicationFilters || {}}
                    updateFilters={(filters) => updateScopeConfig('applicationFilters', filters)}
                  />
                </TabsContent>
              )}

              {showEntitlementFilters && (
                <TabsContent value="entitlements">
                  <EntitlementScopeFilters
                    filters={data.scopeConfig.entitlementFilters || {}}
                    updateFilters={(filters) => updateScopeConfig('entitlementFilters', filters)}
                  />
                </TabsContent>
              )}
              
              {showSoDFilters && (
                <TabsContent value="sod">
                  <SoDScopeFilters
                    filters={data.scopeConfig.sodFilters || {}}
                    updateFilters={(filters) => updateScopeConfig('sodFilters', filters)}
                  />
                </TabsContent>
              )}
            </Tabs>
          ) : (
            <Card className="p-6">
              {showUserFilters && (
                <UserScopeFilters
                  filters={data.scopeConfig.userFilters || {}}
                  updateFilters={(filters) => updateScopeConfig('userFilters', filters)}
                />
              )}
              {showRoleFilters && (
                <RoleScopeFilters
                  filters={data.scopeConfig.roleFilters || {}}
                  updateFilters={(filters) => updateScopeConfig('roleFilters', filters)}
                />
              )}
              {showAppFilters && (
                <ApplicationScopeFilters
                  filters={data.scopeConfig.applicationFilters || {}}
                  updateFilters={(filters) => updateScopeConfig('applicationFilters', filters)}
                />
              )}
              {showEntitlementFilters && (
                <EntitlementScopeFilters
                  filters={data.scopeConfig.entitlementFilters || {}}
                  updateFilters={(filters) => updateScopeConfig('entitlementFilters', filters)}
                />
              )}
              {showSoDFilters && (
                <SoDScopeFilters
                  filters={data.scopeConfig.sodFilters || {}}
                  updateFilters={(filters) => updateScopeConfig('sodFilters', filters)}
                />
              )}
            </Card>
          )}
        </div>

        <div className="col-span-1">
          <ScopePreview campaignType={data.campaignType} scopeConfig={data.scopeConfig} />
        </div>
      </div>
    </div>
  );
};

export default Step2Scope;
