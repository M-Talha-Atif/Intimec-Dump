
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Play, Download, Bookmark, AlertCircle } from 'lucide-react';

export const DebugActions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Debug Actions & Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quick Actions</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Failed Tasks
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Play className="h-4 w-4 mr-2" />
                Simulate Request
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Debug Data
              </Button>
            </div>
          </div>

          {/* Bookmarked Issues */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Pinned Issues</h4>
            <div className="space-y-2">
              <div className="p-2 border rounded text-xs">
                <div className="flex items-center justify-between">
                  <Badge variant="destructive" className="text-xs">ERROR</Badge>
                  <Bookmark className="h-3 w-3 text-yellow-500" />
                </div>
                <p className="mt-1 text-muted-foreground">
                  SAP provisioning timeout
                </p>
              </div>
              <div className="p-2 border rounded text-xs">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">WARN</Badge>
                  <Bookmark className="h-3 w-3 text-yellow-500" />
                </div>
                <p className="mt-1 text-muted-foreground">
                  Group mapping missing
                </p>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">AI Insights</h4>
            <div className="space-y-2">
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3 text-blue-500" />
                  <span className="font-medium text-blue-800">Pattern Detected</span>
                </div>
                <p className="mt-1 text-blue-700">
                  Similar errors occurring for users in Marketing OU
                </p>
              </div>
              <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3 text-green-500" />
                  <span className="font-medium text-green-800">Recommendation</span>
                </div>
                <p className="mt-1 text-green-700">
                  Consider increasing connector timeout to 30s
                </p>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">System Health</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Connectors</span>
                <Badge variant="default" className="bg-green-500">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Workflows</span>
                <Badge variant="secondary">2 Paused</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>AI Engine</span>
                <Badge variant="default" className="bg-green-500">Online</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Queue Depth</span>
                <Badge variant="outline">47 items</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
