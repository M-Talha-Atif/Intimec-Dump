"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarIcon,
  Brain,
  Loader2,
  Download,
  Monitor,
  AlertTriangle,
  Lightbulb,
  Target,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useAILogPatternAnalysis,
  type PatternAnalysisResult,
  type LogPatternFilters,
} from "@/hooks/useAILogPatternAnalysis";

interface AnalyzeLogsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LOG_LEVELS = [
  { id: "error", label: "Error" },
  { id: "warning", label: "Warning" },
  { id: "info", label: "Info" },
  { id: "debug", label: "Debug" },
];

const LOG_SOURCES = [
  { id: "all", label: "All Sources" },
  { id: "connector", label: "Applications" },
  { id: "workflow", label: "Workflows" },
  { id: "access", label: "Access Events" },
  { id: "system", label: "System" },
];

export function AnalyzeLogsModal({
  open,
  onOpenChange,
}: AnalyzeLogsModalProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [timeRange, setTimeRange] = useState<string>("last-24h");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([
    "error",
    "warning",
    "info",
  ]);
  const [selectedSources, setSelectedSources] = useState<string[]>(["all"]);
  const [showSchedule, setShowSchedule] = useState(false);

  const { analyzeLogPatterns, isAnalyzing, analysisResults, exportAnalysis } =
    useAILogPatternAnalysis();

  const handleLevelToggle = (levelId: string) => {
    setSelectedLevels((prev) =>
      prev.includes(levelId)
        ? prev.filter((id) => id !== levelId)
        : [...prev, levelId]
    );
  };

  const handleSourceToggle = (sourceId: string) => {
    if (sourceId === "all") {
      setSelectedSources(["all"]);
    } else {
      setSelectedSources((prev) => {
        const filtered = prev.filter((id) => id !== "all");
        return filtered.includes(sourceId)
          ? filtered.filter((id) => id !== sourceId)
          : [...filtered, sourceId];
      });
    }
  };

  const handleAnalyze = async () => {
    const filters: LogPatternFilters = {
      timeRange,
      timeFrom: startDate?.toISOString(),
      timeTo: endDate?.toISOString(),
      loggingLevel: selectedLevels,
      source: selectedSources,
    };
    await analyzeLogPatterns(filters);
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    if (value !== "custom") {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderAnalysisResults = (result: PatternAnalysisResult) => (
    <div
      key={result.id}
      className="space-y-4 border-t pt-4 first:border-t-0 first:pt-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date(result.timestamp).toLocaleString()}
          </span>
          <Badge variant="outline">{result.logCount} logs analyzed</Badge>
          <Badge variant="secondary">{result.analysisTimeMs}ms</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAnalysis(result.id, "json")}
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Monitor className="h-3 w-3 mr-1" />
            Monitor
          </Button>
        </div>
      </div>

      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Patterns */}
        {result.patterns.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Patterns Detected
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.patterns.map((pattern, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm">{pattern.title}</span>
                    <Badge className={getSeverityColor(pattern.severity)}>
                      {pattern.severity}
                    </Badge>
                    <Badge variant="outline">{pattern.frequency}x</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pattern.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Risks */}
        {result.risks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.risks.map((risk, index) => (
                <div
                  key={index}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm">{risk.title}</span>
                    <Badge className={getSeverityColor(risk.likelihood)}>
                      {risk.likelihood} likelihood
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {risk.description}
                  </p>
                  <p className="text-sm text-red-700 font-medium">
                    Impact: {risk.impact}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm">{rec.title}</span>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} priority
                    </Badge>
                    <Badge variant="outline">{rec.effort} effort</Badge>
                  </div>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Affected Systems */}
        {result.affectedSystems.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Affected Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.affectedSystems.map((system, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-sm">{system.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {system.type}
                      </div>
                    </div>
                    <Badge className={getSeverityColor(system.impactLevel)}>
                      {system.impactLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[40vw] w-full max-h-[70vh] overflow-hidden flex flex-col p-6">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-5 w-5 text-primary" />
            AI Log Pattern Analysis - Debug Logs
          </DialogTitle>
          <DialogDescription className="text-sm">
            Configure analysis parameters to identify patterns, anomalies, and
            insights in your logs
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 min-h-0">
          {/* Schedule Task Checkbox + Buttons */}
          <div className="flex items-center justify-between p-4 border-2 border-l-4 border-l-blue-500 rounded-lg bg-card">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="schedule-task"
                checked={showSchedule}
                onCheckedChange={(checked) =>
                  setShowSchedule(checked as boolean)
                }
                className="h-5 w-5"
              />
              <CalendarIcon className="h-5 w-5 text-blue-500" />
              <label
                htmlFor="schedule-task"
                className="text-base font-semibold cursor-pointer select-none"
              >
                Schedule Task
              </label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Run Now
              </Button>
              <Button variant="outline" size="sm">
                Task History
              </Button>
            </div>
          </div>

          {/* Schedule Configuration - Shown when checkbox is checked */}
          {showSchedule && (
            <Card className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    Schedule Configuration
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    Debug Log Pattern Analysis
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Frequency */}
                  <div className="space-y-2">
                    <Label htmlFor="frequency" className="text-sm font-medium">
                      Frequency
                    </Label>
                    <Select defaultValue="one-time">
                      <SelectTrigger id="frequency" className="h-10">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-medium">
                      Time
                    </Label>
                    <div className="relative">
                      <input
                        type="time"
                        id="time"
                        defaultValue="09:00"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-10 text-muted-foreground"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Pick a date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm font-medium">
                    Timezone
                  </Label>
                  <Select defaultValue="utc">
                    <SelectTrigger id="timezone" className="h-10">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">
                        EST (America/New_York)
                      </SelectItem>
                      <SelectItem value="pst">
                        PST (America/Los_Angeles)
                      </SelectItem>
                      <SelectItem value="cet">CET (Europe/Paris)</SelectItem>
                      <SelectItem value="ist">IST (Asia/Kolkata)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Run immediately checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="run-immediately" className="h-4 w-4" />
                  <label
                    htmlFor="run-immediately"
                    className="text-sm font-medium leading-none cursor-pointer select-none"
                  >
                    Run immediately after saving
                  </label>
                </div>

                {/* Warning message */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Please select a date for one-time scheduling
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowSchedule(false)}
                  >
                    Cancel
                  </Button>
                  <Button>Schedule Task</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters Section - Card Style */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                Analysis Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Time Range */}
              <div className="space-y-2">
                <Label htmlFor="time-range" className="text-sm font-medium">
                  Time Range
                </Label>
                <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger id="time-range" className="h-10">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-1h">Last 1 Hour</SelectItem>
                    <SelectItem value="last-6h">Last 6 Hours</SelectItem>
                    <SelectItem value="last-24h">Last 24 Hours</SelectItem>
                    <SelectItem value="last-7d">Last 7 Days</SelectItem>
                    <SelectItem value="last-30d">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range */}
              {timeRange === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? (
                            format(startDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? (
                            format(endDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* Log Levels and Sources */}
              <div className="grid grid-cols-2 gap-6">
                {/* Log Levels */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Logging Levels</Label>
                  <div className="space-y-2">
                    {LOG_LEVELS.map((level) => (
                      <div
                        key={level.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={level.id}
                          checked={selectedLevels.includes(level.id)}
                          onCheckedChange={() => handleLevelToggle(level.id)}
                          className="h-4 w-4"
                        />
                        <label
                          htmlFor={level.id}
                          className="text-sm font-medium leading-none cursor-pointer select-none"
                        >
                          {level.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sources */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Sources</Label>
                  <div className="space-y-2">
                    {LOG_SOURCES.map((source) => (
                      <div
                        key={source.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={source.id}
                          checked={selectedSources.includes(source.id)}
                          onCheckedChange={() => handleSourceToggle(source.id)}
                          className="h-4 w-4"
                        />
                        <label
                          htmlFor={source.id}
                          className="text-sm font-medium leading-none cursor-pointer select-none"
                        >
                          {source.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Pattern Analysis Button */}
              <Button
                onClick={handleAnalyze}
                disabled={
                  isAnalyzing ||
                  selectedLevels.length === 0 ||
                  selectedSources.length === 0
                }
                className="w-full h-11 text-base"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    Start Pattern Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Analysis Results</h3>
                <Badge variant="outline" className="text-sm">
                  {analysisResults.length}{" "}
                  {analysisResults.length === 1 ? "Result" : "Results"}
                </Badge>
              </div>
              <div className="space-y-6">
                {analysisResults.map(renderAnalysisResults)}
              </div>
            </div>
          )}

          {/* Empty State */}
          {analysisResults.length === 0 && !isAnalyzing && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  Configure your filters above and click Start Pattern Analysis
                  to begin analyzing your logs for patterns and insights
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
