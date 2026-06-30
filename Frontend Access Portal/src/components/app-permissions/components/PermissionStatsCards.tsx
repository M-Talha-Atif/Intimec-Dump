"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Users, Settings, UserPlus } from "lucide-react";
import { useApplicationPermissions } from "../contexts/ApplicationPermissionsContext";

const SkeletonCard = ({ icon: Icon, iconColor }: { icon: any; iconColor: string }) => (
  <Card>
    <CardContent className="py-1 px-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Icon className={`h-8 w-8 ${iconColor} opacity-50`} />
      </div>
    </CardContent>
  </Card>
);

export const PermissionStatsCards: React.FC = () => {
  const { permissionStats, isLoading, error } = useApplicationPermissions();

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="col-span-full">
          <CardContent className="py-4 px-6">
            <div className="flex items-center gap-2 text-destructive">
              <p className="text-sm">Failed to load statistics: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SkeletonCard icon={Shield} iconColor="text-blue-600" />
        <SkeletonCard icon={Users} iconColor="text-green-600" />
        <SkeletonCard icon={Settings} iconColor="text-purple-600" />
        <SkeletonCard icon={UserPlus} iconColor="text-orange-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="py-1 px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Internal Roles</p>
              <p className="text-2xl font-bold">{permissionStats.totalRoles}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-1 px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Active Admins</p>
              <p className="text-2xl font-bold">{permissionStats.activeAdmins}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-1 px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Scoped Domains</p>
              <p className="text-2xl font-bold">
                {permissionStats.scopedDomains}
              </p>
            </div>
            <Settings className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-1 px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Pending Requests</p>
              <p className="text-2xl font-bold">
                {permissionStats.pendingRequests}
              </p>
              {permissionStats.pendingRequests > 0 && (
                <Badge variant="destructive" className="mt-1">
                  Requires Action
                </Badge>
              )}
            </div>
            <UserPlus className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
