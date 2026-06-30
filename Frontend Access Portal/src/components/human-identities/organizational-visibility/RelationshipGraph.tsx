
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Network, User, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export function RelationshipGraph() {
  const [graphMode, setGraphMode] = useState<'org' | 'functional' | 'projects'>('org');
  const [zoomLevel, setZoomLevel] = useState(100);

  return (
    <div className="space-y-4">
      {/* Graph Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">View Mode:</span>
          <div className="flex space-x-1">
            {[
              { key: 'org', label: 'Org Units' },
              { key: 'functional', label: 'Functions' },
              { key: 'projects', label: 'Projects' }
            ].map(mode => (
              <Button
                key={mode.key}
                variant={graphMode === mode.key ? "default" : "outline"}
                size="sm"
                onClick={() => setGraphMode(mode.key as any)}
              >
                {mode.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-12 text-center">{zoomLevel}%</span>
          <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setZoomLevel(100)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Interactive Graph Canvas */}
      <div className="h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center relative overflow-hidden">
        <div className="text-center" style={{ zoom: `${zoomLevel}%` }}>
          <Network className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Interactive Relationship Graph</h3>
          <p className="text-gray-500 mb-4">
            Showing {graphMode === 'org' ? 'organizational hierarchy' : 
                     graphMode === 'functional' ? 'functional relationships' : 
                     'project-based connections'}
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-xs font-medium">David Kim</div>
              <div className="text-xs text-gray-500">Director</div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-xs font-medium">Sarah Johnson</div>
              <div className="text-xs text-gray-500">Sr. Engineer</div>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-purple-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <User className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-xs font-medium">Lisa Wang</div>
              <div className="text-xs text-gray-500">DevOps</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
