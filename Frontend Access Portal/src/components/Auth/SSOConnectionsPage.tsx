"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { type SSOConnection, SSOConnectionsTable } from "@/components/Auth/sso/SSOConnectionsTable";
import { SSOConfigProvider, useSSOConfig } from "@/components/Auth/sso/SSOConfigContext";
import { Button } from "@/components/ui/button";

function SSOConnectionsPageInner() {
    const router = useRouter();
    const { configs, loading, error, refetch } = useSSOConfig();

    const connections: SSOConnection[] = useMemo(() => {
        return configs.map((config) => {
            const configData = config.configData;
            
            // Determine status based on isActive and any error conditions
            let status: "active" | "inactive" | "error" = config.isActive ? "active" : "inactive";
            
            const getSSMType = (): "OAuth2" | "SAML" | "LDAP" => {
                switch (config.configType.toLowerCase()) {
                    case "oauth2":
                        return "OAuth2";
                    case "saml":
                        return "SAML";
                    case "ldap":
                        return "LDAP";
                    default:
                        return "OAuth2"; // fallback
                }
            };


            return {
                id: config.id,
                name: configData?.name || `${config.configType} Configuration`,
                type: getSSMType(),
                status,
                provider: configData?.provider || configData?.providerId || config.configKey,
                usersCount: config.userCount,
                enabled: config.isActive,
                encrypted: Boolean(config.encrypted),
                config: configData,
                configId: config.id,
                configKey: config.configKey,
                configType: config.configType,
                version: config.version,
                artifactsCount: config.artifacts?.length || 0,
                createdAt: config.createdAt,
                updatedAt: config.updatedAt,
            };
        });
    }, [configs]);

    const handleAddConnection = () => {
        router.push("/settings/sso/config");
    };

    const handleEditConnection = (connection: SSOConnection) => {
        const configType = connection.type.toLowerCase();
        router.push(`/settings/sso/config/${configType}-config?edit=${connection.id}`);
    };

    const getExistingConnectionTypes = () => {
        return connections.map((conn) => conn.type.toLowerCase());
    };

    // The error state is still a full-page override, which is acceptable for critical errors.
    if (error && !loading) {
        return (
            <div className="flex-1 p-8">
                <div className="flex flex-col items-center justify-center h-64 text-red-500 bg-red-50 rounded-lg">
                    <h3 className="text-lg font-semibold">Error Loading SSO Configurations</h3>
                    <p className="text-sm mt-1">{error.message}</p>
                    <Button onClick={refetch} variant="outline" className="mt-4">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 sm:p-6 md:p-8">
            <SSOConnectionsTable
                connections={connections}
                loading={loading}
                onAddConnection={handleAddConnection}
                onEditConnection={handleEditConnection}
                onRefresh={refetch}
                existingTypes={getExistingConnectionTypes()}
            />
        </div>
    );
}

export default function SSOConnectionsPage() {
    return (
        <SSOConfigProvider>
            <SSOConnectionsPageInner />
        </SSOConfigProvider>
    );
}