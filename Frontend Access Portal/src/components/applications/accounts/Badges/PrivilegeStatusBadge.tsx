import { User } from "@/types/user";

import { Badge } from "@/components/ui/badge";

export default function PrivilegeStatusBadge({
  isPrivileged,
}: {
  isPrivileged: User["isPrivileged"];
}) {
  switch (isPrivileged) {
    case true:
      return (
        <Badge variant="outline" className="text-orange-600 border-orange-300 dark:text-orange-300 dark:border-orange-600">
          Yes
        </Badge>
      );
    case false:
    default:
      return <Badge variant="outline">No</Badge>;
  }
}
