
import CampaignCompletionChart from "./CampaignCompletionChart"
import CertificationItems from "./CertificationItems"
import RecentActivity from "./RecentActivity"

export default function AccessReviewCampaigns() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="md:col-span-1 lg:col-span-1">
                <CampaignCompletionChart />
            </div>
            <div className="md:col-span-1 lg:col-span-1">
                <CertificationItems />
            </div>
            <div className="md:col-span-2 lg:col-span-2">
                <RecentActivity />
            </div>
        </div>
    )
}
