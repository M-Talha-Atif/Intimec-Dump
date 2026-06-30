
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MapPin, 
  Briefcase,
  TrendingUp,
  Clock
} from 'lucide-react';

interface EmploymentOverviewProps {
  teamData: any[];
}

export const EmploymentOverview = ({ teamData }: EmploymentOverviewProps) => {
  const stats = {
    totalMembers: teamData.length,
    fullTime: teamData.filter(m => m.employmentType === 'Full-Time').length,
    contract: teamData.filter(m => m.employmentType === 'Contract').length,
    remote: teamData.filter(m => m.location === 'Remote').length,
    highRisk: teamData.filter(m => m.riskLevel === 'High').length,
    accessDrift: teamData.filter(m => m.accessDrift).length
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.totalMembers}</p>
              <p className="text-sm text-gray-600">Total Team</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.fullTime}</p>
              <p className="text-sm text-gray-600">Full-Time</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{stats.remote}</p>
              <p className="text-sm text-gray-600">Remote</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-2xl font-bold">{stats.highRisk}</p>
              <p className="text-sm text-gray-600">High Risk</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">{stats.accessDrift}</p>
              <p className="text-sm text-gray-600">Access Drift</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
