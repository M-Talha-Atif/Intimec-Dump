
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const activities = [
  { type: "Approve", user: "Olivia Martin", target: "Admin role for 'AWS Prod'", time: "5m ago", icon: CheckCircle2, color: "text-green-500" },
  { type: "Reject", user: "Liam Smith", target: "Read-only access to 'Customer DB'", time: "30m ago", icon: XCircle, color: "text-red-500" },
  { type: "Expire", user: "System", target: "Temporary access for 'vendor_user_1'", time: "2h ago", icon: Clock, color: "text-gray-500" },
  { type: "Approve", user: "Sophia Lee", target: "Editor role in 'Contentful'", time: "4h ago", icon: CheckCircle2, color: "text-green-500" },
  { type: "Approve", user: "Jackson Chen", target: "Access to 'GitHub Enterprise'", time: "1d ago", icon: CheckCircle2, color: "text-green-500" },
]

function getInitials(name: string) {
    if (name === "System") return "SY";
    const names = name.split(' ');
    if (names.length > 1) {
        return names[0][0] + names[1][0];
    }
    return name[0];
}

export default function RecentActivity() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Last 5 certification actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
                <Avatar className="h-8 w-8 border">
                    <AvatarFallback>{getInitials(activity.user)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.user}</span>
                      <span className={activity.color}> {activity.type.toLowerCase()}d </span>
                      <span className="text-muted-foreground">request for</span>{' '}
                      <span className="font-medium">{activity.target}</span>.
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
