import React from "react";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Shield, ClipboardCheck, Link } from "lucide-react";
import { RoleFormState } from "../types";

interface ReviewSubmitTabProps {
  form: RoleFormState;
  error?: string | null;
}

const ReviewSubmitTab: React.FC<ReviewSubmitTabProps> = ({ form, error }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4" /> Review Summary
      </h3>

      <div className="space-y-3">
        {/* Basic Info */}
        <div className="rounded-lg border p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <FileText className="h-3 w-3" /> Basic Information
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["Name", form.name],
              ["Type", form.type],
              ["Status", form.status === "disabled" ? "Disabled" : "Enabled"],
              ["Business Unit", form.businessUnit || "—"],
            ].map(([l, v]) => (
              <div key={l as string}>
                <span className="text-muted-foreground text-xs">{l}:</span>{" "}
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
          {form.classification.length > 0 && (
            <div className="mt-2">
              <span className="text-muted-foreground text-xs">Classification:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {form.classification.map((c) => (
                  <Badge key={c} variant="outline" className="text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Governance */}
        <div className="rounded-lg border p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Users className="h-3 w-3" /> Governance
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["Owner", form.owner || "—"],
              ["Approval", form.approvalWorkflow],
              ["Cert Schedule", form.certSchedule],
              ["Requestable", form.requestable ? "Yes" : "No"],
            ].map(([l, v]) => (
              <div key={l as string}>
                <span className="text-muted-foreground text-xs">{l}:</span>{" "}
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Entitlements & Risk */}
        <div className="rounded-lg border p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Shield className="h-3 w-3" /> Entitlements & Risk
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Entitlements:</span>{" "}
              <span className="font-medium">{form.entitlements.length} selected</span>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Risk Level:</span>{" "}
              <span className="font-medium">{form.riskLevel}</span>
            </div>
          </div>
          {form.complianceTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {form.complianceTags.map((t) => (
                <Badge key={t} variant="outline" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </div>

                {/* Child Roles */}
        {(form.childRoleIds || []).length > 0 && (
          <div className="rounded-lg border p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Link className="h-3 w-3" /> Child Roles
            </p>
            <div className="text-sm">
              <span className="text-muted-foreground text-xs">Child Roles:</span>{" "}
              <span className="font-medium">{(form.childRoleIds || []).length} selected</span>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Description</p>
          <p className="text-sm">{form.description}</p>
        </div>
      </div>

      {/* API Error */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
          <p className="text-sm text-destructive font-medium">Failed to create role</p>
          <p className="text-xs text-destructive/80 mt-1">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewSubmitTab;