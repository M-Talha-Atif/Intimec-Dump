import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, Users, Shield, History, Network } from "lucide-react";
import IdentityRelationshipGraph from "@/components/shared/IdentityRelationshipGraph";
import { getGroup, getGroupAudit } from "@/services/groups";
import { UsedInBadges } from "./UsedInBadges";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GroupDetailsPanelProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function GroupDetailsPanel({ groupId, isOpen, onClose }: GroupDetailsPanelProps) {
  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroup(groupId),
    enabled: isOpen
  });

  const { data: audit, isLoading: isLoadingAudit } = useQuery({
    queryKey: ['group-audit', groupId],
    queryFn: () => getGroupAudit(groupId),
    enabled: isOpen
  });

  const getRiskBadgeVariant = (level: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        {isLoadingGroup ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : group ? (
          <div className="flex flex-col h-full">
            {/* Fixed Header */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">{group.name}</h2>
                <Badge variant={group.type === 'dynamic' ? 'default' : 'secondary'}>
                  {group.type}
                </Badge>
                <Badge variant={getRiskBadgeVariant(group.riskLevel)}>
                  {group.riskLevel} risk
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="pt-4">
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview"><Info className="h-4 w-4 mr-1" />Overview</TabsTrigger>
                    <TabsTrigger value="owners"><Users className="h-4 w-4 mr-1" />Owners</TabsTrigger>
                    {group.type === 'dynamic' && (
                      <TabsTrigger value="rules"><Shield className="h-4 w-4 mr-1" />Rules</TabsTrigger>
                    )}
                    <TabsTrigger value="relationships"><Network className="h-4 w-4 mr-1" />Relationships</TabsTrigger>
                    <TabsTrigger value="audit"><History className="h-4 w-4 mr-1" />Audit</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 pt-4">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Member Count</div>
                            <div className="text-2xl font-bold">{group.memberCount}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Risk Level</div>
                            <div className="text-2xl font-bold capitalize">{group.riskLevel}</div>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Email</div>
                          <div className="text-sm font-medium">{group.email || 'Not configured'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Created</div>
                          <div className="text-sm font-medium">{format(new Date(group.createdAt), 'PPP')}</div>
                        </div>
                        {group.updatedAt && (
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Last Updated</div>
                            <div className="text-sm font-medium">{format(new Date(group.updatedAt), 'PPP')}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Tags</div>
                          <div className="flex flex-wrap gap-1">
                            {group.tags.length > 0 ? (
                              group.tags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">No tags</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <div>
                      <div className="text-sm font-medium mb-2">Used In</div>
                      <UsedInBadges usedIn={group.usedIn} maxVisible={5} />
                    </div>
                  </TabsContent>

                  <TabsContent value="owners" className="space-y-4 pt-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {group.ownerDetails && group.ownerDetails.length > 0 ? (
                            group.ownerDetails.map((owner) => (
                              <div key={owner.id} className="flex items-center gap-3 p-2 border rounded-lg">
                                <div className="flex-1">
                                  <div className="font-medium">{owner.name}</div>
                                  <div className="text-sm text-muted-foreground">{owner.email}</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              {group.owners.length > 0 ? (
                                group.owners.map((email, i) => (
                                  <div key={i} className="p-2 border rounded-lg mb-2">{email}</div>
                                ))
                              ) : (
                                'No owners assigned'
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {group.type === 'dynamic' && (
                    <TabsContent value="rules" className="space-y-4 pt-4">
                      <Card>
                        <CardContent className="p-4">
                          {group.rules && group.rules.length > 0 ? (
                            <div className="space-y-3">
                              {group.rules.map((rule, index) => (
                                <div key={rule.id} className="p-3 border rounded-lg bg-muted/30">
                                  {index > 0 && rule.condition && (
                                    <Badge variant="outline" className="mb-2">{rule.condition}</Badge>
                                  )}
                                  <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Type:</span>
                                      <span className="ml-2 font-medium">{rule.type}</span>
                                    </div>
                                    {rule.attribute && (
                                      <div>
                                        <span className="text-muted-foreground">Attribute:</span>
                                        <span className="ml-2 font-medium">{rule.attribute}</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-muted-foreground">Operator:</span>
                                      <span className="ml-2 font-medium">{rule.operator}</span>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-sm">
                                    <span className="text-muted-foreground">Value:</span>
                                    <span className="ml-2 font-medium">{rule.value}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">No rules defined</div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}

                  <TabsContent value="relationships" className="pt-4">
                    <IdentityRelationshipGraph
                      identityName={group.name}
                      identitySubtitle={`${group.type} Group • ${group.memberCount} members`}
                      identityType="group"
                      riskLevel={group.riskLevel}
                      applications={[
                        { name: 'Active Directory', risk: 'low', accounts: group.memberCount },
                        { name: 'Azure AD', risk: 'low', accounts: Math.ceil(group.memberCount * 0.8) },
                      ]}
                      accounts={[
                        { id: `grp-${group.name.toLowerCase().replace(/\s/g, '-')}`, name: `grp-${group.name.toLowerCase().replace(/\s/g, '-')}`, application: 'Active Directory' },
                      ]}
                      roles={[
                        { name: 'Group Member Role', risk: group.riskLevel?.toLowerCase() === 'high' ? 'high' : 'low', type: 'Business', users: group.memberCount },
                      ]}
                      entitlements={[
                        { name: 'Group Resources', risk: 'low', privilege: 'Read', fromRole: true },
                        { name: 'Shared Access', risk: group.riskLevel?.toLowerCase() === 'high' ? 'high' : 'low', privilege: 'Read/Write', fromRole: true },
                      ]}
                      riskIndicators={group.riskLevel === 'high' ? [{
                        label: 'Elevated Group Risk',
                        subtitle: 'High-privilege group',
                        riskLevel: 'high',
                        count: 1,
                        metadata: { remediation: 'Review group membership and access scope' }
                      }] : []}
                    />
                  </TabsContent>

                  <TabsContent value="audit" className="space-y-4 pt-4">
                    {isLoadingAudit ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : audit && audit.length > 0 ? (
                      <div className="space-y-3">
                        {audit.map((entry) => (
                          <Card key={entry.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium">{entry.action}</div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    by {entry.actor} ({entry.actorEmail})
                                  </div>
                                  {Object.keys(entry.changes).length > 0 && (
                                    <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                                      {JSON.stringify(entry.changes, null, 2)}
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(entry.timestamp), 'PPp')}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No audit history available
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
