
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, User, Calendar, FileText, Download, RotateCcw } from 'lucide-react';

interface SchemaVersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
}

const mockVersionHistory = [
  {
    version: 'v2.3.1',
    timestamp: '2025-06-28T14:30:00Z',
    author: 'John Smith',
    changes: [
      { type: 'added', field: 'department', description: 'Added department enum field' },
      { type: 'modified', field: 'email', description: 'Made email field required' }
    ],
    changeCount: 2,
    status: 'current'
  },
  {
    version: 'v2.3.0',
    timestamp: '2025-06-25T09:15:00Z',
    author: 'Sarah Johnson',
    changes: [
      { type: 'added', field: 'probationPeriod', description: 'Added probation end date field' },
      { type: 'removed', field: 'temporaryId', description: 'Removed deprecated temporary ID field' },
      { type: 'modified', field: 'status', description: 'Updated status field enum values' }
    ],
    changeCount: 3,
    status: 'previous'
  },
  {
    version: 'v2.2.5',
    timestamp: '2025-06-20T16:45:00Z',
    author: 'Mike Chen',
    changes: [
      { type: 'modified', field: 'manager', description: 'Changed manager field to reference type' }
    ],
    changeCount: 1,
    status: 'previous'
  },
  {
    version: 'v2.2.4',
    timestamp: '2025-06-18T11:20:00Z',
    author: 'Emily Davis',
    changes: [
      { type: 'added', field: 'location', description: 'Added office location field' },
      { type: 'modified', field: 'groups', description: 'Changed groups to multivalue type' }
    ],
    changeCount: 2,
    status: 'previous'
  }
];

export const SchemaVersionHistoryDialog = ({ open, onOpenChange, entityType }: SchemaVersionHistoryDialogProps) => {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const handleViewChanges = (version: string) => {
    console.log('Viewing changes for version:', version);
    setSelectedVersion(version);
  };

  const handleRevertToVersion = (version: string) => {
    console.log('Reverting to version:', version);
    // Here you would implement the revert logic
  };

  const handleExportVersion = (version: string) => {
    console.log('Exporting schema version:', version);
    // Here you would implement export logic
  };

  const getChangeTypeBadge = (type: string) => {
    switch (type) {
      case 'added':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Added</Badge>;
      case 'modified':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Modified</Badge>;
      case 'removed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Removed</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const selectedVersionData = mockVersionHistory.find(v => v.version === selectedVersion);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Schema Version History - {entityType}</span>
          </DialogTitle>
          <DialogDescription>
            View and manage schema versions and changes over time
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Version List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockVersionHistory.map((version) => (
                  <div
                    key={version.version}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVersion === version.version 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleViewChanges(version.version)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{version.version}</span>
                        {version.status === 'current' && (
                          <Badge className="bg-green-100 text-green-800">Current</Badge>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportVersion(version.version);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        {version.status !== 'current' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRevertToVersion(version.version);
                            }}
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{version.author}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(version.timestamp)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-sm">
                      {version.changeCount} change{version.changeCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Change Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedVersionData ? `Changes in ${selectedVersionData.version}` : 'Select a version'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedVersionData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{selectedVersionData.version}</div>
                      <div className="text-sm text-gray-600">
                        by {selectedVersionData.author} on {formatDate(selectedVersionData.timestamp)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleExportVersion(selectedVersionData.version)}>
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                      {selectedVersionData.status !== 'current' && (
                        <Button variant="outline" size="sm" onClick={() => handleRevertToVersion(selectedVersionData.version)}>
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Revert
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedVersionData.changes.map((change, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="mt-0.5">
                          {getChangeTypeBadge(change.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{change.field}</div>
                          <div className="text-sm text-gray-600">{change.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a version from the left to view changes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
