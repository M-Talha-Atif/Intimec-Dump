export function shortDate(date: number | string): string {
  let dateObj: Date;
  
  if (typeof date === 'number') {
    dateObj = new Date(date);
  } else if (typeof date === 'string') {
    if (/^\d+$/.test(date)) {
      // If it's a numeric string, treat as epoch
      dateObj = new Date(parseInt(date));
    } else {
      // Otherwise treat as ISO string
      dateObj = new Date(date);
    }
  } else {
    dateObj = new Date();
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  const hour = String(dateObj.getHours()).padStart(2, "0");
  const minute = String(dateObj.getMinutes()).padStart(2, "0");
  const second = String(dateObj.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export const formatTimestamp = (timestamp: number | string | null) => {
  if (!timestamp) return "N/A";
  
  let date: Date;
  
  if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'string') {
    if (/^\d+$/.test(timestamp)) {
      // If it's a numeric string, treat as epoch
      date = new Date(parseInt(timestamp));
    } else {
      // Otherwise treat as ISO string
      date = new Date(timestamp);
    }
  } else {
    return "Invalid Date";
  }
  
  // Validate the date
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
