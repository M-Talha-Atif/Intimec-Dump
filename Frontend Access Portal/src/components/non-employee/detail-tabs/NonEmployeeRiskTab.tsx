
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Shield, 
  Clock, 
  CheckCircle,
  TrendingUp
} from 'lucide-react';

type NonEmployeeRiskTabProps = {
  nonEmployee: any;
};

const defaultRiskContributors = [
  { id: 'drc1', title: 'Contract Expiring Soon', severity: 'High', description: 'Contract expires soon but access remains active', category: 'Lifecycle' },
  { id: 'drc2', title: 'Elevated Access Without Review', severity: 'Medium', description: 'Administrative access not reviewed in 90 days', category: 'Access' },
  { id: 'drc3', title: 'Inactive Sponsor', severity: 'Medium', description: 'Sponsor has not logged in for 30 days', category: 'Governance' }
];

export function NonEmployeeRiskTab({ nonEmployee }: NonEmployeeRiskTabProps) {
  const riskScore = nonEmployee.riskScore || (nonEmployee.riskLevel === 'High' ? 82 : nonEmployee.riskLevel === 'Medium' ? 58 : 25);
  const contributors = nonEmployee.riskContributors?.length ? nonEmployee.riskContributors : defaultRiskContributors;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Risk Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Risk Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getRiskColor(riskScore)}`}>{riskScore}</div>
              <div className="text-sm text-slate-600 mb-4">Overall Risk Score</div>
              <Progress value={riskScore} className="w-full" />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">High Severity</span>
                <Badge variant="destructive">
                  {contributors.filter((r: any) => r.severity === 'High').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Medium Severity</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {contributors.filter((r: any) => r.severity === 'Medium').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Low Severity</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {contributors.filter((r: any) => r.severity === 'Low').length}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Trend Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Risk Trend (30 Days)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-sm text-muted-foreground">Risk trend visualization</p>
          </div>
        </CardContent>
      </Card>

      {/* Risk Contributors */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contributors.map((risk: any) => (
              <div key={risk.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mt-0.5">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-slate-900">{risk.title}</h3>
                        <Badge className={getSeverityColor(risk.severity)}>
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{risk.description}</p>
                      <span className="text-xs text-slate-500">Category: {risk.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Remediate
                    </Button>
                    <Button size="sm" variant="ghost">
                      Accept Risk
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Risk Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Risk Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-slate-600">Jun 20, 2024</span>
              <span className="text-slate-900">After-hours access detected</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-600">Jun 18, 2024</span>
              <span className="text-slate-900">New geographic login location</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-slate-600">Jun 15, 2024</span>
              <span className="text-slate-900">Access review overdue notification</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
