import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { scopeAnalysisService } from '@/services/scopeAnalysisService';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface ScopePreviewProps {
  campaignType: string;
  scopeConfig: any;
}

const ScopePreview = ({ campaignType, scopeConfig }: ScopePreviewProps) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaignType) return;
    setLoading(true);
    scopeAnalysisService.analyzeCampaignScope({ campaignType, ...scopeConfig })
      .then(setAnalysis)
      .catch(e => console.error('Failed to load analysis:', e))
      .finally(() => setLoading(false));
  }, [campaignType, scopeConfig]);

  return (
    <Card className="p-4 sticky top-4">
      <h3 className="font-semibold mb-4">Scope Preview</h3>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : analysis ? (
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <p className="text-sm text-muted-foreground">Estimated Items</p>
              <InfoTooltip text="Total number of access review items that will be generated based on current scope filters" />
            </div>
            <p className="text-3xl font-bold">{analysis.estimatedItems}</p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <p className="text-sm text-muted-foreground">Reviewers Needed</p>
              <InfoTooltip text="Estimated number of reviewers required based on the assignment strategy and workload limits" />
            </div>
            <p className="text-2xl font-bold">{analysis.estimatedReviewers}</p>
          </div>

          {Object.keys(analysis.breakdown).length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Breakdown</p>
              <div className="space-y-2">
                {Object.entries(analysis.breakdown).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{key}</span>
                    <span className="font-medium">{value as number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1 mb-2">
              <p className="text-sm font-medium">Risk Distribution</p>
              <InfoTooltip text="Breakdown of review items by risk level to help prioritize reviewer attention" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Critical</span>
                <Badge variant="destructive" className="text-xs">{analysis.riskDistribution.critical}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">High</span>
                <Badge variant="destructive" className="text-xs">{analysis.riskDistribution.high}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Medium</span>
                <Badge variant="secondary" className="text-xs">{analysis.riskDistribution.medium}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Low</span>
                <Badge variant="outline" className="text-xs">{analysis.riskDistribution.low}</Badge>
              </div>
            </div>
          </div>

          {analysis.warnings.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-warning">Warnings</p>
              {analysis.warnings.map((warning: string, index: number) => (
                <p key={index} className="text-xs text-muted-foreground">{warning}</p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Configure filters to see preview
        </div>
      )}
    </Card>
  );
};

export default ScopePreview;
