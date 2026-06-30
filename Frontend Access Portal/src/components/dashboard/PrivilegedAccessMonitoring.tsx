
import PrivilegedTrendsChart from "./PrivilegedTrendsChart";
import PrivilegedIdentitiesBreakdown from "./PrivilegedIdentitiesBreakdown";
import PrivilegedByAppChart from "./PrivilegedByAppChart";

const PrivilegedAccessMonitoring = () => {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Privileged Access & PAM Monitoring</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
            <PrivilegedTrendsChart />
        </div>
        <PrivilegedIdentitiesBreakdown />
        <PrivilegedByAppChart />
      </div>
    </section>
  );
};

export default PrivilegedAccessMonitoring;
