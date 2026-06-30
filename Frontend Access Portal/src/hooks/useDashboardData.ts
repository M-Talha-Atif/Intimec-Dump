import { useState, useEffect } from 'react';
import { generateDashboardData, DashboardData } from '@/services/mockDashboardData';

export const useDashboardData = (dateRange: string = '30days', refreshTrigger?: Date) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const dashboardData = generateDashboardData(dateRange);
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, refreshTrigger]);

  return { data, loading, error };
};
