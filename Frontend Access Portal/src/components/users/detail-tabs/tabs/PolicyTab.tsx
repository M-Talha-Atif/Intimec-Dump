import React from "react";
import { type PolicyViolation } from "@/data/mock-users";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { TabProps } from "../shared";

const PolicyTab: React.FC<TabProps> = ({ user }) => {
  if (!user.policyViolations || user.policyViolations.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Policy Violations</CardTitle>
          <CardDescription>
            Segregation of Duties (SoD) or other policy violations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-md">
            <ShieldCheck className="w-6 h-6" />
            <p className="font-medium">No policy violations detected.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Policy Violations</CardTitle>
        <CardDescription>
          Segregation of Duties (SoD) or other policy violations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Detected On</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {user.policyViolations.map((violation: PolicyViolation) => (
              <TableRow key={violation.id} className="align-top">
                <TableCell className="font-medium">
                  {violation.policyName}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs">
                  {violation.description}
                </TableCell>
                <TableCell>{violation.timestamp}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      violation.status === "Open" ? "destructive" : "secondary"
                    }
                  >
                    <AlertCircle className="mr-1.5 h-3 w-3" />
                    {violation.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PolicyTab;
