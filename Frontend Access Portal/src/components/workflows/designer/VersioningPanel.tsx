"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitBranch, Clock, CheckCircle, ArrowRight, Package } from 'lucide-react';

interface WorkflowVersion {
  id: string;
  version: string;
  createdAt: Date;
  createdBy: string;
  label: string;
  status: 'draft' | 'published' | 'archived';
  nodes: any[];
  edges: any[];
  metadata?: { changelog?: string };
}

interface VersioningPanelProps {
  workflow: any;
  onUpdateWorkflow: (updates: any) => void;
  onPublishVersion: (version: WorkflowVersion) => void;
  onPromoteVersion: (environment: string) => void;
}

export const VersioningPanel: React.FC<VersioningPanelProps> = ({
  workflow,
  onUpdateWorkflow,
  onPublishVersion,
  onPromoteVersion
}) => {
  const [versionLabel, setVersionLabel] = useState('');
  const [changelog, setChangelog] = useState('');
  const [compareBase, setCompareBase] = useState('');
  const [compareTarget, setCompareTarget] = useState('');

  const versions: WorkflowVersion[] = workflow.versions || [];
  const environments = workflow.promotion?.environments || ['Development', 'Staging', 'Production'];

  const createVersion = () => {
    if (!versionLabel.trim()) {
      alert('Version label is required');
      return;
    }

    const newVersion: WorkflowVersion = {
      id: `v-${Date.now()}`,
      version: versionLabel,
      createdAt: new Date(),
      createdBy: 'current-user',
      label: versionLabel,
      status: 'draft',
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
      metadata: { changelog }
    };

    onPublishVersion(newVersion);
    setVersionLabel('');
    setChangelog('');
  };

  const publishVersion = (versionId: string) => {
    onUpdateWorkflow({
      versions: versions.map(v =>
        v.id === versionId ? { ...v, status: 'published' as const } : v
      )
    });
  };

  const archiveVersion = (versionId: string) => {
    onUpdateWorkflow({
      versions: versions.map(v =>
        v.id === versionId ? { ...v, status: 'archived' as const } : v
      )
    });
  };

  return (
    <Tabs defaultValue="versions" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="versions">Versions</TabsTrigger>
        <TabsTrigger value="compare">Compare</TabsTrigger>
        <TabsTrigger value="promote">Promote</TabsTrigger>
      </TabsList>

      {/* Versions Tab */}
      <TabsContent value="versions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Version Label</Label>
                <Input
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  placeholder="v1.2.0 or Release-2024-Q1"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Changelog</Label>
                <Textarea
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="Describe the changes in this version..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <Button onClick={createVersion} className="w-full">
                <Package className="h-4 w-4 mr-2" />
                Create Version
              </Button>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Label className="text-sm font-medium">Version Timeline</Label>
              {versions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No versions created yet
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {versions
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((version) => (
                      <Card key={version.id} className={`border-l-4 ${
                        version.status === 'published' ? 'border-l-green-500' :
                        version.status === 'archived' ? 'border-l-gray-400' :
                        'border-l-blue-500'
                      }`}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium">{version.version}</p>
                                <Badge variant={
                                  version.status === 'published' ? 'default' :
                                  version.status === 'archived' ? 'secondary' :
                                  'outline'
                                } className="text-xs">
                                  {version.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(version.createdAt).toLocaleString()}</span>
                                <span>by {version.createdBy}</span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {version.status === 'draft' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => publishVersion(version.id)}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              {version.status === 'published' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => archiveVersion(version.id)}
                                >
                                  Archive
                                </Button>
                              )}
                            </div>
                          </div>
                          {version.metadata?.changelog && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {version.metadata.changelog}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Compare Tab */}
      <TabsContent value="compare" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Version Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Base Version</Label>
                <Input
                  value={compareBase}
                  onChange={(e) => setCompareBase(e.target.value)}
                  placeholder="v1.0.0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Target Version</Label>
                <Input
                  value={compareTarget}
                  onChange={(e) => setCompareTarget(e.target.value)}
                  placeholder="v1.1.0"
                  className="mt-1"
                />
              </div>
            </div>
            <Button className="w-full">Compare Versions</Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Promote Tab */}
      <TabsContent value="promote" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Environment Promotion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {environments.map((env: string, idx: number) => (
              <Card key={env} className={idx === 0 ? 'bg-green-50' : ''}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{env}</p>
                      <p className="text-xs text-muted-foreground">
                        {idx === 0 ? 'Current' : 'Not deployed'}
                      </p>
                    </div>
                    {idx > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPromoteVersion(env)}
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Promote
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
