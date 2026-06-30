"use client";

import { useState } from "react";
// import { useOutletContext } from "react-router-dom";
import { useResponsibilitiesContext } from "./context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Box,
  Users,
  Shield,
  RefreshCw,
  Settings,
  AlertCircle,
  Download,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Application } from "@/services/responsibilities";
import { format } from "date-fns";
import { useOwnedApps } from "./hooks/useOwnedApps";
import { PageHeader, PageEmptyState } from "./components";
import { getEnvColor } from "../utils";

export const OwnedAppsIndex = () => {
  const { globalSearch } = useResponsibilitiesContext();
  const [envFilter, setEnvFilter] = useState("all");
  const [connectorFilter, setConnectorFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  

  const { filteredApps, isLoading } = useOwnedApps(
    globalSearch,
    envFilter,
    connectorFilter,
  );

  const getHealthStatus = () => {
    const statuses = ["Healthy", "Warning", "Healthy"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owned Applications"
        description="Applications and connectors you manage"
        actions={
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select value={envFilter} onValueChange={setEnvFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                <SelectItem value="prod">Production</SelectItem>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="dev">Development</SelectItem>
              </SelectContent>
            </Select>

            <Select value={connectorFilter} onValueChange={setConnectorFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by connector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Connectors</SelectItem>
                <SelectItem value="saas">SaaS</SelectItem>
                <SelectItem value="on-prem">On-Premise</SelectItem>
                <SelectItem value="cloud">Cloud</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : filteredApps && filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => {
            const health = getHealthStatus();

            return (
              <Card
                key={app.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedApp(app)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Box className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant={getEnvColor(app.environment)}
                        className="text-xs"
                      >
                        {app.environment.toUpperCase()}
                      </Badge>
                      <Badge
                        variant={health === "Healthy" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {health}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="mt-4">{app.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {app.systemId}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Connector Type:
                      </span>
                      <Badge variant="outline" className="capitalize text-xs">
                        {app.connectorType}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Linked Roles:
                      </span>
                      <span className="font-medium">{app.linkedRoles}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Active Users:
                      </span>
                      <span className="font-medium">{app.activeUsers}</span>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        Last sync:{" "}
                        {format(new Date(app.lastSync), "MMM dd, HH:mm")}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Config
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <PageEmptyState
          icon={<Box className="h-8 w-8 text-primary" />}
          title="No Applications Found"
          message="No applications match your current filters."
        />
      )}

      {/* Application Detail Sheet */}
      <Sheet open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <SheetContent className="p-6 w-full sm:max-w-2xl overflow-y-auto">
          {selectedApp && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Box className="h-5 w-5 text-primary" />
                  </div>
                  {selectedApp.name}
                </SheetTitle>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="roles">Roles</TabsTrigger>
                  <TabsTrigger value="health">Health</TabsTrigger>
                  <TabsTrigger value="jobs">Jobs</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">
                      Application Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          System ID:
                        </span>
                        <span className="font-medium">
                          {selectedApp.systemId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Environment:
                        </span>
                        <Badge variant={getEnvColor(selectedApp.environment)}>
                          {selectedApp.environment.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Connector Type:
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {selectedApp.connectorType}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Active Users:
                        </span>
                        <span className="font-medium">
                          {selectedApp.activeUsers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Linked Roles:
                        </span>
                        <span className="font-medium">
                          {selectedApp.linkedRoles}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Last Sync:
                        </span>
                        <span>
                          {format(
                            new Date(selectedApp.lastSync),
                            "MMM dd, yyyy HH:mm",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="roles" className="space-y-4 mt-6">
                  <div className="space-y-3">
                    {Array.from({ length: selectedApp.linkedRoles }).map(
                      (_, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Application Role {idx + 1}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Active
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {Math.floor(Math.random() * 20)} users assigned
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="health" className="space-y-4 mt-6">
                  <div className="space-y-3">
                    {[
                      {
                        status: "Healthy",
                        message: "Connector is operational",
                        icon: CheckCircle,
                        color: "text-green-500",
                      },
                      {
                        status: "Warning",
                        message: "Last sync took longer than usual",
                        icon: AlertCircle,
                        color: "text-orange-500",
                      },
                      {
                        status: "Info",
                        message: "Scheduled maintenance in 3 days",
                        icon: Clock,
                        color: "text-blue-500",
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <item.icon
                            className={`h-5 w-5 ${item.color} mt-0.5`}
                          />
                          <div>
                            <div className="font-medium text-sm">
                              {item.status}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.message}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="jobs" className="space-y-4 mt-6">
                  <div className="space-y-3">
                    {[
                      {
                        job: "Full Reconciliation",
                        status: "Completed",
                        time: selectedApp.lastSync,
                      },
                      {
                        job: "Incremental Sync",
                        status: "In Progress",
                        time: new Date().toISOString(),
                      },
                      {
                        job: "User Import",
                        status: "Completed",
                        time: "2025-10-23T05:00:00Z",
                      },
                    ].map((job, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{job.job}</span>
                          <Badge
                            variant={
                              job.status === "Completed"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(job.time), "MMM dd, yyyy HH:mm")}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
