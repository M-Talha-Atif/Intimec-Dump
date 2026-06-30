import { Cloud, Server, Globe, AppWindow } from "lucide-react";

interface ConnectorIconProps {
  type: string;
  className?: string;
}

export const ConnectorIcon = ({
  type,
  className = "h-4 w-4",
}: ConnectorIconProps) => {
  switch (type) {
    case "saas":
      return <Cloud className={className} />;
    case "on-prem":
      return <Server className={className} />;
    case "cloud":
      return <Globe className={className} />;
    default:
      return <AppWindow className={className} />;
  }
};
