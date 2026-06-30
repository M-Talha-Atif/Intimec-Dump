import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Eye, User, Users as GroupIcon } from "lucide-react";
import { getRiskColor, getStatusColor } from "../utils";
import type { MemberRowProps } from "../types";

export const MemberRow = ({ member, onViewMember }: MemberRowProps) => {
  const getSourceIcon = (source: string) => {
    switch (source) {
      case "Direct":
        return <User className="h-4 w-4" />;
      case "Role":
        return (
          <Badge variant="outline" className="text-xs">
            R
          </Badge>
        );
      case "Group":
        return <GroupIcon className="h-4 w-4" />;
      case "Policy":
        return (
          <Badge variant="outline" className="text-xs">
            P
          </Badge>
        );
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{member.name}</div>
          <div className="text-sm text-gray-500">{member.email}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {getSourceIcon(member.source)}
          <span>{member.source}</span>
        </div>
      </TableCell>
      <TableCell>
        {member.source === "Role" ? (
          <Button variant="link" className="p-0 h-auto text-blue-600">
            {member.path}
          </Button>
        ) : (
          <span>{member.path}</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={getStatusColor(member.status)}>
          {member.status}
        </Badge>
      </TableCell>
      <TableCell>{member.assignedOn}</TableCell>
      <TableCell>{member.expiresOn}</TableCell>
      <TableCell>
        <Badge variant="outline" className={getRiskColor(member.risk)}>
          {member.risk}
        </Badge>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" onClick={() => onViewMember(member)}>
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </TableCell>
    </TableRow>
  );
};
