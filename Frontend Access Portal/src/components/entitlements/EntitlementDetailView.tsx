import * as React from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import EntitlementEditor from "./EntitlementEditor";
import EntitlementViewer from "./EntitlementViewer";
import { useEntitlementDetail } from "@/hooks/useEntitlements";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EntitlementDetailViewProps {
  entitlement: EntitlementResponseDto | null;
  allEntitlements: EntitlementResponseDto[];
  onSelectEntitlement: (entitlement: EntitlementResponseDto) => void;
}

const DetailSkeleton = () => (
  <div className="p-6 space-y-4">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-4 w-1/2" />
    <div className="grid grid-cols-4 gap-4 mt-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
    <Skeleton className="h-48 rounded-lg mt-4" />
  </div>
);

const EntitlementDetailView = ({
  entitlement,
  allEntitlements,
  onSelectEntitlement,
}: EntitlementDetailViewProps) => {
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    setIsEditing(false);
  }, [entitlement?.id]);

  const {
    entitlement: detailData,
    loading,
    error,
    refresh,
  } = useEntitlementDetail(entitlement?.id ?? null);

  const activeEntitlement = detailData ?? entitlement;

  if (!entitlement) {
    return (
      <div className="flex-1 flex items-center justify-center h-full text-slate-500">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-slate-400">?</span>
          </div>
          <h3 className="text-sm font-medium">Select an entitlement</h3>
          <p className="text-sm">
            Choose an entitlement from the list to see its details.
          </p>
        </div>
      </div>
    );
  }

  if (loading && !detailData) {
    return <DetailSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={refresh} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  if (!activeEntitlement) return null;

  const handleSaveEntitlement = async (
    _updatedEntitlement: EntitlementResponseDto
  ) => {
    // Editor already called the PUT API via useUpdateEntitlement.
    // Re-fetch the detail to get the latest server state,
    // then exit editing mode after refresh completes.
    await refresh();
    setIsEditing(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {isEditing ? (
        <EntitlementEditor
          entitlement={activeEntitlement}
          allEntitlements={allEntitlements}
          onSave={handleSaveEntitlement}
          onCancel={() => setIsEditing(false)}
          onSelectEntitlement={onSelectEntitlement}
        />
      ) : (
        <EntitlementViewer
          entitlement={activeEntitlement}
          allEntitlements={allEntitlements}
          onEdit={() => setIsEditing(true)}
          onSelectEntitlement={onSelectEntitlement}
        />
      )}
    </div>
  );
};

export default EntitlementDetailView;