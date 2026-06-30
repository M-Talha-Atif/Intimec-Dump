
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mail,
  Users,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const reviewsData = [
  {
    id: 'rev_1',
    title: 'Q1 Access Certification - Engineering',
    assignedBy: 'David Kim',
    reviewee: 'Sarah Johnson',
    dueDate: '2025-02-15',
    status: 'In Progress',
    progress: 65,
    itemsTotal: 24,
    itemsCompleted: 16,
    riskLevel: 'Medium',
    type: 'Periodic'
  },
  {
    id: 'rev_2',
    title: 'Privileged Access Review - DevOps',
    assignedBy: 'David Kim',
    reviewee: 'Lisa Wang',
    dueDate: '2025-01-30',
    status: 'Overdue',
    progress: 20,
    itemsTotal: 42,
    itemsCompleted: 8,
    riskLevel: 'High',
    type: 'Risk-Based'
  },
  {
    id: 'rev_3',
    title: 'Manager Attestation - Team Access',
    assignedBy: 'David Kim',
    reviewee: 'Mike Chen',
    dueDate: '2025-02-28',
    status: 'Not Started',
    progress: 0,
    itemsTotal: 18,
    itemsCompleted: 0,
    riskLevel: 'Low',
    type: 'Manager Review'
  }
];

export const AccessReviewsTab = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  const filteredReviews = reviewsData.filter(review => {
    const statusMatch = filterStatus === 'all' || review.status.toLowerCase().includes(filterStatus);
    const riskMatch = filterRisk === 'all' || review.riskLevel === filterRisk;
    return statusMatch && riskMatch;
  });

  const handleReassignReview = (reviewId: string) => {
    console.log(`Reassigning review: ${reviewId}`);
  };

  const handleBulkCertify = () => {
    console.log('Opening bulk certification dialog');
  };

  const handleGenerateReminder = (reviewId: string) => {
    console.log(`Generating reminder email for review: ${reviewId}`);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Access Reviews Management</span>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleBulkCertify}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Bulk Certify
              </Button>
              <Button size="sm" variant="outline">
                <Mail className="h-4 w-4 mr-1" />
                Send Reminders
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="progress">In Progress</SelectItem>
                <SelectItem value="not started">Not Started</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="High">High Risk</SelectItem>
                <SelectItem value="Medium">Medium Risk</SelectItem>
                <SelectItem value="Low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Timeline */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{review.title}</h4>
                  <p className="text-sm text-gray-600">
                    Assigned to: {review.reviewee} • Type: {review.type}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    className={`${
                      review.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                      review.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {review.status}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={`${
                      review.riskLevel === 'High' ? 'text-red-600 border-red-300' :
                      review.riskLevel === 'Medium' ? 'text-yellow-600 border-yellow-300' :
                      'text-green-600 border-green-300'
                    }`}
                  >
                    {review.riskLevel} Risk
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{review.progress}%</div>
                  <div className="text-xs text-gray-600">Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{review.itemsCompleted}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{review.itemsTotal}</div>
                  <div className="text-xs text-gray-600">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{review.dueDate}</span>
                  </div>
                  <div className="text-xs text-gray-600">Due Date</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Review Progress</span>
                  <span>{review.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      review.progress > 75 ? 'bg-green-500' :
                      review.progress > 50 ? 'bg-blue-500' :
                      review.progress > 25 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${review.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleReassignReview(review.id)}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Reassign Review
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleGenerateReminder(review.id)}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Send Reminder
                </Button>
                <Button size="sm">
                  <Target className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Review Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Review Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {reviewsData.filter(r => r.status === 'In Progress').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {reviewsData.filter(r => r.status === 'Overdue').length}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {reviewsData.filter(r => r.status === 'Not Started').length}
              </div>
              <div className="text-sm text-gray-600">Not Started</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.round(reviewsData.reduce((acc, r) => acc + r.progress, 0) / reviewsData.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
