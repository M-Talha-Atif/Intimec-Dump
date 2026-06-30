import { getApplication } from "@/lib/applications";
import { ScrollArea } from "@/components/ui/scroll-area";
import OverviewContent, {
  type OverviewData,
} from "@/components/applications/overview/OverviewContent";

export default async function Page({ params }: { params: { appid: string } }) {
  const appid = (await params).appid;
  const application = await getApplication(appid);

  // Map RecivedApplication → OverviewData, using real backend fields
  const overviewData: OverviewData = {
    details: {
      name: application?.details?.name ?? "",
      category: application?.details?.category ?? [],
      isAuthoritative: application?.details?.isAuthoritative ?? false,
      riskLevel: application?.details?.riskLevel,
      description: application?.details?.description,
      connectorId: application?.details?.connectorId,
      scopes: application?.details?.scopes,
      department: application?.details?.department,
      owner: application?.details?.owner,
      businessOwner: application?.details?.businessOwner,
      complianceLabels: application?.details?.complianceLabels,
    },
    createdAt: (application as Record<string, unknown>)?.createdAt as string | undefined,
    lastSyncAccounts: (application as Record<string, unknown>)?.lastSyncAccounts as string | undefined,
    lastSyncEntitlements: (application as Record<string, unknown>)?.lastSyncEntitlements as string | undefined,
    connectionStatus: (application as Record<string, unknown>)?.connectionStatus as string | undefined,
    totalAccounts: (application as Record<string, unknown>)?.totalAccounts as number | undefined,
    orphanCount: (application as Record<string, unknown>)?.orphanCount as number | undefined,
    riskyCount: (application as Record<string, unknown>)?.riskyCount as number | undefined,
  };

  return (
    <ScrollArea className="h-full px-4 pb-4">
      <OverviewContent data={overviewData} />
    </ScrollArea>
  );
}
