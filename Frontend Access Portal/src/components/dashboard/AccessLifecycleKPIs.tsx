
import LifecycleTrendChart from "./LifecycleTrendChart";
import StaleIdentityGrowthChart from "./StaleIdentityGrowthChart";
import AverageAccessRemovalTime from "./AverageAccessRemovalTime";
import WeeklyTrendsChart from "./WeeklyTrendsChart";

const AccessLifecycleKPIs = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <LifecycleTrendChart />
      <StaleIdentityGrowthChart />
      <AverageAccessRemovalTime />
      <WeeklyTrendsChart />
    </div>
  );
};

export default AccessLifecycleKPIs;
