import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

interface ComplianceIconProps {
  status: string;
  className?: string;
}

export const ComplianceIcon = ({
  status,
  className = "h-4 w-4",
}: ComplianceIconProps) => {
  switch (status) {
    case "compliant":
      return <CheckCircle className={`${className} text-primary`} />;
    case "violations":
      return <AlertCircle className={`${className} text-destructive`} />;
    case "review_needed":
      return <AlertTriangle className={`${className} text-warning`} />;
    default:
      return null;
  }
};
