"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3, AppWindow, LayoutGrid, List } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import TableView from "@/components/applications/list-view/CompactListView";
import CardView from "@/components/applications/card-view/CardView";
import ApplicationsAnalyticsDashboard from "@/components/applications/analytics/ApplicationsAnalyticsDashboard";
import ApplicationsHeader from "@/components/applications/ApplicationsHeader";
import StandardTabs from "@/components/shared/StandardTabs";
import CustomPagination from "@/components/applications/common/CustomPagination";
import useApplications from "@/hooks/applications/useApplications";
import LoadErrorCard from "@/components/applications/add-application/common/LoadErrorCard";
import { useApplicationContext } from "@/contexts/ApplicationContext";
import { Button } from "@/components/ui/button";

export default function ApplicationsPage() {
  const {
    data: filteredApplications,
    error,
    isLoading,
    pagination,
    refresh,
  } = useApplications();

  const t = useTranslations("ApplicationsPage");
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("analytics");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const router = useRouter();
  const { showApplicationImport } = useApplicationContext();

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 overflow-hidden px-8 py-4 gap-4">
        <ApplicationsHeader
          onAddApplication={() => router.push("/applications/add-application")}
          onGlobalImport={showApplicationImport}
        />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <StandardTabs
            tabs={[
              { value: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
              { value: "directory", label: "Directory", icon: <AppWindow className="h-4 w-4" /> },
            ]}
            value={activeTab}
            onValueChange={setActiveTab}
          />

          <TabsContent value="analytics" className="flex-1 overflow-auto">
            <ApplicationsAnalyticsDashboard />
          </TabsContent>

          <TabsContent
            value="directory"
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex justify-end mb-2">
              <div className="flex items-center border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-none"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {!!error && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <LoadErrorCard
                  errorTitle={t("errorLoadingApplications")}
                  errorMessage={error.message}
                  refresh={refresh}
                />
              </div>
            )}
            {viewMode === "list" ? (
              <TableView
                filteredApplications={filteredApplications}
                loading={isLoading}
                error={error}
                size={parseInt(searchParams.get("size") || "10", 10)}
              />
            ) : (
              <div className="overflow-auto flex-1">
                <CardView
                  filteredApplications={filteredApplications}
                  loading={isLoading}
                  error={error}
                  size={parseInt(searchParams.get("size") || "10", 10)}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CustomPagination
        totalPages={pagination?.totalPages || 0}
        totalElements={pagination?.totalElements || 0}
      />
    </div>
  );
}
