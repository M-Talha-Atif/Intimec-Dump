
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Building, 
  Calendar, 
  DollarSign, 
  MapPin, 
  UserCheck,
  Clock,
  Shield,
  Sparkles,
  Key,
  AlertTriangle
} from 'lucide-react';

type NonEmployeeOverviewTabProps = {
  nonEmployee: any;
};

export function NonEmployeeOverviewTab({ nonEmployee }: NonEmployeeOverviewTabProps) {
  const accountsCount = nonEmployee.accounts?.length || 0;
  const accessCount = nonEmployee.accessCount || nonEmployee.access?.length || 0;
  const riskScore = nonEmployee.riskScore || (nonEmployee.riskLevel === 'High' ? 82 : nonEmployee.riskLevel === 'Medium' ? 58 : 25);

  return (
    <div className="space-y-6 pt-4">
      {/* AI-Generated Summary */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>AI-Generated Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed">
            {nonEmployee.name} is a {nonEmployee.type} in {nonEmployee.department} sponsored by {nonEmployee.sponsor}. 
            Contract runs until {nonEmployee.endDate} with {nonEmployee.daysToExpiry} days remaining. 
            Currently has {accessCount} access items with {nonEmployee.riskLevel?.toLowerCase()} risk level.
            {nonEmployee.riskLevel === 'High' && ' Immediate attention recommended due to elevated risk posture.'}
            {nonEmployee.status === 'Expiring Soon' && ' Contract expiration approaching — plan for offboarding or renewal.'}
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <User className="h-5 w-5 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-foreground">{accountsCount}</div>
            <div className="text-sm text-muted-foreground">Accounts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Key className="h-5 w-5 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-foreground">{accessCount}</div>
            <div className="text-sm text-muted-foreground">Access Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-foreground">{riskScore}</div>
            <div className="text-sm text-muted-foreground">Risk Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-foreground">{nonEmployee.daysToExpiry}</div>
            <div className="text-sm text-muted-foreground">Days to Expiry</div>
          </CardContent>
        </Card>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-600">Full Name</p>
                <p className="text-slate-900">{nonEmployee.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-600">Email</p>
                <p className="text-slate-900">{nonEmployee.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-600">Department</p>
                <p className="text-slate-900">{nonEmployee.department}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-600">Business Unit</p>
                <p className="text-slate-900">{nonEmployee.businessUnit}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <UserCheck className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-600">Sponsor</p>
                <p className="text-slate-900">{nonEmployee.sponsor}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-600">Location</p>
                <p className="text-slate-900">{nonEmployee.location}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Contract Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Contract Start</p>
              <p className="text-slate-900">{nonEmployee.startDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Contract End</p>
              <p className="text-slate-900">{nonEmployee.endDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Time Remaining</p>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-slate-900">{nonEmployee.daysToExpiry} days</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Contract Value</p>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-slate-900">{nonEmployee.contractValue}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status & Risk */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Status & Risk Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Current Status</p>
              <Badge className={
                nonEmployee.status === 'Active' ? 'bg-green-100 text-green-800' :
                nonEmployee.status === 'Expiring Soon' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }>
                {nonEmployee.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Risk Level</p>
              <Badge className={
                nonEmployee.riskLevel === 'Low' ? 'bg-blue-100 text-blue-800' :
                nonEmployee.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }>
                {nonEmployee.riskLevel} Risk
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Access Items</p>
              <Badge variant="outline">
                {accessCount} items
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
