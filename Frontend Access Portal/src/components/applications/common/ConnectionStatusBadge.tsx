import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Application } from "@/types/application";
import CustomBadge from "./CustomBadge";

export default function ConnectionStatusBadge({
  status,
}: {
  status: Application["connectionStatus"];
}) {
  switch (status) {
    case "Connected":
      return (
        <CustomBadge
          color="green"
          className="flex gap-2 items-center"
        >
          <CheckCircle className="size-3 text-green-600 dark:text-green-300" />
          Connected
        </CustomBadge>
      );

    case "Connection Problem":
      return (
        <CustomBadge
          color="yellow"
          className="flex gap-2 items-center"
        >
          <AlertTriangle className="size-3 text-yellow-600 dark:text-yellow-300" />
          Connection Problem
        </CustomBadge>
      );

    case "Offline":
      return (
        <CustomBadge
          color="red"
          className="flex gap-2 items-center"
        >
          <XCircle className="size-3 text-red-600 dark:text-red-300" />
          Offline
        </CustomBadge>
      );
  }
}
