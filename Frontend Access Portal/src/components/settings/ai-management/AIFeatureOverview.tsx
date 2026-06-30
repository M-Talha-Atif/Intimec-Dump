
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, Eye, MessageSquare, BarChart, Table, FileText, Zap } from 'lucide-react';
import { AIFeatureConfig } from './types/ai-management-types';
import { AI_FEATURES_REGISTRY } from './data/ai-features-registry';

const AIFeatureOverview = () => {
  const [features, setFeatures] = useState<AIFeatureConfig[]>(AI_FEATURES_REGISTRY);

  const getOutputFormatIcon = (format: string) => {
    switch (format) {
      case 'kpi': return <BarChart className="h-4 w-4" />;
      case 'table': return <Table className="h-4 w-4" />;
      case 'markdown': return <FileText className="h-4 w-4" />;
      case 'chart': return <BarChart className="h-4 w-4" />;
      case 'structured': return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getEntryPointBadge = (entryPoint: string) => {
    const variants = {
      button: 'default',
      tab: 'secondary',
      modal: 'outline',
      auto: 'destructive'
    } as const;
    
    return <Badge variant={variants[entryPoint as keyof typeof variants] || 'default'}>{entryPoint}</Badge>;
  };

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));
  };

  const categories = [...new Set(features.map(f => f.category))];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total AI Features</p>
              <p className="text-2xl font-bold text-blue-800">{features.length}</p>
            </div>
            <Zap className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active Features</p>
              <p className="text-2xl font-bold text-green-800">{features.filter(f => f.enabled).length}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Usage</p>
              <p className="text-2xl font-bold text-purple-800">
                {features.reduce((sum, f) => sum + (f.usageCount || 0), 0).toLocaleString()}
              </p>
            </div>
            <BarChart className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Categories</p>
              <p className="text-2xl font-bold text-orange-800">{categories.length}</p>
            </div>
            <Table className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 font-medium text-slate-600">Feature</th>
                <th className="text-left p-4 font-medium text-slate-600">Input Type</th>
                <th className="text-left p-4 font-medium text-slate-600">Output</th>
                <th className="text-left p-4 font-medium text-slate-600">Entry Point</th>
                <th className="text-left p-4 font-medium text-slate-600">Usage</th>
                <th className="text-left p-4 font-medium text-slate-600">Status</th>
                <th className="text-left p-4 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={feature.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-slate-800">{feature.name}</div>
                      <div className="text-sm text-slate-500">{feature.description}</div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {feature.category}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{feature.inputType}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getOutputFormatIcon(feature.outputFormat)}
                      <span className="text-sm capitalize">{feature.outputFormat}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {getEntryPointBadge(feature.entryPoint)}
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-medium">{feature.usageCount?.toLocaleString() || 0} calls</div>
                      <div className="text-slate-500">{feature.lastUsed || 'Never'}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Switch 
                      checked={feature.enabled}
                      onCheckedChange={() => toggleFeature(feature.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AIFeatureOverview;
