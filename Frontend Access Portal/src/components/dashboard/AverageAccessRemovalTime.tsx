
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Focus } from "lucide-react";
import { cn } from "@/lib/utils";

const AverageAccessRemovalTime = () => {
  const [focus, setFocus] = React.useState(false);
  const averageTime = 7.2; // in hours
  const targetTime = 8; // in hours
  const progress = (averageTime / targetTime) * 100;
  const isOverTarget = averageTime > targetTime;

  React.useEffect(() => {
    if (!focus) return
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setFocus(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [focus]);

  const WidgetContent = (
    <>
      <CardHeader className="relative">
        <CardTitle>Average Access Removal Time</CardTitle>
        <CardDescription>Target: {targetTime} hours</CardDescription>
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
        <div className="text-3xl font-bold">{averageTime} hrs</div>
        <div className="flex items-center gap-4 mt-2">
          <Progress value={progress} className={isOverTarget ? "[&>div]:bg-destructive" : "[&>div]:bg-green-500"} />
          <span className={`text-sm font-semibold ${isOverTarget ? 'text-destructive' : 'text-green-500'}`}>
            {isOverTarget ? 'Over Target' : 'On Target'}
          </span>
        </div>
      </CardContent>
    </>
  );

  return (
    <>
      {!focus ? (
        <Card>
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
  );
};

export default AverageAccessRemovalTime;
