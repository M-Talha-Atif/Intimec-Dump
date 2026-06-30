"use client";

import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isConditional = data?.type === 'conditional';
  const isError = data?.type === 'error';
  const label = data?.label;

  const getEdgeColor = () => {
    if (isError) return '#ef4444'; // red
    if (isConditional) return '#f59e0b'; // amber
    if (selected) return '#3b82f6'; // blue
    return '#6b7280'; // gray-500 as fallback
  };

  const getEdgeStyle = () => {
    const baseStyle = {
      ...style,
      stroke: getEdgeColor(),
      strokeWidth: selected ? 3 : 2,
      transition: 'all 0.3s ease',
    };

    if (isConditional) {
      return {
        ...baseStyle,
        strokeDasharray: '5,5',
      };
    }

    return baseStyle;
  };

  return (
    <>
      <path
        id={id}
        style={getEdgeStyle()}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <Badge 
              variant={isError ? 'destructive' : isConditional ? 'default' : 'secondary'}
              className="text-xs shadow-lg backdrop-blur-sm bg-background/90"
            >
              {String(label)}
            </Badge>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
