import { AccessChangeItem } from "@/types/tasks";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";

interface TaskDiffViewProps {
  items?: AccessChangeItem[];
  fallback?: { before?: any; after?: any };
}

export default function TaskDiffView({ items, fallback }: TaskDiffViewProps) {
  if (items && items.length > 0) {
    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.subjectId} className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="font-semibold text-foreground">{item.subjectName}</div>
              <Badge variant="outline" className="text-xs">
                {item.subjectId}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Additions */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                  <Plus className="h-4 w-4" />
                  <span>Additions</span>
                </div>
                {item.additions.roles.length === 0 && item.additions.entitlements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No additions</p>
                ) : (
                  <div className="space-y-2">
                    {item.additions.roles.length > 0 && (
                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">Roles</div>
                        <ul className="ml-4 space-y-1">
                          {item.additions.roles.map((role) => (
                            <li key={role} className="flex items-start gap-2 text-sm">
                              <span className="mt-1 text-green-600">+</span>
                              <span>{role}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.additions.entitlements.length > 0 && (
                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">Entitlements</div>
                        <ul className="ml-4 space-y-1">
                          {item.additions.entitlements.map((ent) => (
                            <li key={ent} className="flex items-start gap-2 text-sm">
                              <span className="mt-1 text-green-600">+</span>
                              <span>{ent}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Removals */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                  <Minus className="h-4 w-4" />
                  <span>Removals</span>
                </div>
                {item.removals.roles.length === 0 && item.removals.entitlements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No removals</p>
                ) : (
                  <div className="space-y-2">
                    {item.removals.roles.length > 0 && (
                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">Roles</div>
                        <ul className="ml-4 space-y-1">
                          {item.removals.roles.map((role) => (
                            <li key={role} className="flex items-start gap-2 text-sm">
                              <span className="mt-1 text-red-600">-</span>
                              <span>{role}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.removals.entitlements.length > 0 && (
                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">Entitlements</div>
                        <ul className="ml-4 space-y-1">
                          {item.removals.entitlements.map((ent) => (
                            <li key={ent} className="flex items-start gap-2 text-sm">
                              <span className="mt-1 text-red-600">-</span>
                              <span>{ent}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback JSON diff
  if (fallback?.before || fallback?.after) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-semibold">Before</div>
          <pre className="overflow-auto rounded-lg border bg-muted p-3 text-xs">
            {JSON.stringify(fallback.before, null, 2)}
          </pre>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold">After</div>
          <pre className="overflow-auto rounded-lg border bg-muted p-3 text-xs">
            {JSON.stringify(fallback.after, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/50 p-8 text-center">
      <p className="text-sm text-muted-foreground">No change details available</p>
    </div>
  );
}
