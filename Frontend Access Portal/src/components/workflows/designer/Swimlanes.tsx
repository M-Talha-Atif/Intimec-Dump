"use client";

import React from 'react';

interface Lane {
  id: string;
  label: string;
  kind: string;
  order: number;
  color?: string;
}

interface SwimlanesProps {
  lanes: Lane[];
  width: number;
  height: number;
}

export const Swimlanes: React.FC<SwimlanesProps> = ({ lanes, width, height }) => {
  if (!lanes || lanes.length === 0) return null;

  const laneHeight = height / lanes.length;
  const sortedLanes = [...lanes].sort((a, b) => a.order - b.order);

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {sortedLanes.map((lane, index) => (
        <div
          key={lane.id}
          className="absolute border-gray-200"
          style={{
            top: `${index * laneHeight}px`,
            left: 0,
            right: 0,
            height: `${laneHeight}px`,
            backgroundColor: lane.color || `hsl(${(index * 60) % 360}, 20%, 98%)`,
          }}
        >
          <div className="absolute left-2 top-2 px-2 py-1 bg-white/80 backdrop-blur-sm rounded text-xs font-medium border shadow-sm">
            {lane.label}
            <span className="ml-1 text-[10px] text-muted-foreground">({lane.kind})</span>
          </div>
        </div>
      ))}
    </div>
  );
};
