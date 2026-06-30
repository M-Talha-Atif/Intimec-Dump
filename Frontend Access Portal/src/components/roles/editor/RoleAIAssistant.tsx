
import React, { useState } from 'react';
import { Role } from '@/types/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, Lightbulb, AlertTriangle, CheckCircle, 
  TrendingUp, Users, Shield, Zap, X
} from 'lucide-react';

interface RoleAIAssistantProps {
  role: Role;
  allRoles: Role[];
}

const RoleAIAssistant: React.FC<RoleAIAssistantProps> = ({ role, allRoles }) => {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  const suggestions = [
    {
      id: 'sod-violation',
      type: 'warning',
      title: 'Potential SoD Violation Detected',
      description: 'This role has entitlements that may conflict with segregation of duties policies. Consider splitting approval and execution permissions.',
      action: 'Review Entitlements',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      id: 'peer-comparison',
      type: 'info',
      title: 'Peer Role Analysis',
      description: `Similar roles in ${role.businessUnit} have 2.3x fewer high-risk entitlements on average. Consider reviewing privilege levels.`,
      action: 'Compare with Peers',
      icon: Users,
      color: 'blue'
    },
    {
      id: 'unused-entitlements',
      type: 'optimization',
      title: 'Unused Entitlements Found',
      description: '3 entitlements have not been used in the last 90 days. Removing them could reduce security risk.',
      action: 'Review Usage',
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'naming-convention',
      type: 'suggestion',
      title: 'Naming Convention Improvement',
      description: `Consider renaming to "${role.businessUnit}_${role.type.replace(' ', '_')}_${role.name.replace(/\s+/g, '_')}" to follow enterprise standards.`,
      action: 'Apply Naming Standard',
      icon: Lightbulb,
      color: 'purple'
    }
  ];

  const activeSuggestions = suggestions.filter(s => !dismissedSuggestions.has(s.id));

  const handleDismiss = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set(prev).add(suggestionId));
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'warning': return 'destructive';
      case 'optimization': return 'default';
      default: return 'default';
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-600' };
      case 'blue': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600' };
      case 'green': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-600' };
      case 'purple': return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'text-purple-600' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', icon: 'text-gray-600' };
    }
  };

  const roleHealthScore = 85; // This would be calculated based on various factors

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span>AI Role Assistant</span>
          <Badge variant="secondary" className="ml-auto">
            Health Score: {roleHealthScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border">
            <Shield className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <div className="text-sm font-medium">Security</div>
            <div className="text-xs text-green-600">Good</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border">
            <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <div className="text-sm font-medium">Usage</div>
            <div className="text-xs text-blue-600">Active</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-orange-600" />
            <div className="text-sm font-medium">Compliance</div>
            <div className="text-xs text-orange-600">Needs Review</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border">
            <Zap className="h-5 w-5 mx-auto mb-1 text-purple-600" />
            <div className="text-sm font-medium">Optimization</div>
            <div className="text-xs text-purple-600">Available</div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="space-y-3">
          <h4 className="font-medium text-blue-900">Intelligent Recommendations</h4>
          
          {activeSuggestions.length === 0 ? (
            <div className="text-center py-6 text-blue-600">
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">All suggestions have been addressed!</p>
            </div>
          ) : (
            activeSuggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              const colors = getColorClasses(suggestion.color);
              
              return (
                <div 
                  key={suggestion.id}
                  className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Icon className={`h-5 w-5 mt-0.5 ${colors.icon}`} />
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${colors.text}`}>
                          {suggestion.title}
                        </p>
                        <p className={`text-sm mt-1 ${colors.text} opacity-90`}>
                          {suggestion.description}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                        >
                          {suggestion.action}
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => handleDismiss(suggestion.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-blue-900 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              <Zap className="h-4 w-4 mr-2" />
              Auto-optimize Role
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              Compare with Peers
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Security Scan
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Usage Analytics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleAIAssistant;
