
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Shield, 
  MapPin, 
  Calendar, 
  Building,
  Eye,
  UserCheck,
  History,
  UserX,
  AlertTriangle
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  location: string;
  joinDate: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  accessLevel?: string;
  accessItems: number;
  employmentType: string;
  status: string;
  department?: string;
}

interface TeamMemberDetailModalProps {
  member: TeamMember;
  children: React.ReactNode;
}

const mockAccessDetails = [
  { system: 'Salesforce', role: 'Standard User', lastAccessed: '2025-01-28' },
  { system: 'Jira', role: 'Project Admin', lastAccessed: '2025-01-29' },
  { system: 'GitHub', role: 'Contributor', lastAccessed: '2025-01-29' },
  { system: 'AWS Console', role: 'Developer', lastAccessed: '2025-01-27' }
];

const mockRiskFactors = [
  'Excessive privileged access to development systems',
  'Access not reviewed in 6+ months',
  'Multiple admin roles across applications'
];

export function TeamMemberDetailModal({ member, children }: TeamMemberDetailModalProps) {
  const handleViewAccess = () => {
    console.log(`Opening access details for ${member.name}`);
  };

  const handleReviewAccess = () => {
    console.log(`Starting access review for ${member.name}`);
  };

  const handleViewHistory = () => {
    console.log(`Opening history for ${member.name}`);
  };

  const handleDelegate = () => {
    console.log(`Opening delegation for ${member.name}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{member.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Overview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center space-x-1">
                      <Building className="h-3 w-3" />
                      <span>{member.department || 'Engineering'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{member.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Joined {member.joinDate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge className={
                    member.status === 'Active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {member.status}
                  </Badge>
                  <Badge variant="secondary">{member.employmentType}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{member.accessItems}</div>
                  <div className="text-sm text-gray-600">Access Items</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {member.accessLevel || 'Standard'}
                  </div>
                  <div className="text-sm text-gray-600">Access Level</div>
                </div>
                <div>
                  <Badge className={
                    member.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                    member.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {member.riskLevel} Risk
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Access Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockAccessDetails.map((access, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{access.system}</div>
                      <div className="text-sm text-gray-600">{access.role}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Last accessed: {access.lastAccessed}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          {member.riskLevel !== 'Low' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span>Risk Factors</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockRiskFactors.slice(0, member.riskLevel === 'High' ? 3 : 1).map((factor, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleViewAccess}>
              <Eye className="h-4 w-4 mr-2" />
              View Access Details
            </Button>
            <Button variant="outline" onClick={handleReviewAccess}>
              <UserCheck className="h-4 w-4 mr-2" />
              Review Access
            </Button>
            <Button variant="outline" onClick={handleViewHistory}>
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
            <Button variant="outline" onClick={handleDelegate}>
              <UserX className="h-4 w-4 mr-2" />
              Delegate Authority
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
