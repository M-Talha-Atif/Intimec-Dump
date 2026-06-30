export const getRiskBadgeClass = (risk: string) => {
  const classes = {
    low: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    medium: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
    high: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
  };
  
  const riskLower = risk?.toLowerCase() || '';
  return classes[riskLower as keyof typeof classes] || 
    "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
};


export const getRiskIconColor = (risk: string) => {
  const colors = {
    low: "text-green-600 dark:text-green-400",
    medium: "text-yellow-600 dark:text-yellow-400",
    high: "text-red-500 dark:text-red-400", // lighter red
  };
  
  const riskLower = risk?.toLowerCase() || '';
  return colors[riskLower as keyof typeof colors] || "text-primary";
};