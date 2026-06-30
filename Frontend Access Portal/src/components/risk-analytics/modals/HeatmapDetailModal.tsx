import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Grid3X3, Search, Download, AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeatmapCell {
  roleId: string;
  roleName: string;
  entitlementId: string;
  entitlementName: string;
  riskScore: number;
  riskFactors: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  userCount: number;
}

interface HeatmapDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCell?: HeatmapCell | null;
}

export const HeatmapDetailModal: React.FC<HeatmapDetailModalProps> = ({
  isOpen,
  onClose,
  selectedCell
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'risk' | 'role' | 'entitlement'>('risk');

  // Generate mock heatmap data
  const generateHeatmapData = (): HeatmapCell[] => {
    const roles = [
      'Finance Admin', 'HR Manager', 'IT Admin', 'Sales Rep', 'Auditor',
      'Legal Counsel', 'Operations Manager', 'Security Admin', 'Dev Lead', 'Product Manager'
    ];
    
    const entitlements = [
      'Bank Transfer', 'Salary Access', 'System Config', 'Customer Data',
      'Audit Reports', 'Legal Docs', 'Inventory Mgmt', 'Security Config',
      'Code Deploy', 'Database Admin'
    ];

    const data: HeatmapCell[] = [];
    
    roles.forEach((role, roleIdx) => {
      entitlements.forEach((entitlement, entIdx) => {
        const baseRisk = Math.random() * 100;
        const riskFactors: string[] = [];
        let riskScore = baseRisk;
        
        if ((role.includes('Admin') && entitlement.includes('Config')) ||
            (role === 'Finance Admin' && entitlement === 'Bank Transfer')) {
          riskFactors.push('High Privilege Combination');
          riskScore += 20;
        }
        
        if (role === 'HR Manager' && entitlement === 'Salary Access') {
          riskFactors.push('SoD Conflict');
          riskScore += 15;
        }
        
        if (Math.random() > 0.6) {
          riskFactors.push('Rarely Used');
          riskScore += 10;
        }
        
        riskScore = Math.min(riskScore, 100);
        
        let severity: 'critical' | 'high' | 'medium' | 'low' = 'low';
        if (riskScore >= 80) severity = 'critical';
        else if (riskScore >= 60) severity = 'high';
        else if (riskScore >= 40) severity = 'medium';
        
        data.push({
          roleId: `role-${roleIdx}`,
          roleName: role,
          entitlementId: `ent-${entIdx}`,
          entitlementName: entitlement,
          riskScore: Math.round(riskScore),
          riskFactors,
          severity,
          userCount: Math.floor(Math.random() * 20) + 1
        });
      });
    });
    
    return data;
  };

  const [heatmapData] = useState(generateHeatmapData());

  const getCellColor = (severity: string, riskScore: number) => {
    const baseColors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return baseColors[severity as keyof typeof baseColors] || 'bg-gray-300';
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'border-red-300 bg-red-50 text-red-700',
      high: 'border-orange-300 bg-orange-50 text-orange-700',
      medium: 'border-yellow-300 bg-yellow-50 text-yellow-700',
      low: 'border-green-300 bg-green-50 text-green-700'
    };
    return colors[severity as keyof typeof colors];
  };

  const filteredData = heatmapData
    .filter(cell => 
      cell.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cell.entitlementName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'risk':
          return b.riskScore - a.riskScore;
        case 'role':
          return a.roleName.localeCompare(b.roleName);
        case 'entitlement':
          return a.entitlementName.localeCompare(b.entitlementName);
        default:
          return 0;
      }
    });

  const criticalCount = heatmapData.filter(c => c.severity === 'critical').length;
  const highCount = heatmapData.filter(c => c.severity === 'high').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Grid3X3 className="h-5 w-5" />
              <span>Role-Entitlement Risk Heatmap</span>
              <Badge variant="outline">{heatmapData.length} Combinations</Badge>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{heatmapData.length}</div>
                <p className="text-xs text-muted-foreground">Total Combinations</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
                <p className="text-xs text-muted-foreground">Critical Risk</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">{highCount}</div>
                <p className="text-xs text-muted-foreground">High Risk</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {Math.round(heatmapData.reduce((sum, c) => sum + c.riskScore, 0) / heatmapData.length)}
                </div>
                <p className="text-xs text-muted-foreground">Average Risk Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles or entitlements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Button
                variant={sortBy === 'risk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('risk')}
              >
                Risk Score
              </Button>
              <Button
                variant={sortBy === 'role' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('role')}
              >
                Role
              </Button>
              <Button
                variant={sortBy === 'entitlement' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('entitlement')}
              >
                Entitlement
              </Button>
            </div>
          </div>

          {/* Heatmap Grid */}
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-1 gap-2 pr-4">
              {filteredData.map((cell, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={cn("h-12 w-12 rounded flex items-center justify-center", getCellColor(cell.severity, cell.riskScore))}>
                          <span className="text-white font-bold">{cell.riskScore}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{cell.roleName}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium">{cell.entitlementName}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className={getSeverityBadge(cell.severity)}>
                              {cell.severity}
                            </Badge>
                            {cell.riskFactors.map((factor, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{cell.userCount} users</span>
                        </div>
                        <Button size="sm" variant="outline" className="mt-2">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Selected Cell Detail */}
          {selectedCell && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Selected Combination Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Role:</span>
                    <span className="ml-2 font-medium">{selectedCell.roleName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Entitlement:</span>
                    <span className="ml-2 font-medium">{selectedCell.entitlementName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk Score:</span>
                    <span className="ml-2 font-medium">{selectedCell.riskScore}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Severity:</span>
                    <Badge variant="outline" className={cn("ml-2", getSeverityBadge(selectedCell.severity))}>
                      {selectedCell.severity}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
