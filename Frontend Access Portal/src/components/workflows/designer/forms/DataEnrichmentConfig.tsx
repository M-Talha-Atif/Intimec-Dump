"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface DataEnrichmentConfigProps {
  config: any;
  onChange: (config: any) => void;
}

export const DataEnrichmentConfig: React.FC<DataEnrichmentConfigProps> = ({ config, onChange }) => {
  const enrichmentConfig = config.enrichmentConfig || {
    sources: [],
    mapping: {},
    caching: { enabled: false, ttl: 3600 },
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Enrichment Source</Label>
        <Select 
          value={enrichmentConfig.sources[0] || ''} 
          onValueChange={(value) => onChange({ 
            ...config, 
            enrichmentConfig: { ...enrichmentConfig, sources: [value] } 
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select data source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hr-system">HR System</SelectItem>
            <SelectItem value="active-directory">Active Directory</SelectItem>
            <SelectItem value="external-api">External API</SelectItem>
            <SelectItem value="database">Database Query</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Field Mapping (JSON)</Label>
        <Textarea
          value={JSON.stringify(enrichmentConfig.mapping, null, 2)}
          onChange={(e) => {
            try {
              const mapping = JSON.parse(e.target.value);
              onChange({ ...config, enrichmentConfig: { ...enrichmentConfig, mapping } });
            } catch {}
          }}
          placeholder='{"department": "user.dept", "manager": "user.manager"}'
          className="font-mono text-sm"
          rows={6}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Enable Caching</Label>
          <p className="text-xs text-muted-foreground">Cache enriched data to improve performance</p>
        </div>
        <Switch
          checked={enrichmentConfig.caching?.enabled || false}
          onCheckedChange={(checked) => onChange({
            ...config,
            enrichmentConfig: {
              ...enrichmentConfig,
              caching: { ...enrichmentConfig.caching, enabled: checked }
            }
          })}
        />
      </div>

      {enrichmentConfig.caching?.enabled && (
        <div>
          <Label>Cache TTL (seconds)</Label>
          <Input
            type="number"
            value={enrichmentConfig.caching.ttl || 3600}
            onChange={(e) => onChange({
              ...config,
              enrichmentConfig: {
                ...enrichmentConfig,
                caching: { ...enrichmentConfig.caching, ttl: parseInt(e.target.value) }
              }
            })}
          />
        </div>
      )}
    </div>
  );
};
