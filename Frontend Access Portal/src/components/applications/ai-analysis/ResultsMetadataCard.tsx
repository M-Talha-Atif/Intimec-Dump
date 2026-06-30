import { Card, CardContent } from "@/components/ui/card";
import { shortDate } from "@/utils/dateFormat";
import clsx from "clsx";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ResultsMetadataCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  metadata: {
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    lastScan: number;
  };
  className?: string;
}

export default function ResultsMetadataCard({
  metadata,
  className = "",
  ...props
}: ResultsMetadataCardProps) {
  return (
    <Card
      className={clsx("border-blue-200 bg-blue-50 mx-4", className)}
      {...props}
    >
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-blue-900">
              Latest AI Analysis data
            </h4>
            <div className="flex items-center space-x-4 mt-1">
              {metadata.highRiskCount > 0 && (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                  {metadata.highRiskCount} High Risks
                </Badge>
              )}
              {metadata.mediumRiskCount > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  {metadata.mediumRiskCount} Medium Risks
                </Badge>
              )}
              {metadata.lowRiskCount > 0 && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {metadata.lowRiskCount} Low Risks
                </Badge>
              )}
            </div>
            <div className="text-sm text-blue-900">
              Last scan: {shortDate(metadata.lastScan)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
