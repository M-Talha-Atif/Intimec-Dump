
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CircleAlert, ShieldAlert, BadgeHelp, Focus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const items = [
  { title: "Overdue Access Reviews", value: 8, icon: CircleAlert, color: "text-red-500" },
  { title: "Open Violations", value: 3, icon: ShieldAlert, color: "text-yellow-600" },
  { title: "Policy Exceptions", value: 12, icon: BadgeHelp, color: "text-blue-500" },
];

export default function CertificationItems() {
  const [focus, setFocus] = React.useState(false)

  React.useEffect(() => {
    if (!focus) return
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setFocus(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [focus])

  const WidgetContent = (
    <>
      <CardHeader className="relative">
        <CardTitle>Certification Items</CardTitle>
        <CardDescription>Key metrics needing attention</CardDescription>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Focus on chart"
          className="absolute top-4 right-4 p-1"
          onClick={() => setFocus(true)}
        >
          <Focus className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-6">
          {items.map((item) => (
            <li key={item.title} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <item.icon className={`h-6 w-6 ${item.color}`} />
                <span className="text-sm font-medium text-muted-foreground">{item.title}</span>
              </div>
              <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </>
  )

  return (
    <>
      {!focus ? (
        <Card className="h-full">
          {WidgetContent}
        </Card>
      ) : (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black/60 flex items-center justify-center transition-all",
            focus && "animate-in fade-in-0"
          )}
        >
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto relative shadow-2xl ring-2 ring-primary ring-offset-4">
            <button
              aria-label="Exit focus"
              className="absolute top-3 right-3 z-10 bg-white rounded-full shadow p-1 hover:bg-gray-200 transition"
              onClick={() => setFocus(false)}
            >
              <span className="text-xl font-bold">&times;</span>
            </button>
            {WidgetContent}
          </Card>
        </div>
      )}
    </>
  )
}
