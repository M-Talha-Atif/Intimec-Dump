
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { KeyRound, Shield, ChevronsUpDown, Server } from 'lucide-react';

const NhiExplorerTab = ({ identity }: { identity: any }) => {
  const privileges = identity.privileges || ['Read', 'Write', 'Admin'];
  const grants = identity.grants || [
    { objectType: 'Policy', name: 'S3FullAccess', risk: 'High', source: 'Manual' },
    { objectType: 'Role', name: 'EC2Admin', risk: 'High', source: 'Role-Based' },
    { objectType: 'Permission', name: 'CloudWatch:ReadLogs', risk: 'Low', source: 'Role-Based' },
  ];

  const groupedByPrivilege = privileges.map((priv: string, idx: number) => ({
    privilege: priv,
    entitlements: grants.filter((_: any, i: number) => i % privileges.length === idx)
  }));

  return (
    <Card className="pt-4">
      <CardHeader>
        <CardTitle>Access Explorer</CardTitle>
        <CardDescription>Drill down to see how each privilege grants entitlements.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-2">
          {groupedByPrivilege.map((group: any, idx: number) => (
            <AccordionItem value={`priv-${idx}`} key={idx} className="bg-muted/50 rounded-lg border">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <KeyRound className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{group.privilege}</span>
                  <Badge variant="outline">{group.entitlements.length} entitlements</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t">
                {group.entitlements.map((ent: any, eidx: number) => (
                  <Collapsible key={eidx} className="py-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{ent.name}</span>
                      </div>
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                          Show Path <ChevronsUpDown className="h-4 w-4" />
                        </button>
                      </CollapsibleTrigger>
                    </div>
                    <Badge variant="secondary" className="mt-1 gap-1.5 pl-1.5 text-xs">
                      <Server className="h-3 w-3" />{ent.source || 'Direct'}
                    </Badge>
                    <CollapsibleContent>
                      <div className="pl-4 mt-2 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"><KeyRound className="h-4 w-4" /></div>
                          <span className="text-sm text-muted-foreground">Identity: {identity.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"><Shield className="h-4 w-4" /></div>
                          <span className="text-sm text-muted-foreground">Privilege "{group.privilege}" grants {ent.objectType} "{ent.name}"</span>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default NhiExplorerTab;
