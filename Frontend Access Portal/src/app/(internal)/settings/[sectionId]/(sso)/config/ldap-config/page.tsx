"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LDAPConfigForm } from "@/components/Auth/sso/LDAPConfigForm";
import { SSOConfigProvider } from "@/components/Auth/sso/SSOConfigContext";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react";
import { getSSOConfig } from "@/lib/sso";

export default function LDAPConfigPage() {
  const [loading, setLoading] = useState(false);
  const [existingConfig, setExistingConfig] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  useEffect(() => {
    if (isEditing) {
      // Fetch existing configuration for editing
      const fetchConfig = async () => {
        try {
          setLoading(true);
          const data = await getSSOConfig("ldap");
          console.log("Fetched LDAP config for editing:", data);
          setExistingConfig(data);
        } catch (error) {
          console.error("Error fetching LDAP config:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchConfig();
    }
  }, [isEditing, editId]);

  const handleBack = () => {
    if (isEditing) {
      router.push("/settings/sso");
    } else {
      router.push("/settings/sso/config");
    }
  };

  const handleContinue = (data: any) => {
    // console.log("LDAP Configuration Data:", data);
    // Handle form submission here
    // After successful creation/update, go back to table view
    router.push("/settings/sso");
  };

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="flex items-center justify-center h-64">
          <IconLoader2 className="w-8 h-8 text-[#438D98] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <SSOConfigProvider>
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Button onClick={handleBack} variant="outline" className="mb-6">
            <IconArrowLeft className="w-4 h-4 mr-2" />
            Back to {isEditing ? "SSO Connections" : "Method Selection"}
          </Button>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              {isEditing ? "Edit" : "Configure"} LDAP Directory
            </h2>
            <p className="text-slate-600">
              {isEditing ? "Update your" : "Enter your"} LDAP configuration
              details
            </p>
          </div>

          <LDAPConfigForm
            onBack={handleBack}
            onContinue={handleContinue}
            existingConfig={existingConfig}
            isEditing={isEditing}
          />
        </div>
      </div>
    </SSOConfigProvider>
  );
}
