import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CustomBadge from "@/components/applications/common/CustomBadge";
import {
  riskBadgeMap,
  userStatusBadgeMap,
} from "@/components/applications/common/badgeMap";
import { EntitlementWithUsersMeta } from "@/components/applications/types";
import DetailCard from "@/components/applications/common/DetailCard";

export const EntitlementDetail = ({
  entitlement,
}: {
  entitlement: EntitlementWithUsersMeta;
}) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-6">
        <DetailCard
          title="Core Metadata"
          details={[
            { label: "Technical Name", value: "memberOf" },
            { label: "Name", value: entitlement.name },
            {
              label: "Description",
              value: entitlement.description || "No description provided.",
            },
            {
              label: "Type",
              value: <Badge variant="outline">{entitlement.type}</Badge>,
            },
            {
              label: "Requestable",
              value: entitlement.requestable ? "Yes" : "No",
            },
            {
              label: "Classifications",
              value: entitlement.classification.map((c) => (
                <Badge key={c} variant="outline">
                  {c}
                </Badge>
              )),
            },
          ]}
        />

        <DetailCard
          title="Governance"
          details={[
            {
              label: "Owner",
              value: "No owner assigned",
            },
            {
              label: "Risk Level",
              value: (
                <CustomBadge color={riskBadgeMap[entitlement.riskLevel]}>
                  {entitlement.riskLevel || "Unknown"}
                </CustomBadge>
              ),
            },
            {
              label: "Risk Description",
              value: entitlement.riskReason || "No description provided.",
            },
            { label: "AI Analysis", value: "to be implemented" },
          ]}
          bottomActions={
            <>
              <Button size="sm" variant="outline">
                Initiate Review
              </Button>
              <Button size="sm" variant="outline">
                Assign Owner
              </Button>
              <Button size="sm" variant="outline">
                Deprecate
              </Button>
            </>
          }
        />
      </div>

      {entitlement.users && entitlement.users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Membership ({entitlement.users.length} Users)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md max-h-60 overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted/50 border-b-1">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entitlement.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.manager}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <CustomBadge
                          color={userStatusBadgeMap[user.status] || "gray"}
                        >
                          {user.status}
                        </CustomBadge>
                      </TableCell>
                      <TableCell>
                        <CustomBadge color={riskBadgeMap[user.riskLevel]}>
                          {user.riskLevel}
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

export default EntitlementDetail;
