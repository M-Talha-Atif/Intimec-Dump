import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Entitlement } from "@/data/mock-entitlements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Building, Shield, Tag, Calendar, CheckCircle2, XCircle, User, Briefcase, BarChart2, AlertTriangle, Users, History, BrainCog, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { mockUsers } from "@/data/mock-users";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const classificationVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  "High Risk": "destructive",
  "PII": "secondary",
  "GDPR": "default",
  "SOX": "outline",
};

type EntitlementDetailPanelProps = {
  entitlement: Entitlement;
  onClose: () => void;
};

const DetailHeaderItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    </div>
);

const EntitlementDetailPanel = ({ entitlement, onClose }: EntitlementDetailPanelProps) => {
  const assignedUsers = mockUsers.filter(user => entitlement.assignedUsers?.includes(user.id));
  
  return (
    <div className="bg-white h-full flex flex-col border-l">
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{entitlement.displayName}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Building className="h-4 w-4" /> {entitlement.application}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
          <DetailHeaderItem icon={Tag} label="Type" value={entitlement.type} />
          <DetailHeaderItem icon={User} label="Owner" value={entitlement.owner || 'Unowned'} />
          <DetailHeaderItem icon={Shield} label="Lifecycle" value={entitlement.lifecycle || 'N/A'} />
          <DetailHeaderItem 
            icon={entitlement.requestable ? CheckCircle2 : XCircle} 
            label="Requestable" 
            value={entitlement.requestable ? 'Yes' : 'No'} 
          />
          {entitlement.lastUsed && <DetailHeaderItem icon={Calendar} label="Last Used" value={format(parseISO(entitlement.lastUsed), 'MMM d, yyyy')} />}
          <div className="col-span-full">
              <p className="text-xs text-muted-foreground mb-1">Classification</p>
              <div className="flex flex-wrap gap-1">
                  {entitlement.classification.length > 0 ? entitlement.classification.map((c) => (
                      <Badge key={c} variant={classificationVariantMap[c] || "default"}>{c}</Badge>
                  )) : <span className="text-sm text-muted-foreground">Unclassified</span>}
              </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="overview" className="p-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="membership">Membership</TabsTrigger>
            <TabsTrigger value="roles">Mapped Roles</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Full Description</h4>
                <p className="text-sm text-muted-foreground">{entitlement.description}</p>
              </div>
              {entitlement.aiSummary && (
                <div>
                  <h4 className="font-semibold mb-2">AI Summary</h4>
                  <p className="text-sm text-muted-foreground italic">"{entitlement.aiSummary}"</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Attribute Source</h4>
                <p className="text-sm text-muted-foreground">{entitlement.attribute}</p>
              </div>
            </div>
          </TabsContent>
           <TabsContent value="membership" className="mt-4">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2"><Users className="h-5 w-5" /> Assigned Users ({assignedUsers.length})</h4>
                {assignedUsers.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.department}</TableCell>
                            <TableCell>{user.type}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Users className="mx-auto h-8 w-8 mb-2" />
                    <h4 className="font-semibold">No Users Assigned</h4>
                    <p className="text-sm">This entitlement has not been assigned to any users.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="roles" className="mt-4">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2"><Briefcase className="h-5 w-5" /> Mapped Roles</h4>
                {entitlement.associatedRoles && entitlement.associatedRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {entitlement.associatedRoles.map(role => (
                      <Badge key={role} variant="secondary">{role}</Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Briefcase className="mx-auto h-8 w-8 mb-2" />
                    <h4 className="font-semibold">No Mapped Roles</h4>
                    <p className="text-sm">This entitlement is not part of any role.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="usage" className="mt-4">
             <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2"><BarChart2 className="h-5 w-5" /> Usage Trend (Last 6 Months)</h4>
                {entitlement.usageHistory && entitlement.usageHistory.length > 0 ? (
                   <div className="h-[200px] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={entitlement.usageHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="usageCount" name="Usage Count" stroke="#16a34a" strokeWidth={2} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <BarChart2 className="mx-auto h-8 w-8 mb-2" />
                    <h4 className="font-semibold">No Usage Data</h4>
                    <p className="text-sm">Usage activity for this entitlement is not available.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="governance" className="mt-4">
             <div className="space-y-8">
                {/* Risk Insights Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Risk Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-slate-50/50">
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Primary Risk</h4>
                            {entitlement.riskReason ? (
                                <p className="text-sm text-muted-foreground">{entitlement.riskReason}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">No primary risk has been identified.</p>
                            )}
                        </div>
                        {entitlement.aiInsightTags && entitlement.aiInsightTags.length > 0 && (
                            <div className="col-span-1 md:col-span-2">
                                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2"><BrainCog className="h-4 w-4" /> AI Insight Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {entitlement.aiInsightTags.map(tag => (
                                        <Badge key={tag} variant="outline">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Privilege Level</h4>
                            <Badge variant={entitlement.privilegeLevel === 'Admin' ? 'destructive' : 'secondary'}>{entitlement.privilegeLevel || 'Not set'}</Badge>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Data Classifications</h4>
                            <div className="flex flex-wrap gap-1">
                                {entitlement.classification.length > 0 ? entitlement.classification.map((c) => (
                                    <Badge key={c} variant={classificationVariantMap[c] || "default"}>{c}</Badge>
                                )) : <span className="text-sm text-muted-foreground">Unclassified</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Certification History Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Certification History</h3>
                    {entitlement.reviewHistory && entitlement.reviewHistory.length > 0 ? (
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Campaign</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Completed Date</TableHead>
                                        <TableHead>Reviewer</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entitlement.reviewHistory.map((review, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{review.campaign}</TableCell>
                                            <TableCell>
                                                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1.5 w-fit">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    <span>Complete</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{format(parseISO(review.date), 'MMM d, yyyy')}</TableCell>
                                            <TableCell>{review.reviewer}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8 border rounded-lg bg-slate-50/50">
                            <ShieldCheck className="mx-auto h-8 w-8 mb-2" />
                            <h4 className="font-semibold">No Review History</h4>
                            <p className="text-sm">No governance reviews have been recorded.</p>
                        </div>
                    )}
                </div>

                {/* Changelog Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><History className="h-5 w-5" /> Changelog</h3>
                     {entitlement.activityHistory && entitlement.activityHistory.length > 0 ? (
                        <div className="relative border-l-2 border-slate-200 pl-6 space-y-8 py-2">
                            {entitlement.activityHistory
                                .slice()
                                .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
                                .map((event, index) => (
                                <div key={index} className="relative">
                                    <div className="absolute -left-[35px] top-1.5 h-4 w-4 rounded-full bg-slate-200 border-4 border-white"></div>
                                    <p className="text-sm font-medium text-slate-800">{event.activity}</p>
                                    <p className="text-xs text-muted-foreground">
                                        by <span className="font-semibold">{event.user}</span>
                                        {event.details && ` - ${event.details}`}
                                    </p>
                                    <time className="text-xs text-muted-foreground/80">{format(parseISO(event.date), 'MMMM d, yyyy')}</time>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8 border rounded-lg bg-slate-50/50">
                            <History className="mx-auto h-8 w-8 mb-2" />
                            <h4 className="font-semibold">No History Available</h4>
                            <p className="text-sm">Activity history for this entitlement is not available.</p>
                        </div>
                    )}
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EntitlementDetailPanel;
