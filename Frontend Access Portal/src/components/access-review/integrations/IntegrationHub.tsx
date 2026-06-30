import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plug, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { integrationService } from '@/services/accessReviewService';
import type { IntegrationStatus } from '@/types/accessReview';
import { toast } from 'sonner';

export const IntegrationHub: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const data = await integrationService.getIntegrationStatus();
      setIntegrations(data);
    } catch (error) {
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (system: string) => {
    setTesting(system);
    try {
      const result = await integrationService.testConnection(system);
      toast[result.success ? 'success' : 'error'](result.message);
      loadIntegrations();
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setTesting(null);
    }
  };

  const handleSync = async (system: string) => {
    try {
      await integrationService.syncSystem(system);
      toast.success(`${system} sync initiated`);
      loadIntegrations();
    } catch (error) {
      toast.error('Sync failed');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-100 text-green-700';
      case 'degraded': return 'bg-amber-100 text-amber-700';
      case 'down': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <Card><CardContent className="p-8 text-center">Loading integrations...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Plug className="h-4 w-4" />
          Integration Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {integrations.map(integration => (
          <Card key={integration.system}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(integration.status)}
                    <p className="font-medium text-sm">{integration.system}</p>
                    <Badge variant="secondary" className="text-xs">{integration.type}</Badge>
                  </div>
                  <Badge className={getHealthColor(integration.health)} variant="secondary">
                    {integration.health}
                  </Badge>
                  {integration.lastSync && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </p>
                  )}
                  {integration.capabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {integration.capabilities.map((cap, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTest(integration.system)}
                    disabled={testing === integration.system}
                  >
                    {testing === integration.system ? 'Testing...' : 'Test'}
                  </Button>
                  {integration.status === 'connected' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(integration.system)}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
