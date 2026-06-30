
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListTree, ShieldAlert, AreaChart, DatabaseZap } from "lucide-react";

export default function InsightMetrics() {
    const { t } = useTranslation();
    
    const insightMetrics = [
        { title: "Roles with most entitlements", value: "Global Administrator", icon: ListTree },
        { title: "Apps with highest risk scores", value: "Salesforce Prod", icon: ShieldAlert },
        { title: "Access growth by Department", value: "Sales (+22%)", icon: AreaChart },
        { title: "Top Sources of Sensitive Data", value: "Customer Data Lake", icon: DatabaseZap },
    ];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{t('dashboard.keyInsightMetrics')}</CardTitle>
                <CardDescription>At-a-glance summary</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {insightMetrics.map((metric) => (
                        <li key={metric.title} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <metric.icon className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium">{metric.title}</span>
                            </div>
                            <Badge variant="secondary">{metric.value}</Badge>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
