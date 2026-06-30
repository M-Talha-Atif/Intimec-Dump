
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Target,
  BarChart3,
  Eye
} from 'lucide-react';

const reviewSummary = {
  completed: 45,
  ongoing: 12,
  missed: 3,
  totalTeamMembers: 60
};

const teamReviews = [
  {
    id: 'rev_1',
    teamMember: 'Sarah Johnson',
    reviewType: 'Quarterly Access Review',
    status: 'Completed',
    completedDate: '2025-01-10',
    decisionsCount: 8,
    approvalsCount: 6,
    revocationsCount: 2
  },
  {
    id: 'rev_2',
    teamMember: 'Mike Chen',
    reviewType: 'Quarterly Access Review',
    status: 'Ongoing',
    dueDate: '2025-01-20',
    decisionsCount: 5,
    approvalsCount: 3,
    revocationsCount: 2
  },
  {
    id: 'rev_3',
    teamMember: 'Lisa Wang',
    reviewType: 'High-Risk Review',
    status: 'Missed',
    dueDate: '2025-01-05',
    decisionsCount: 0,
    approvalsCount: 0,
    revocationsCount: 0
  }
];

export function AccessReviewContextPanel() {
  const completionRate = (reviewSummary.completed / reviewSummary.totalTeamMembers) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-indigo-600" />
          <span>Access Review Context</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Review Summary */}
        <div>
          <h4 className="font-semibold mb-3">Team Review Overview</h4>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{reviewSummary.completed}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reviewSummary.ongoing}</div>
              <div className="text-xs text-gray-600">Ongoing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{reviewSummary.missed}</div>
              <div className="text-xs text-gray-600">Missed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(completionRate)}%</div>
              <div className="text-xs text-gray-600">Completion Rate</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{reviewSummary.completed}/{reviewSummary.totalTeamMembers}</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </div>

        {/* Individual Reviews */}
        <div>
          <h4 className="font-semibold mb-3">Recent Team Reviews</h4>
          <div className="space-y-3">
            {teamReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">{review.teamMember}</div>
                    <div className="text-sm text-gray-600">{review.reviewType}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={
                      review.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      review.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {review.status === 'Completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {review.status === 'Ongoing' && <Clock className="h-3 w-3 mr-1" />}
                      {review.status === 'Missed' && <XCircle className="h-3 w-3 mr-1" />}
                      {review.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <div>{review.status === 'Completed' ? review.completedDate : review.dueDate}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Decisions:</span>
                    <div>{review.decisionsCount} total</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Actions:</span>
                    <div className="flex space-x-2">
                      <span className="text-green-600">{review.approvalsCount} ✓</span>
                      <span className="text-red-600">{review.revocationsCount} ✗</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
