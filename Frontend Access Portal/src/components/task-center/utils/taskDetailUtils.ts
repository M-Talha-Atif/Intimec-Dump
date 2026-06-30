


// These helpers were inside the component but seemed specific to rendering details.
// Often it's cleaner to keep them as pure functions or components.

export const getSLAStatusClass = (countdown: number) => {
  if (countdown < 0) return 'text-red-600';
  if (countdown < 60) return 'text-orange-600';
  return 'text-green-600';
};

export const getSLAStatusText = (countdown: number) => {
  if (countdown < 0) return 'Overdue';
  return `${Math.floor(countdown / 60)}h ${countdown % 60}m remaining`;
};
