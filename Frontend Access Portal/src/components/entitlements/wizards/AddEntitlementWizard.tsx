import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, ChevronLeft, ChevronRight, X, FileText, Users, GitBranch, ShieldCheck, ClipboardCheck, Search } from "lucide-react";
import { mockRoles } from "@/data/mock-roles";
import { toast } from "sonner";
import VisualRuleBuilder, { RuleCondition } from "@/components/shared/VisualRuleBuilder";

interface AddEntitlementWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  { label: "Basic Info", icon: FileText },
  { label: "Ownership & Classification", icon: Users },
  { label: "Relationships", icon: GitBranch },
  { label: "Risk & Compliance", icon: ShieldCheck },
  { label: "Review & Submit", icon: ClipboardCheck },
];

const TYPES = ["Group", "Role", "Responsibility", "Policy", "Permission"];
const PRIVILEGE_LEVELS = ["Read", "Write", "Admin"];
const LIFECYCLES = ["Active", "Deprecated", "Inactive"];
const COMPLIANCE_TAGS = ["SOX", "GDPR", "PII", "High Risk", "HIPAA"];
const APPLICATIONS = ["Active Directory", "Oracle EBS", "Salesforce", "Workday", "GitHub", "AWS", "Jira", "Okta", "ServiceNow", "Tableau", "Azure"];

const AddEntitlementWizard: React.FC<AddEntitlementWizardProps> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState(0);
  const [roleSearch, setRoleSearch] = useState("");
  const [ruleConditions, setRuleConditions] = useState<RuleCondition[]>([]);
  const [ruleLogic, setRuleLogic] = useState<"AND" | "OR">("AND");
  const [ruleScript, setRuleScript] = useState("");
  const [form, setForm] = useState({
    displayName: "", application: "", attribute: "", type: "" as string, description: "", privilegeLevel: "Read",
    owner: "", classification: [] as string[], requestable: true, lifecycle: "Active",
    associatedRoles: [] as string[],
    riskLevel: "Low", complianceTags: [] as string[], dataSensitivity: "None",
  });

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));
  const toggleArray = (key: string, val: string) => {
    const arr = (form as any)[key] as string[];
    update(key, arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const canNext = () => {
    if (step === 0) return form.displayName && form.application && form.type && form.description;
    return true;
  };

  const handleSubmit = () => {
    toast.success(`Entitlement "${form.displayName}" created successfully`);
    onOpenChange(false);
    setStep(0);
    setForm({ displayName: "", application: "", attribute: "", type: "", description: "", privilegeLevel: "Read", owner: "", classification: [], requestable: true, lifecycle: "Active", associatedRoles: [], riskLevel: "Low", complianceTags: [], dataSensitivity: "None" });
    setRuleConditions([]);
    setRuleScript("");
  };

  const filteredRoles = mockRoles
    .filter(r => r.status === "Enabled")
    .filter(r => !roleSearch || r.name.toLowerCase().includes(roleSearch.toLowerCase()) || r.businessUnit?.toLowerCase().includes(roleSearch.toLowerCase()));

  const stepComplete = (i: number) => {
    if (i === 0) return !!(form.displayName && form.application && form.type && form.description);
    if (i === 1) return true;
    if (i === 2) return true;
    if (i === 3) return true;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex h-full">
          {/* Vertical stepper sidebar */}
          <div className="w-56 bg-muted/50 border-r p-4 flex flex-col gap-1 shrink-0">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-base font-semibold">Add Entitlement</DialogTitle>
            </DialogHeader>
            {STEPS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2.5 p-2 rounded-md text-left text-xs transition-colors ${
                  i === step ? "bg-primary text-primary-foreground font-medium" :
                  i < step ? "text-foreground hover:bg-muted cursor-pointer" : "text-muted-foreground"
                }`}
              >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                  i < step ? "bg-primary/20 text-primary" : i === step ? "bg-primary-foreground/20" : "border"
                }`}>
                  {i < step && stepComplete(i) ? <CheckCircle2 className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                </div>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <Label>Display Name <span className="text-destructive">*</span></Label>
                    <Input value={form.displayName} onChange={e => update("displayName", e.target.value)} placeholder="e.g. Domain Admins" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Application <span className="text-destructive">*</span></Label>
                      <Select value={form.application} onValueChange={v => update("application", v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select app" /></SelectTrigger>
                        <SelectContent className="bg-popover border shadow-md">{APPLICATIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Type <span className="text-destructive">*</span></Label>
                      <Select value={form.type} onValueChange={v => update("type", v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent className="bg-popover border shadow-md">{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Attribute</Label>
                      <Input value={form.attribute} onChange={e => update("attribute", e.target.value)} placeholder="e.g. memberOf" className="mt-1" />
                    </div>
                    <div>
                      <Label>Privilege Level</Label>
                      <Select value={form.privilegeLevel} onValueChange={v => update("privilegeLevel", v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover border shadow-md">{PRIVILEGE_LEVELS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Description <span className="text-destructive">*</span></Label>
                    <Textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Describe this entitlement..." className="mt-1 min-h-[80px]" />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Owner</Label>
                      <Input value={form.owner} onChange={e => update("owner", e.target.value)} placeholder="e.g. IT Security" className="mt-1" />
                      <p className="text-xs text-muted-foreground mt-1">Accountable for access reviews and governance.</p>
                    </div>
                    <div>
                      <Label>Lifecycle Status</Label>
                      <Select value={form.lifecycle} onValueChange={v => update("lifecycle", v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover border shadow-md">{LIFECYCLES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">Current lifecycle phase of this entitlement.</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label>Requestable</Label>
                      <p className="text-xs text-muted-foreground">Allow users to request this entitlement through the portal.</p>
                    </div>
                    <Switch checked={form.requestable} onCheckedChange={v => update("requestable", v)} />
                  </div>
                  <div>
                    <Label>Classification Tags</Label>
                    <p className="text-xs text-muted-foreground mb-2">Tags for compliance tracking and risk categorization.</p>
                    <div className="flex flex-wrap gap-2">
                      {COMPLIANCE_TAGS.map(tag => (
                        <Badge key={tag} variant={form.classification.includes(tag) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleArray("classification", tag)}>{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label>Associated Roles</Label>
                    <p className="text-xs text-muted-foreground mb-2">Link this entitlement to existing roles.</p>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input value={roleSearch} onChange={e => setRoleSearch(e.target.value)} placeholder="Search roles..." className="pl-8" />
                    </div>
                  </div>
                  <div className="max-h-[240px] overflow-y-auto space-y-1 border rounded-lg p-2">
                    {filteredRoles.map(r => (
                      <div key={r.id} onClick={() => toggleArray("associatedRoles", r.id)}
                        className={`p-2.5 rounded-md border cursor-pointer transition-colors text-sm ${form.associatedRoles.includes(r.id) ? "bg-primary/10 border-primary" : "hover:border-primary/50"}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{r.name}</span>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">{r.type}</Badge>
                            {r.risk?.score === "High" && <Badge variant="destructive" className="text-xs">High Risk</Badge>}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{r.businessUnit} · {r.userCount} users</span>
                      </div>
                    ))}
                  </div>
                  {form.associatedRoles.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {form.associatedRoles.map(id => {
                        const r = mockRoles.find(x => x.id === id);
                        return <Badge key={id} variant="secondary" className="text-xs">{r?.name}<X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => toggleArray("associatedRoles", id)} /></Badge>;
                      })}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Risk Level</Label>
                      <Select value={form.riskLevel} onValueChange={v => update("riskLevel", v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover border shadow-md">
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Data Sensitivity</Label>
                      <Select value={form.dataSensitivity} onValueChange={v => update("dataSensitivity", v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover border shadow-md">
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Internal">Internal</SelectItem>
                          <SelectItem value="Confidential">Confidential</SelectItem>
                          <SelectItem value="Restricted">Restricted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Compliance Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {COMPLIANCE_TAGS.map(tag => (
                        <Badge key={tag} variant={form.complianceTags.includes(tag) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleArray("complianceTags", tag)}>{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <VisualRuleBuilder
                    conditions={ruleConditions}
                    onChange={setRuleConditions}
                    logicOperator={ruleLogic}
                    onLogicChange={setRuleLogic}
                    scriptValue={ruleScript}
                    onScriptChange={setRuleScript}
                    label="Assignment Rule (Optional)"
                    description="Define conditions for automatic assignment of this entitlement."
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Review Summary</h3>
                  <div className="space-y-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><FileText className="h-3 w-3" /> Basic Information</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {[["Display Name", form.displayName], ["Application", form.application], ["Type", form.type], ["Privilege Level", form.privilegeLevel]].map(([l, v]) => (
                          <div key={l as string}><span className="text-muted-foreground text-xs">{l}:</span> <span className="font-medium">{v}</span></div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><Users className="h-3 w-3" /> Ownership</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {[["Owner", form.owner || "—"], ["Lifecycle", form.lifecycle], ["Requestable", form.requestable ? "Yes" : "No"]].map(([l, v]) => (
                          <div key={l as string}><span className="text-muted-foreground text-xs">{l}:</span> <span className="font-medium">{v}</span></div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Risk & Compliance</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground text-xs">Risk Level:</span> <span className="font-medium">{form.riskLevel}</span></div>
                        <div><span className="text-muted-foreground text-xs">Data Sensitivity:</span> <span className="font-medium">{form.dataSensitivity}</span></div>
                        <div><span className="text-muted-foreground text-xs">Roles:</span> <span className="font-medium">{form.associatedRoles.length} selected</span></div>
                      </div>
                      {(form.classification.length > 0 || form.complianceTags.length > 0) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {[...form.classification, ...form.complianceTags].map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm">{form.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between p-4 border-t">
              <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : onOpenChange(false)}>
                {step > 0 ? <><ChevronLeft className="h-4 w-4 mr-1" /> Back</> : "Cancel"}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit}>Create Entitlement</Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEntitlementWizard;
