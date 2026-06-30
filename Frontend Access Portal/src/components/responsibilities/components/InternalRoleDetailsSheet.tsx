"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import {
    Shield,
    AlertTriangle,
    Lock,
    Users
} from "lucide-react";
import { RolePermissions } from "@/components/tasks/RolePermissions";
import { RoleDetails } from "@/components/tasks/RoleDetails";
import { RoleMembers } from "@/components/tasks/RoleMembers";

interface Props {
    role: any | null;
    open: boolean;
    onClose: () => void;
    getRoleTypeVariant: (type: string) => any;
    getRoleTypeLabel: (type: string) => string;
}

export const InternalRoleDetailsSheet = ({
    role,
    open,
    onClose,
    getRoleTypeVariant,
    getRoleTypeLabel
}: Props) => {

    if (!role) return null;

    return (
        <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-5xl flex flex-col p-0 h-full"
            >
                <div className="flex flex-col h-full min-w-0">

                    {/* Header */}
                    <div className="flex-shrink-0 px-6 py-4">
                        <SheetHeader className="p-0">
                            <SheetTitle>{role.name}</SheetTitle>

                            <SheetDescription>
                                View role permissions, governance details and assigned users.
                            </SheetDescription>

                            <div className="flex items-center gap-2 mt-3">

                                <Badge variant={getRoleTypeVariant(role.roleType)}>
                                    {getRoleTypeLabel(role.roleType)}
                                </Badge>

                                {role.scope && (
                                    <Badge variant="outline" className="text-xs">
                                        {role.scope}
                                    </Badge>
                                )}

                                {role.isCritical && (
                                    <Badge
                                        variant="destructive"
                                        className="flex items-center gap-1"
                                    >
                                        <AlertTriangle className="h-3 w-3" />
                                        Critical Role
                                    </Badge>
                                )}

                            </div>
                        </SheetHeader>
                    </div>

                    {/* Tabs */}
                    <div className="flex-1 min-h-0 px-6 pb-6">

                        <Tabs defaultValue="details" className="flex flex-col h-full min-h-0">

                            <TabsList className="grid grid-cols-3 w-full mb-4">
                                <TabsTrigger value="details">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Details
                                </TabsTrigger>

                                <TabsTrigger value="permissions">
                                    <Lock className="h-4 w-4 mr-2" />
                                    Permissions
                                </TabsTrigger>

                                <TabsTrigger value="members">
                                    <Users className="h-4 w-4 mr-2" />
                                    Members
                                </TabsTrigger>
                            </TabsList>


                            {/* DETAILS TAB */}
                            <TabsContent value="details">
                                <RoleDetails roleId={role.id} />
                            </TabsContent>


                            {/* PERMISSIONS TAB */}
                            <TabsContent value="permissions" className="flex flex-col flex-1 min-h-0">

                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Lock className="h-4 w-4" />
                                    Permissions
                                </div>

                                <div className="flex-1 min-h-0 overflow-hidden">
                                    <RolePermissions
                                        roleId={role.id}
                                        permissionsCount={
                                            role.permissionCount ?? role.permissions?.length ?? 0
                                        }
                                    />
                                </div>

                            </TabsContent>


                            {/* MEMBERS TAB */}
                            <TabsContent value="members" className="flex flex-col flex-1 min-h-0">

                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Users className="h-4 w-4" />
                                    Role Members
                                </div>

                                <div className="flex-1 min-h-0 overflow-hidden">
                                    <RoleMembers roleId={role.id} />
                                </div>

                            </TabsContent>


                        </Tabs>

                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};