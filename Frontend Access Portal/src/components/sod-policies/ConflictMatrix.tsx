import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, Eye, Settings } from 'lucide-react';
import { ConflictDetailsModal, MatrixConfigurationModal } from './modals';

export const ConflictMatrix = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<any>(null);

  const roles = [
    'Finance Manager', 'IT Admin', 'HR Partner', 'Sales Director', 'Audit Manager'
  ];

  const entitlements = [
    'Approve Invoices', 'Create Users', 'View Payroll', 'Access Vault', 'Generate Reports'
  ];

  // Matrix data: 0 = No Conflict, 1 = Conflict, 2 = Exception
  const conflictMatrix = [
    [0, 1, 0, 2, 0], // Finance Manager
    [1, 0, 1, 0, 1], // IT Admin
    [0, 1, 0, 0, 0], // HR Partner
    [2, 0, 0, 0, 1], // Sales Director
    [0, 1, 0, 1, 0], // Audit Manager
  ];

  const getConflictStatus = (value: number) => {
    switch (value) {
      case 0:
        return { color: 'bg-green-100 border-green-200', icon: '✅', text: 'No Conflict' };
      case 1:
        return { color: 'bg-red-100 border-red-200', icon: '❌', text: 'Conflict' };
      case 2:
        return { color: 'bg-yellow-100 border-yellow-200', icon: '⚠️', text: 'Exception' };
      default:
        return { color: 'bg-gray-100 border-gray-200', icon: '?', text: 'Unknown' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visual Conflict Matrix</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setConfigModalOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                AI Insights
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search roles or entitlements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conflicts</SelectItem>
                <SelectItem value="violations">Active Violations</SelectItem>
                <SelectItem value="exceptions">Exceptions Only</SelectItem>
                <SelectItem value="high-risk">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-100 border border-green-200 rounded flex items-center justify-center text-xs">✅</div>
              <span className="text-sm">No Conflict</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-100 border border-red-200 rounded flex items-center justify-center text-xs">❌</div>
              <span className="text-sm">Conflict</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-yellow-100 border border-yellow-200 rounded flex items-center justify-center text-xs">⚠️</div>
              <span className="text-sm">Exception</span>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid gap-1" style={{ gridTemplateColumns: `200px repeat(${entitlements.length}, 120px)` }}>
                {/* Header Row */}
                <div className="p-3 font-medium bg-gray-50 border rounded"></div>
                {entitlements.map((entitlement, index) => (
                  <div key={index} className="p-3 font-medium bg-gray-50 border rounded text-center text-xs">
                    {entitlement}
                  </div>
                ))}

                {/* Matrix Rows */}
                {roles.map((role, roleIndex) => (
                  <React.Fragment key={roleIndex}>
                    <div className="p-3 font-medium bg-gray-50 border rounded text-xs">
                      {role}
                    </div>
                    {entitlements.map((_, entitlementIndex) => {
                      const conflict = conflictMatrix[roleIndex][entitlementIndex];
                      const status = getConflictStatus(conflict);
                      return (
                        <div
                          key={entitlementIndex}
                          className={`p-3 border rounded text-center text-xs cursor-pointer hover:opacity-80 transition-opacity ${status.color}`}
                          title={status.text}
                        >
                          {status.icon}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflict Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Conflicts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                policy: 'SOX Financial Controls',
                violation: 'Finance Manager + IT Admin roles',
                risk: 'High',
                users: 3,
                description: 'Users with both finance approval and system admin access violate SOX segregation requirements.'
              },
              {
                policy: 'HR Data Protection',
                violation: 'HR Partner + Sales Director entitlements',
                risk: 'Medium',
                users: 1,
                description: 'Access to payroll data combined with sales commissions creates GDPR compliance risk.'
              },
              {
                policy: 'Audit Independence',
                violation: 'Audit Manager + Operational roles',
                risk: 'High',
                users: 2,
                description: 'Auditors cannot have operational responsibilities in areas they audit.'
              }
            ].map((conflict, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{conflict.policy}</h4>
                      <Badge variant={conflict.risk === 'High' ? 'destructive' : 'secondary'}>
                        {conflict.risk} Risk
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{conflict.violation}</p>
                    <p className="text-xs text-gray-500">{conflict.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{conflict.users} users affected</div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setSelectedConflict(conflict);
                        setDetailsModalOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Modals */}
      <MatrixConfigurationModal
        open={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onApply={(config) => {
          setConfigModalOpen(false);
        }}
      />

      {selectedConflict && (
        <ConflictDetailsModal
          conflict={{
            row: selectedConflict.policy,
            column: selectedConflict.violation,
            status: 'conflict',
            violationCount: selectedConflict.users,
            exceptionCount: 0,
            policyIds: ['pol-001'],
            riskLevel: selectedConflict.risk === 'High' ? 'high' : 'medium',
          }}
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
        />
      )}
    </div>
  );
};
