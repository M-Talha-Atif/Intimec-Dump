
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Grid3X3 } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';
import { appRiskMatrix } from '@/data/mock-risk-analytics';
import { cn } from '@/lib/utils';

interface Props {
  onCellClick?: (application: string, category: string, score: number) => void;
}

export const RiskHeatmap: React.FC<Props> = ({ onCellClick }) => {
  const categories = [
    { key: 'sod' as const, label: 'SoD' },
    { key: 'excessive' as const, label: 'Excessive' },
    { key: 'unused' as const, label: 'Unused' },
    { key: 'orphaned' as const, label: 'Orphaned' },
    { key: 'privileged' as const, label: 'Privileged' },
  ];

  const getCellColor = (score: number) => {
    if (score >= 80) return 'bg-red-500/80 text-white';
    if (score >= 60) return 'bg-orange-400/80 text-white';
    if (score >= 40) return 'bg-yellow-400/80 text-foreground';
    return 'bg-green-400/60 text-foreground';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Grid3X3 className="h-4 w-4 text-primary" />
          Access Risk Heatmap
          <InfoTooltip text="Application × Risk Category matrix. Click any cell to drill down into specific risk details for that app and category." />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/80" /> 80+</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-400/80" /> 60-79</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400/80" /> 40-59</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-400/60" /> &lt;40</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-2 font-medium text-muted-foreground min-w-[110px]">Application</th>
                {categories.map(c => (
                  <th key={c.key} className="p-2 font-medium text-muted-foreground text-center min-w-[70px]">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appRiskMatrix.map((app) => (
                <tr key={app.application} className="border-t border-border/50">
                  <td className="p-2 font-medium text-foreground">{app.application}</td>
                  {categories.map(c => (
                    <td key={c.key} className="p-1 text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn("rounded px-2 py-1.5 font-semibold cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all", getCellColor(app[c.key]))}
                              onClick={() => onCellClick?.(app.application, c.label, app[c.key])}
                            >
                              {app[c.key]}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{app.application} — {c.label}: {app[c.key]}/100 • Click for details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
