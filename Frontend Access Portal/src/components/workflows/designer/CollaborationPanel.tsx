"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, Lock, Activity, CheckCircle, Clock } from 'lucide-react';

interface WorkflowPresence {
  userId: string;
  userName: string;
  nodeId?: string;
  lastSeen: Date;
}

interface NodeComment {
  id: string;
  nodeId: string;
  author: string;
  text: string;
  createdAt: Date;
  resolved: boolean;
}

interface CollaborationPanelProps {
  workflow: any;
  currentUser: { id: string; name: string; email: string };
  onUpdateWorkflow: (updates: any) => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  workflow,
  currentUser,
  onUpdateWorkflow
}) => {
  const [newComment, setNewComment] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const presence: WorkflowPresence[] = workflow.presence || [];
  const comments: NodeComment[] = workflow.comments || [];
  const locks = workflow.locks?.locks || {};

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: NodeComment = {
      id: `comment-${Date.now()}`,
      nodeId: selectedNode || 'workflow',
      author: currentUser.name,
      text: newComment,
      createdAt: new Date(),
      resolved: false
    };

    onUpdateWorkflow({
      comments: [...comments, comment]
    });

    setNewComment('');
  };

  const resolveComment = (commentId: string) => {
    onUpdateWorkflow({
      comments: comments.map(c =>
        c.id === commentId ? { ...c, resolved: true } : c
      )
    });
  };

  const toggleLocks = (enabled: boolean) => {
    onUpdateWorkflow({
      locks: {
        enabled,
        lockTimeout: workflow.locks?.lockTimeout || 300000,
        locks: workflow.locks?.locks || {}
      }
    });
  };

  const toggleChangeTracking = (enabled: boolean) => {
    onUpdateWorkflow({
      changeTracking: {
        enabled,
        changes: workflow.changeTracking?.changes || []
      }
    });
  };

  const userColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];

  return (
    <Tabs defaultValue="presence" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="presence">Presence</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="locks">Locks</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>

      {/* Presence Tab */}
      <TabsContent value="presence" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Users ({presence.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {presence.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No other users currently active
              </div>
            ) : (
              presence.map((user, idx) => (
                <Card key={user.userId} className="border-l-4" style={{ borderLeftColor: userColors[idx % userColors.length].replace('bg-', '#') }}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-8 w-8 ${userColors[idx % userColors.length]}`}>
                        <AvatarFallback className="text-white text-xs">
                          {user.userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.userName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {user.nodeId && (
                            <Badge variant="outline" className="text-xs">
                              Editing: {user.nodeId}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(user.lastSeen).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Real-time Collaboration</p>
                <p className="text-xs text-blue-700 mt-1">
                  See who's working on the workflow and what they're editing in real-time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Comments Tab */}
      <TabsContent value="comments" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Workflow Comments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {comments.filter(c => !c.resolved).length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No active comments
                </div>
              ) : (
                comments.filter(c => !c.resolved).map((comment) => (
                  <Card key={comment.id} className="border-l-4 border-l-amber-400">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {comment.author.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{comment.author}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {comment.nodeId !== 'workflow' && (
                          <Badge variant="outline" className="text-xs">
                            {comment.nodeId}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mb-3">{comment.text}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveComment(comment.id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="pt-4 space-y-3">
              <Label className="text-sm font-medium">Add Comment</Label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
              />
              <Button onClick={addComment} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Post Comment
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Locks Tab */}
      <TabsContent value="locks" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Node Locking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Enable Node Locks</Label>
                <p className="text-xs text-muted-foreground">
                  Prevent simultaneous editing of the same node
                </p>
              </div>
              <Switch
                checked={workflow.locks?.enabled || false}
                onCheckedChange={toggleLocks}
              />
            </div>

            {Object.keys(locks).length > 0 && (
              <div className="pt-4 space-y-2">
                <Label className="text-sm font-medium">Active Locks</Label>
                {Object.entries(locks).map(([nodeId, lock]: [string, any]) => (
                  <Card key={nodeId} className="border-l-4 border-l-red-400">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{nodeId}</p>
                          <p className="text-xs text-muted-foreground">
                            Locked by {lock.userId}
                          </p>
                        </div>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Activity Tab */}
      <TabsContent value="activity" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Change Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Track Changes</Label>
                <p className="text-xs text-muted-foreground">
                  Log all modifications to the workflow
                </p>
              </div>
              <Switch
                checked={workflow.changeTracking?.enabled || false}
                onCheckedChange={toggleChangeTracking}
              />
            </div>

            <div className="pt-4 ">
              <div className="text-center py-6 text-muted-foreground text-sm">
                No recent activity
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
