import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Clock, FileText } from 'lucide-react';

interface ComplianceItem {
  id: string;
  framework: string;
  control: string;
  status: 'compliant' | 'warning' | 'non-compliant';
  lastAttestation: string;
  nextDue: string;
}

const mockCompliance: ComplianceItem[] = [
  {
    id: '1',
    framework: 'SOX',
    control: 'Access Control Review',
    status: 'compliant',
    lastAttestation: '2024-01-01',
    nextDue: '2024-04-01',
  },
  {
    id: '2',
    framework: 'GDPR',
    control: 'Data Privacy Controls',
    status: 'warning',
    lastAttestation: '2023-12-15',
    nextDue: '2024-02-15',
  },
  {
    id: '3',
    framework: 'ISO 27001',
    control: 'Information Security',
    status: 'non-compliant',
    lastAttestation: '2023-10-01',
    nextDue: '2024-01-01',
  },
];

export function ComplianceTab() {
  const totalControls = mockCompliance.length;
  const compliantControls = mockCompliance.filter((c) => c.status === 'compliant').length;
  const complianceScore = Math.round((compliantControls / totalControls) * 100);

  return (
    <div className="space-y-6">
      {/* Compliance Score Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Compliance Score</CardTitle>
          <CardDescription>Current compliance status across all frameworks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold">{complianceScore}%</div>
              <p className="text-sm text-muted-foreground mt-1">
                {compliantControls} of {totalControls} controls compliant
              </p>
            </div>
            <div className="text-right">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
          <Progress value={complianceScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Compliance Status Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{compliantControls}</div>
                <div className="text-sm text-muted-foreground">Compliant</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">
                  {mockCompliance.filter((c) => c.status === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold">
                  {mockCompliance.filter((c) => c.status === 'non-compliant').length}
                </div>
                <div className="text-sm text-muted-foreground">Non-Compliant</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Controls List */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Controls</CardTitle>
          <CardDescription>Detailed view of all applicable controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCompliance.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline">{item.framework}</Badge>
                    <Badge
                      variant={
                        item.status === 'compliant'
                          ? 'default'
                          : item.status === 'warning'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {item.status === 'compliant' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {item.status === 'warning' && <Clock className="w-3 h-3 mr-1" />}
                      {item.status === 'non-compliant' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {item.status}
                    </Badge>
                  </div>
                  <h4 className="font-medium mb-1">{item.control}</h4>
                  <div className="text-sm text-muted-foreground">
                    Last Attestation: {item.lastAttestation} • Next Due: {item.nextDue}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Remediation Items */}
      <Card>
        <CardHeader>
          <CardTitle>Remediation Items</CardTitle>
          <CardDescription>Actions required to achieve full compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h5 className="font-medium mb-1">Complete ISO 27001 Certification</h5>
                <p className="text-sm text-muted-foreground">
                  Overdue by 14 days. Immediate action required.
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Start Remediation
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h5 className="font-medium mb-1">GDPR Data Privacy Review</h5>
                <p className="text-sm text-muted-foreground">Due in 30 days. Schedule review session.</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Schedule Review
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
