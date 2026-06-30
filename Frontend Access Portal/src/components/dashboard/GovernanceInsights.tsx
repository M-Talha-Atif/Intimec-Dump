
import InsightMetrics from "./InsightMetrics";
import EntitlementSprawlChart from "./EntitlementSprawlChart";
import AccessGrowthChart from "./AccessGrowthChart";
import StaleAccountsByDeptChart from "./StaleAccountsByDeptChart";

export default function GovernanceInsights() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <InsightMetrics />
            <EntitlementSprawlChart />
            <AccessGrowthChart />
            <StaleAccountsByDeptChart />
        </div>
    )
}
