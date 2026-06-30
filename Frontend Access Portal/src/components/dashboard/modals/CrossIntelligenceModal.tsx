import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { governanceMetrics } from "@/services/mockRoleEntitlementMetrics";
import { useCssVariable } from "@/hooks/useCssVariable";
import { useTranslations } from "next-intl";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultTab?: string;
};

export const CrossIntelligenceModal = ({
  open,
  onClose,
  defaultTab = "maturity",
}: Props) => {

  const primaryColor = useCssVariable("--primary");
  const t = useTranslations("dashboard.modals.governanceIntelligenceAnalytics");


  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-5xl flex flex-col p-0 h-full"
      >
        <div className="flex flex-col h-full min-w-0">

          {/* Fixed Header */}
          <div className="flex-shrink-0 px-6 py-4">
            <SheetHeader className="p-0">
              <SheetTitle>
                {t("title")}
              </SheetTitle>

              <SheetDescription>
                {t("description")}
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">

              <Tabs defaultValue={defaultTab} className="w-full">

                <TabsList className="w-full">
                  <TabsTrigger value="maturity" className="flex-1">
                    {t("tabs.maturity")}
                  </TabsTrigger>

                  <TabsTrigger value="complexity" className="flex-1">
                    {t("tabs.complexity")}
                  </TabsTrigger>

                  <TabsTrigger value="trends" className="flex-1">
                    {t("tabs.trends")}
                  </TabsTrigger>
                </TabsList>

                {/* Maturity Tab */}
                <TabsContent value="maturity" className="space-y-6 mt-4">

                  <div className="flex items-center gap-6">

                    <div className="text-center">
                      <div className="text-4xl font-bold text-foreground">
                        {governanceMetrics.maturityIndex}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {t("maturity.score")}
                      </p>
                    </div>

                    <div className="flex-1 space-y-2">
                      {Object.entries(governanceMetrics.maturityDimensions).map(
                        ([key, value]) => (
                          <div key={key} className="space-y-1">

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground capitalize">
                                {t(`dimensions.${key}`)}
                              </span>

                              <span className="font-medium text-foreground">
                                {value}%
                              </span>
                            </div>

                            <Progress value={value} className="h-1.5" />

                          </div>
                        )
                      )}
                    </div>

                  </div>

                  <div>

                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                      {t("sections.maturityDimensions")}
                    </h4>

                    <ResponsiveContainer width="100%" height={280}>
                      <RadarChart
                        data={[
                          {
                            dimension: t("dimensions.coverage"),
                            value: governanceMetrics.maturityDimensions.roleCoverage,
                            fullMark: 100
                          },
                          {
                            dimension: t("dimensions.ownership"),
                            value:
                              governanceMetrics.maturityDimensions
                                .ownershipCompleteness,
                            fullMark: 100
                          },
                          {
                            dimension: t("dimensions.certification"),
                            value:
                              governanceMetrics.maturityDimensions
                                .certificationCoverage,
                            fullMark: 100
                          },
                          {
                            dimension: t("dimensions.roleBased"),
                            value:
                              governanceMetrics.maturityDimensions.roleBasedRatio,
                            fullMark: 100
                          },
                          {
                            dimension: t("dimensions.risk"),
                            value:
                              governanceMetrics.maturityDimensions.riskPosture,
                            fullMark: 100
                          }
                        ]}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="dimension" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Tooltip formatter={(value: number) => `${value}%`} />

                        <Radar
                          name={t("labels.current")}
                          dataKey="value"
                          stroke={primaryColor}
                          fill={primaryColor}
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>

                  </div>

                </TabsContent>

                {/* Complexity Tab */}
                <TabsContent value="complexity" className="space-y-6 mt-4">

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <div className="rounded-lg border border-border bg-card p-4 text-center">

                      <div className="text-3xl font-bold text-foreground">
                        {governanceMetrics.complexityScore}
                      </div>

                      <p className="text-xs text-muted-foreground mt-1">
                        {t("complexity.score")}
                      </p>

                      <Badge
                        variant={
                          governanceMetrics.complexityScore > 60
                            ? "destructive"
                            : "secondary"
                        }
                        className="mt-2 text-xs"
                      >
                        {governanceMetrics.complexityScore > 60
                          ? t("complexity.high")
                          : governanceMetrics.complexityScore > 40
                            ? t("complexity.medium")
                            : t("complexity.low")}
                      </Badge>

                    </div>

                  </div>

                </TabsContent>

                {/* Trends Tab */}
                <TabsContent value="trends" className="space-y-6 mt-4">

                  <div>

                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                      {t("sections.maturityTrend")}
                    </h4>

                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={governanceMetrics.maturityTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />

                        <Area
                          type="monotone"
                          dataKey="score"
                          fillOpacity={0.15}
                          strokeWidth={2}
                          stroke={primaryColor}
                          fill={primaryColor}
                        />

                      </AreaChart>
                    </ResponsiveContainer>

                  </div>

                </TabsContent>

              </Tabs>

            </ScrollArea>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};