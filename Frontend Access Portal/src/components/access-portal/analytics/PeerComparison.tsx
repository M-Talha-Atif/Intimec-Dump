import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockPeerData, mockCurrentUser } from '@/data/mock-user-profile';
import { Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const PeerComparison: React.FC = () => {
  const radarData = [
    { category: 'Applications', you: 5, peers: 6 },
    { category: 'Roles', you: 3, peers: 4 },
    { category: 'Groups', you: 4, peers: 3 },
    { category: 'Entitlements', you: 2, peers: 3 },
  ];

  const roleConformanceScore = 85;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Peer Comparison</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Peer Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPeerData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockCurrentUser.role}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Conformance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleConformanceScore}%</div>
            <Badge variant="default" className="mt-1">
              Good Match
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Trending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">GitHub Enterprise</div>
            <p className="text-xs text-muted-foreground mt-1">
              Most requested by peers
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Access Profile Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 10]} />
              <Radar name="You" dataKey="you" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
              <Radar name="Peers Avg" dataKey="peers" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Your Access</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground" />
              <span>Peer Average</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">What Your Peers Have</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockPeerData[0].recentRequests.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">{item}</span>
                <Badge variant="outline">
                  {Math.floor(Math.random() * 3) + 1} peers
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeerComparison;
