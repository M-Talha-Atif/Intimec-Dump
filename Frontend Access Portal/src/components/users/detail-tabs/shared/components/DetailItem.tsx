import React from "react";
import { DetailItemProps } from "../types";

export const DetailItem: React.FC<DetailItemProps> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-start text-sm">
    <dt className="flex items-center text-slate-500">
      <Icon className="w-4 h-4 mr-2 shrink-0" />
      <span className="font-medium">{label}</span>
    </dt>
    <dd className="ml-auto text-slate-700 font-medium">{value || "N/A"}</dd>
  </div>
);

export default DetailItem;
