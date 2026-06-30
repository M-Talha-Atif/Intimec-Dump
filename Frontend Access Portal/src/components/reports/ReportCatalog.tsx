import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Calendar, Download, Eye, Share, MoreHorizontal, AlertTriangle, Shield, Users, FileText, Activity, Edit, Trash, Save, Tag, Copy, Webhook, MessageSquare, Clock, GitCompare, Lock, Bell, History, ChevronDown, ChevronRight, Star, StarOff, ClipboardCheck, UserCheck, Layers, Zap } from 'lucide-react';
import { 
  ReportViewDialog,
  WebhookConfigModal,
  SlackIntegrationModal,
  ReportVersionHistoryModal,
  ReportCloneModal,
  ReportComparisonModal,
  ReportPermissionsModal,
  ReportSubscriptionModal,
  ReportExecutionHistoryModal
} from './dialogs';
import { ReportDetailDrawer } from './dialogs/ReportDetailDrawer';
import { ReportDeleteDialog } from './dialogs/ReportDeleteDialog';
import { ReportDownloadDialog } from './dialogs/ReportDownloadDialog';
import { ReportShareDialog } from './dialogs/ReportShareDialog';
import { ScheduleReportDialog } from './dialogs/ScheduleReportDialog';
import { useToast } from "@/hooks/use-toast";
import { reportService } from '@/services/reportService';
import { reportTemplateService } from '@/services/reportTemplateService';
import { getStatusBadgeClass } from '@/utils/getBadgeClass';
import { cn } from '@/lib/utils';
import { usePagination, StandardPagination } from '@/components/shared/StandardPagination';

interface Report {
  id: string;
  name: string;
  category: string;
  description: string;
  lastGenerated: string;
  frequency: string;
  status: 'active' | 'scheduled' | 'draft' | 'error';
  createdBy: string;
  tags: string[];
  icon: React.ComponentType<{ className?: string }>;
  isTemplate?: boolean;
  deliveryMethods?: string[];
}

const CATEGORY_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  'Compliance': { icon: Shield, label: 'Compliance & Risk' },
  'Risk': { icon: AlertTriangle, label: 'Risk Intelligence' },
  'Certification': { icon: ClipboardCheck, label: 'Certification & Access Reviews' },
  'Identity Lifecycle': { icon: UserCheck, label: 'Identity Lifecycle' },
  'Role Governance': { icon: Layers, label: 'Role & Entitlement Governance' },
  'Operational': { icon: Zap, label: 'Operational & Workflow' },
  'IGA': { icon: Users, label: 'IGA Core Reports' },
  'Custom': { icon: FileText, label: 'Custom Reports' },
};

export const ReportCatalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [slackModalOpen, setSlackModalOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [executionHistoryOpen, setExecutionHistoryOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [showMoreActions, setShowMoreActions] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem('report_favorites');
    return stored ? JSON.parse(stored) : [];
  });
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const availableTags = ['#SoD', '#GDPR', '#Quarterly', '#Risk', '#Compliance', '#Audit', '#Identity', '#Access', '#Certification', '#Lifecycle', '#Privileged', '#JML'];
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const templates = reportTemplateService.getAllTemplates();
    const reportList = templates.map((template) => {
      const status = template.usageCount && template.usageCount > 0 ? 'active' : 'draft';
      return {
        id: template.id,
        name: template.name,
        category: template.category,
        description: template.description,
        lastGenerated: template.usageCount && template.usageCount > 0 ? '2 hours ago' : 'Never',
        frequency: template.complianceFramework ? 'Monthly' : 'On-Demand',
        status: status as 'active' | 'draft',
        createdBy: 'System',
        tags: template.tags,
        icon: CATEGORY_CONFIG[template.category]?.icon || FileText,
        isTemplate: false,
        deliveryMethods: ['email', 'webhook'] as string[]
      };
    });
    setReports(reportList);
    // Expand all categories by default
    const expanded: Record<string, boolean> = {};
    reportList.forEach(r => { expanded[r.category] = true; });
    setExpandedCategories(expanded);
  }, []);

  const toggleFavorite = (reportId: string) => {
    setFavorites(prev => {
      const next = prev.includes(reportId) ? prev.filter(id => id !== reportId) : [...prev, reportId];
      localStorage.setItem('report_favorites', JSON.stringify(next));
      return next;
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesTag = selectedTag === 'all' || report.tags.includes(selectedTag.replace('#', ''));
    return matchesSearch && matchesCategory && matchesTag;
  });

  const { paginatedData: paginatedReports, paginationProps } = usePagination(filteredReports, 9);

  const groupedReports = useMemo(() => {
    const groups: Record<string, Report[]> = {};
    paginatedReports.forEach(report => {
      if (!groups[report.category]) groups[report.category] = [];
      groups[report.category].push(report);
    });
    return groups;
  }, [paginatedReports]);

  const favoriteReports = filteredReports.filter(r => favorites.includes(r.id));

  const getDeliveryIcon = (method: string) => {
    switch (method) {
      case 'email': return '📧';
      case 'slack': return '💬';
      case 'teams': return '👥';
      case 'webhook': return '🔗';
      default: return '📤';
    }
  };

  const handleViewReport = async (report: Report) => {
    setSelectedReport(report);
    toast({ title: "Generating Report", description: "Please wait..." });
    
    try {
      const result = await reportService.executeReport(report.id);
      setReportData(result);
      setViewDialogOpen(true);
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate report", variant: "destructive" });
    }
  };

  const handleRunReport = async (report: Report) => {
    toast({ title: "Report Execution Started", description: "Generating report..." });
    
    try {
      const result = await reportService.executeReport(report.id);
      setSelectedReport(report);
      setReportData(result);
      setViewDialogOpen(true);
      toast({ title: "Report Generated", description: `${result.metadata.totalRows} rows processed` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to execute report", variant: "destructive" });
    }
  };

  const handleWebhookConfig = (report: Report) => {
    setSelectedReport(report);
    setWebhookModalOpen(true);
  };

  const handleSlackConfig = (report: Report) => {
    setSelectedReport(report);
    setSlackModalOpen(true);
  };

  const handleSaveAsTemplate = async (report: Report) => {
    try {
      await reportTemplateService.saveAsTemplate(
        {
          name: report.name,
          description: report.description,
          dataSource: 'identities',
          fields: ['id', 'email', 'status'],
          filters: { operator: 'AND', conditions: [] },
          tags: report.tags,
        },
        {
          name: `${report.name} Template`,
          category: 'Custom',
          tags: report.tags,
        }
      );
      toast({ title: "Template Saved", description: "Report saved as reusable template" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save template", variant: "destructive" });
    }
  };

  const handleCloneReport = (report: Report) => {
    setSelectedReport(report);
    setCloneModalOpen(true);
  };

  const handleViewHistory = (report: Report) => {
    setSelectedReport(report);
    setVersionHistoryOpen(true);
  };

  const handleCompareReports = () => {
    setComparisonModalOpen(true);
  };

  const handleManagePermissions = (report: Report) => {
    setSelectedReport(report);
    setPermissionsModalOpen(true);
  };

  const handleManageSubscriptions = (report: Report) => {
    setSelectedReport(report);
    setSubscriptionModalOpen(true);
  };

  const handleViewExecutionHistory = (report: Report) => {
    setSelectedReport(report);
    setExecutionHistoryOpen(true);
  };

  const confirmDelete = () => {
    if (selectedReport) {
      toast({
        title: "Report Deleted",
        description: `${selectedReport.name} has been permanently deleted.`,
        variant: "destructive",
      });
    }
  };

  const handleDownload = (format: string, options: any) => {
    if (selectedReport) {
      toast({
        title: "Download Started",
        description: `${selectedReport.name} is being prepared in ${format.toUpperCase()} format.`,
      });
    }
  };

  const handleShare = (recipients: string[], message: string) => {
    if (selectedReport) {
      toast({
        title: "Report Shared",
        description: `${selectedReport.name} has been sent to ${recipients.length} recipient(s).`,
      });
    }
  };

  const handleSchedule = (config: any) => {
    toast({
      title: "Report Scheduled",
      description: `Report will be generated ${config.frequency} and sent to specified recipients.`,
    });
  };

  const handleEditReport = (report: Report) => {
    toast({
      title: "Opening Report Builder",
      description: `Editing ${report.name} in Report Builder`,
    });
  };

  const handleDeleteReport = (report: Report) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };

  const handleDownloadReport = (report: Report) => {
    setSelectedReport(report);
    setDownloadDialogOpen(true);
  };

  const handleShareReport = (report: Report) => {
    setSelectedReport(report);
    setShareDialogOpen(true);
  };

  const handleScheduleReport = (report: Report) => {
    setSelectedReport(report);
    setScheduleDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Favorites Section */}
      {favoriteReports.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              Favorites
              <Badge variant="secondary" className="text-xs">{favoriteReports.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteReports.map((report) => renderReportCard(report, true))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category-grouped sections */}
      {Object.entries(groupedReports).map(([category, categoryReports]) => {
        const config = CATEGORY_CONFIG[category] || { icon: FileText, label: category };
        const CategoryIcon = config.icon;
        const isExpanded = expandedCategories[category] !== false;

        return (
          <Collapsible key={category} open={isExpanded} onOpenChange={() => toggleCategory(category)}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="h-4 w-4 text-primary" />
                      {config.label}
                      <Badge variant="secondary" className="text-xs">{categoryReports.length}</Badge>
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryReports.map((report) => renderReportCard(report, false))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No reports found matching your criteria</p>
        </div>
      )}

      <StandardPagination {...paginationProps} pageSizeOptions={[9, 18, 27]} />

      {/* Dialogs */}
      <ReportViewDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} report={selectedReport} onEdit={() => handleEditReport(selectedReport!)} onDownload={() => handleDownloadReport(selectedReport!)} onShare={() => handleShareReport(selectedReport!)} />
      <ReportDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} reportName={selectedReport?.name || ''} onConfirm={confirmDelete} />
      <ReportDownloadDialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen} reportName={selectedReport?.name || ''} onDownload={handleDownload} />
      <ReportShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} reportName={selectedReport?.name || ''} onShare={handleShare} />
      <ScheduleReportDialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen} reportId={selectedReport?.id} onSchedule={handleSchedule} />
      <WebhookConfigModal open={webhookModalOpen} onOpenChange={setWebhookModalOpen} onSave={() => toast({ title: "Webhook Configured", description: "Webhook settings saved successfully" })} />
      <SlackIntegrationModal open={slackModalOpen} onOpenChange={setSlackModalOpen} onSave={() => toast({ title: "Slack Integration Configured", description: "Report will be sent to Slack" })} />
      <ReportVersionHistoryModal open={versionHistoryOpen} onOpenChange={setVersionHistoryOpen} reportId={selectedReport?.id || ''} />
      <ReportCloneModal open={cloneModalOpen} onOpenChange={setCloneModalOpen} reportName={selectedReport?.name || ''} onClone={(clonedReport) => toast({ title: "Report Cloned", description: `Created ${clonedReport.name}` })} />
      <ReportComparisonModal open={comparisonModalOpen} onOpenChange={setComparisonModalOpen} />
      <ReportPermissionsModal open={permissionsModalOpen} onOpenChange={setPermissionsModalOpen} onSave={() => toast({ title: "Permissions Updated", description: "Access permissions saved" })} />
      <ReportSubscriptionModal open={subscriptionModalOpen} onOpenChange={setSubscriptionModalOpen} onSave={(subscriptions) => toast({ title: "Subscriptions Updated", description: `${subscriptions.length} users subscribed` })} />
      <ReportExecutionHistoryModal open={executionHistoryOpen} onOpenChange={setExecutionHistoryOpen} scheduleId={selectedReport?.id || ''} />
      <ReportDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        report={selectedReport}
        onRun={() => selectedReport && handleRunReport(selectedReport)}
        onDownload={() => selectedReport && handleDownloadReport(selectedReport)}
        onSchedule={() => selectedReport && handleScheduleReport(selectedReport)}
        onShare={() => selectedReport && handleShareReport(selectedReport)}
      />
    </div>
  );

  function renderReportCard(report: Report, isFavoriteSection: boolean) {
    const isFav = favorites.includes(report.id);
    return (
      <Card key={`${isFavoriteSection ? 'fav-' : ''}${report.id}`} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedReport(report); setDetailDrawerOpen(true); }}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                <report.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium truncate">{report.name}</CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFavorite(report.id)}>
                {isFav ? <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> : <StarOff className="h-3.5 w-3.5 text-muted-foreground" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowMoreActions(showMoreActions === report.id ? null : report.id)}>
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <p className="text-xs text-muted-foreground line-clamp-2">{report.description}</p>
          <div className="flex flex-wrap gap-1">
            {report.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last: {report.lastGenerated}</span>
            <Badge className={cn(getStatusBadgeClass(report.status), "border text-xs")}>{report.status}</Badge>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => handleViewReport(report)}>
              <Eye className="h-3 w-3 mr-1" />View
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => handleRunReport(report)}>
              <Download className="h-3 w-3 mr-1" />Run
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleScheduleReport(report)}>
              <Calendar className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
};
