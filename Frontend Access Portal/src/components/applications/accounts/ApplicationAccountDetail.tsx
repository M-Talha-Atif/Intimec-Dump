import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DetailCard from "@/components/applications/common/DetailCard";

import CustomBadge from "@/components/applications/common/CustomBadge";
import {
  riskBadgeMap,
  userStatusBadgeMap,
} from "@/components/applications/common/badgeMap";
import { AccountWithUserAndEntitlements } from "@/components/applications/types";

interface ApplicationAccountDetailProps {
  item: AccountWithUserAndEntitlements;
}

const ApplicationAccountDetail = ({
  item: account,
}: ApplicationAccountDetailProps) => {
  const coorrelatedIdentityDetails = [
    {
      label: "Name",
      value: account.user?.name || "No Account Name",
    },
    { label: "Department", value: account.user?.department },
    { label: "Manager", value: account.user?.manager },
    { label: "Identity Type", value: account.user?.type },
    {
      label: "Identity Status",
      value: (
        <CustomBadge
          color={userStatusBadgeMap[account.user?.status || "Unknown"]}
        >
          {account.user?.status}
        </CustomBadge>
      ),
    },
  ];

  const governanceDetails = [
    {
      label: "Risk Level",
      value: (
        <CustomBadge color={riskBadgeMap[account.user?.riskLevel || "Unknown"]}>
          {account.user?.riskLevel}
        </CustomBadge>
      ),
    },
    {
      label: "Risk Description",
      value: "No description provided.",
    },
    { label: "AI Analysis", value: "to be implemented" },
  ];

  const accountAttributes = account.applicationAttributes
    ? Object.entries(account.applicationAttributes).map(([key, value]) => ({
        label: key,
        value: value,
      }))
    : [];

  const hasMemberships =
    account.entitlements && account.entitlements.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-6">
        {accountAttributes.length > 0 && (
          <DetailCard
            title="Account Attributes"
            details={accountAttributes}
            showMoreCount={5}
          />
        )}
        <DetailCard
          title="Correlated Identity"
          details={coorrelatedIdentityDetails}
          className="h-82"
        />
        <DetailCard
          details={governanceDetails}
          title="Governance"
          className="h-82"
          bottomActions={
            <>
              <Button size="sm" variant="outline">
                Revoke Access
              </Button>
              <Button size="sm" variant="outline">
                Reassign Owner
              </Button>
              <Button size="sm" variant="outline">
                Certify Access
              </Button>
            </>
          }
        />
      </div>

      {hasMemberships && (
        <Card>
          <CardHeader>
            <CardTitle>Memberships & Access</CardTitle>
            <CardDescription>
              <span className="text-wrap">
                Directly assigned groups on the application and entitlements
                from the correlated identity.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-6">
            {hasMemberships && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">
                  Member Of (Direct Application Groups)
                </h4>
                <div className="border rounded-md  max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader className="border-b-1">
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Risk</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {account.entitlements.map((entitlement) => (
                        <TableRow key={entitlement.id}>
                          <TableCell>
                            <Badge variant="outline">{entitlement.type}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {entitlement.name}
                          </TableCell>
                          <TableCell>
                            <span className="text-wrap">
                              {entitlement.description}
                            </span>
                          </TableCell>
                          <TableCell>
                            <CustomBadge
                              color={riskBadgeMap[entitlement.riskLevel]}
                            >
                              {entitlement.riskLevel}
                            </CustomBadge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {account.policyViolations && account.policyViolations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Policy Violations</CardTitle>
            <CardDescription>
              Policies this identity is currently violating.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="rounded-md border-1 overflow-clip">
              <Table>
                <TableHeader className="border-b-1">
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {account.policyViolations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell>{violation.policyName}</TableCell>
                      <TableCell>
                        <span className="text-wrap">
                          {violation.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        <CustomBadge
                          color={violation.status == "Open" ? "red" : "green"}
                        >
                          {violation.status}
                        </CustomBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationAccountDetail;
