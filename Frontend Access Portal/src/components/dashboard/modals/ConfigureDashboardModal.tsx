import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDashboardConfig } from '@/contexts/DashboardConfigContext';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from "next-intl";

interface ConfigureDashboardModalProps {
  open: boolean;
  onClose: () => void;
}

const SortableWidget: React.FC<{
  widget: any;
  onToggle: () => void;
}> = ({ widget, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 border rounded-lg bg-card"
    >
      <div className="flex items-center gap-3">
        <button
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>

        <Checkbox
          checked={widget.visible}
          onCheckedChange={onToggle}
        />

        <div>
          <div className="font-medium">{widget.name}</div>
          <div className="text-sm text-muted-foreground">
            Order: {widget.order}
          </div>
        </div>
      </div>

      {widget.visible ? (
        <Eye className="h-4 w-4 text-green-600" />
      ) : (
        <EyeOff className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
};

export const ConfigureDashboardModal: React.FC<ConfigureDashboardModalProps> = ({
  open,
  onClose,
}) => {
  const { config, updateConfig, updateWidget, reorderWidgets, resetConfig } =
    useDashboardConfig();

  const [localWidgets, setLocalWidgets] = useState(config.widgets);

  const t = useTranslations("dashboard.modals.dashboardConfig");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    const widgetIds = localWidgets.map((w) => w.id);
    reorderWidgets(widgetIds);

    localWidgets.forEach((widget) => {
      const original = config.widgets.find((w) => w.id === widget.id);
      if (original && original.visible !== widget.visible) {
        updateWidget(widget.id, { visible: widget.visible });
      }
    });

    toast.success('Dashboard configuration saved');
    onClose();
  };

  const handleReset = () => {
    resetConfig();
    setLocalWidgets(config.widgets);
    toast.success('Dashboard reset to defaults');
  };

  const toggleWidget = (widgetId: string) => {
    setLocalWidgets((prev) =>
      prev.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      )
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-4xl flex flex-col p-0 h-full"
      >
        <div className="flex flex-col h-full">

          {/* Fixed Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b">
            <SheetHeader>
              <SheetTitle>{t("title")}</SheetTitle>

              <SheetDescription>
                {t("description")}
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 min-h-0 px-6 py-6 overflow-hidden">
            <ScrollArea className="h-full pr-4">

              <Tabs defaultValue="widgets" className="w-full">

                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="widgets">
                    {t("tabs.widgets")}
                  </TabsTrigger>

                  <TabsTrigger value="layout">
                    {t("tabs.layout")}
                  </TabsTrigger>

                  <TabsTrigger value="preferences">
                    {t("tabs.preferences")}
                  </TabsTrigger>
                </TabsList>

                {/* Widgets Tab */}
                <TabsContent value="widgets" className="space-y-4 mt-6">

                  <div>
                    <Label>{t("widgets.title")}</Label>

                    <p className="text-sm text-muted-foreground">
                      {t("widgets.description")}
                    </p>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={localWidgets.map((w) => w.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {localWidgets.map((widget) => (
                          <SortableWidget
                            key={widget.id}
                            widget={widget}
                            onToggle={() => toggleWidget(widget.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                </TabsContent>

                {/* Layout Tab */}
                <TabsContent value="layout" className="space-y-6 mt-6">

                  <div>
                    <Label>{t("layout.dashboardLayout")}</Label>

                    <Select
                      value={config.layoutTemplate}
                      onValueChange={(value: any) =>
                        updateConfig({ layoutTemplate: value })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="grid">
                          {t("layout.grid")}
                        </SelectItem>

                        <SelectItem value="stack">
                          {t("layout.stack")}
                        </SelectItem>

                        <SelectItem value="fluid">
                          {t("layout.fluid")}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                  </div>

                  <Separator />

                  <div>

                    <Label>{t("layout.defaultDateRange")}</Label>

                    <Select
                      value={config.defaultDateRange}
                      onValueChange={(value: any) =>
                        updateConfig({ defaultDateRange: value })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="today">
                          {t("dateRange.today")}
                        </SelectItem>

                        <SelectItem value="7days">
                          {t("dateRange.last7")}
                        </SelectItem>

                        <SelectItem value="30days">
                          {t("dateRange.last30")}
                        </SelectItem>

                        <SelectItem value="90days">
                          {t("dateRange.last90")}
                        </SelectItem>

                        <SelectItem value="ytd">
                          {t("dateRange.ytd")}
                        </SelectItem>
                      </SelectContent>

                    </Select>

                  </div>

                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-6 mt-6">

                  <div className="flex items-center justify-between">

                    <div>
                      <Label>{t("preferences.autoRefresh")}</Label>

                      <p className="text-sm text-muted-foreground">
                        {t("preferences.autoRefreshDescription")}
                      </p>
                    </div>

                    <Select
                      value={config.refreshInterval.toString()}
                      onValueChange={(value) =>
                        updateConfig({ refreshInterval: parseInt(value) })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="0">
                          {t("refresh.never")}
                        </SelectItem>

                        <SelectItem value="60">
                          {t("refresh.oneMinute")}
                        </SelectItem>

                        <SelectItem value="300">
                          {t("refresh.fiveMinutes")}
                        </SelectItem>

                        <SelectItem value="600">
                          {t("refresh.tenMinutes")}
                        </SelectItem>

                        <SelectItem value="1800">
                          {t("refresh.thirtyMinutes")}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t("preferences.showQuickActions")}</Label>
                    </div>

                    <Switch
                      checked={config.showQuickActions}
                      onCheckedChange={(checked) =>
                        updateConfig({ showQuickActions: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t("preferences.enableAnimations")}</Label>
                    </div>

                    <Switch
                      checked={config.enableAnimations}
                      onCheckedChange={(checked) =>
                        updateConfig({ enableAnimations: checked })
                      }
                    />
                  </div>

                </TabsContent>

              </Tabs>

            </ScrollArea>
          </div>

          {/* Sticky Footer */}
          <div className="flex-shrink-0 border-t px-6 py-4 flex justify-end gap-2">

            <Button variant="outline" onClick={handleReset}>
              {t("actions.reset")}
            </Button>

            <Button variant="outline" onClick={onClose}>
              {t("actions.cancel")}
            </Button>

            <Button onClick={handleSave}>
              {t("actions.save")}
            </Button>

          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};