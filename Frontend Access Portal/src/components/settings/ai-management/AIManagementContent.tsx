
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Settings, BarChart, Code, Plug, MessageSquare } from 'lucide-react';
import AIFeatureOverview from './AIFeatureOverview';
import AIPromptTemplates from './AIPromptTemplates';
import AIBehaviorSettings from './AIBehaviorSettings';
import AIConnectionSettings from './AIConnectionSettings';
import AIUsageMonitoring from './AIUsageMonitoring';
import AIDeveloperUtils from './AIDeveloperUtils';

const AIManagementContent = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Brain className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">AI Management</h1>
          <p className="text-slate-600 mt-1">
            Configure AI features, prompts, connections, and monitor usage across the platform
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Prompts</span>
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Behavior</span>
          </TabsTrigger>
          <TabsTrigger value="connection" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Connection</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="developer" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Developer</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>AI Feature Usage Overview</CardTitle>
              <CardDescription>
                Monitor all AI-powered features across the IGA platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIFeatureOverview />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Templates & Output Settings</CardTitle>
              <CardDescription>
                Manage AI prompts and response formatting for all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIPromptTemplates />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior">
          <Card>
            <CardHeader>
              <CardTitle>AI Behavior Settings</CardTitle>
              <CardDescription>
                Configure global AI behavior and feature-specific settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIBehaviorSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle>AI Connection Settings</CardTitle>
              <CardDescription>
                Manage LLM provider connections and API configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIConnectionSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Usage Logs & Monitoring</CardTitle>
              <CardDescription>
                View AI usage analytics, response times, and user feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIUsageMonitoring />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developer">
          <Card>
            <CardHeader>
              <CardTitle>Developer & Admin Utilities</CardTitle>
              <CardDescription>
                Advanced AI management tools for administrators and developers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIDeveloperUtils />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIManagementContent;
