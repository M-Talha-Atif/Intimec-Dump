
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TreePine, Network, Users, Target } from 'lucide-react';
import { SmartInsights } from './organizational-visibility/SmartInsights';
import { TeamTreeView } from './organizational-visibility/TeamTreeView';
import { EnhancedRelationshipGraph } from './organizational-visibility/EnhancedRelationshipGraph';
import { EnhancedDelegationPanel } from './organizational-visibility/EnhancedDelegationPanel';
import { AccessReviewsTab } from './organizational-visibility/AccessReviewsTab';

export function OrganizationalVisibilityPanel() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [lastViewedTab, setLastViewedTab] = useState<string>(() => {
    return localStorage.getItem('manager-team-structure-tab') || 'tree';
  });

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleTabChange = (value: string) => {
    setLastViewedTab(value);
    localStorage.setItem('manager-team-structure-tab', value);
  };

  const handleInsightAction = (action: string, count: number) => {
    console.log(`Executing action: ${action} for ${count} items`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TreePine className="h-5 w-5 text-green-600" />
          <span>Manager Control & Intelligence Hub</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SmartInsights onInsightAction={handleInsightAction} />

        <Tabs value={lastViewedTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tree">
              <TreePine className="h-4 w-4 mr-1" />
              Team Structure
            </TabsTrigger>
            <TabsTrigger value="graph">
              <Network className="h-4 w-4 mr-1" />
              Relationship Graph
            </TabsTrigger>
            <TabsTrigger value="delegation">
              <Users className="h-4 w-4 mr-1" />
              Delegation
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Target className="h-4 w-4 mr-1" />
              Access Reviews
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tree" className="space-y-4">
            <TeamTreeView 
              expandedNodes={expandedNodes}
              onToggleNode={toggleNode}
            />
          </TabsContent>
          
          <TabsContent value="graph">
            <EnhancedRelationshipGraph />
          </TabsContent>

          <TabsContent value="delegation">
            <EnhancedDelegationPanel />
          </TabsContent>

          <TabsContent value="reviews">
            <AccessReviewsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
