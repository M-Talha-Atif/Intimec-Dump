import React from "react";
import { EdgeProps } from "@xyflow/react";

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  label,
}) => {
  const edgePath = `M${sourceX},${sourceY} L${targetX},${targetY}`;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        fill="none"
      />
      {label && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2}
          className="react-flow__edge-text"
          fontSize="10"
          fill="#666"
          textAnchor="middle"
        >
          {String(label)}
        </text>
      )}
    </>
  );
};

export default CustomEdge;
