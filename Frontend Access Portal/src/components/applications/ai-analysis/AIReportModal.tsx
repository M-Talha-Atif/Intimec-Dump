
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, RefreshCw, Eye, Share, AlertTriangle, Shield, Users, Activity, TrendingUp, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPriorityBadgeClass } from '@/utils/getBadgeClass';
import { getRiskBadgeClass } from '@/utils/getRiskColor';

type AIAnalysisReport = {
  summaryKPIs: {
    totalIdentities: number;
    highRiskUsers: number;
    sodViolations: number;
    orphanedAccesses: number;
    adminWithExcessiveRights: number;
    riskScoreRange: { min: number; max: number; avg: number };
  };
  riskDistribution: {
    department: string;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  }[];
  outliers: {
    entitlement: string;
    outliersCount: number;
    prevalence: number;
    riskLevel: 'high' | 'medium' | 'low';
  }[];
  sodViolations: {
    userId: string;
    userName: string;
    violations: string[];
    riskScore: number;
    department: string;
  }[];
  suggestions: {
    type: 'remediation' | 'optimization' | 'policy';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    affectedUsers: number;
  }[];
  rawTextResponse: string;
};

type AIReportModalProps = {
  report: AIAnalysisReport;
  onClose: () => void;
  onRerun: () => void;
};

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

const AIReportModal = ({ report, onClose, onRerun }: AIReportModalProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showRawResponse, setShowRawResponse] = useState(false);

  const exportReport = (format: 'pdf' | 'json') => {
    console.log(`Exporting AI report as ${format}`);
    // Implementation would generate and download the report
  };

  const shareReport = () => {
    console.log('Sharing report with GRC team');
    // Implementation would notify audit system
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Access Matrix Analysis Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Button onClick={onRerun} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-run Analysis
              </Button>
              <Button onClick={() => setShowRawResponse(!showRawResponse)} variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                {showRawResponse ? 'Hide' : 'View'} Raw Response
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => exportReport('pdf')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={() => exportReport('json')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button onClick={shareReport} size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share Report
              </Button>
            </div>
          </div>

          {/* Raw Response Toggle */}
          {showRawResponse && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm">Raw AI Response</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {report.rawTextResponse}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="violations">Violations</TabsTrigger>
              <TabsTrigger value="outliers">Outliers</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Identities</p>
                        <p className="text-2xl font-bold">{report.summaryKPIs.totalIdentities}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">High-Risk Users</p>
                        <p className="text-2xl font-bold text-red-600">{report.summaryKPIs.highRiskUsers}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">SoD Violations</p>
                        <p className="text-2xl font-bold text-orange-600">{report.summaryKPIs.sodViolations}</p>
                      </div>
                      <Shield className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Orphaned Access</p>
                        <p className="text-2xl font-bold text-yellow-600">{report.summaryKPIs.orphanedAccesses}</p>
                      </div>
                      <Activity className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Excessive Admins</p>
                        <p className="text-2xl font-bold text-purple-600">{report.summaryKPIs.adminWithExcessiveRights}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Risk Score</p>
                        <p className="text-2xl font-bold">{report.summaryKPIs.riskScoreRange.avg.toFixed(1)}</p>
                      </div>
                      <Brain className="h-8 w-8 text-indigo-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Distribution by Department</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={report.riskDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="highRisk" fill="#ef4444" name="High Risk" />
                        <Bar dataKey="mediumRisk" fill="#f59e0b" name="Medium Risk" />
                        <Bar dataKey="lowRisk" fill="#10b981" name="Low Risk" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Outlier Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={report.outliers}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ entitlement, outliersCount }) => `${entitlement}: ${outliersCount}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="outliersCount"
                        >
                          {report.outliers.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="violations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Segregation of Duties Violations</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Violations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.sodViolations.map((violation, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{violation.userName}</TableCell>
                          <TableCell>{violation.department}</TableCell>
                          <TableCell>
                            <Badge variant={violation.riskScore > 70 ? 'destructive' : violation.riskScore > 40 ? 'secondary' : 'default'}>
                              {violation.riskScore}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {violation.violations.map((v, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{v}</Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outliers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Access Outliers by Entitlement</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entitlement</TableHead>
                        <TableHead>Outliers Count</TableHead>
                        <TableHead>Prevalence</TableHead>
                        <TableHead>Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.outliers.map((outlier, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{outlier.entitlement}</TableCell>
                          <TableCell>{outlier.outliersCount}</TableCell>
                          <TableCell>{(outlier.prevalence * 100).toFixed(1)}%</TableCell>
                          <TableCell>
                            <Badge className={cn(getRiskBadgeClass(outlier.riskLevel), "border text-xs")}>
                              {outlier.riskLevel}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-4">
                {report.suggestions.map((suggestion, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={cn(getPriorityBadgeClass(suggestion.priority), "border text-xs")}>
                            {suggestion.priority} priority
                          </Badge>
                          <Badge variant="outline">
                            {suggestion.affectedUsers} users affected
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{suggestion.description}</p>
                      <Badge variant="secondary" className="mt-2">
                        {suggestion.type}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIReportModal;
