import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Loader2, Check } from 'lucide-react';
import { reportDeliveryService } from '@/services/reportDeliveryService';
import { useToast } from "@/hooks/use-toast";

interface SlackIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (config: any) => void;
}

export const SlackIntegrationModal = ({ open, onOpenChange, onSave }: SlackIntegrationModalProps) => {
  const [channel, setChannel] = useState('');
  const [message, setMessage] = useState('');
  const [includeData, setIncludeData] = useState(true);
  const [mentions, setMentions] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    const testData = {
      reportName: 'Test Report',
      timestamp: new Date().toISOString(),
      summary: 'This is a test notification',
    };

    const result = await reportDeliveryService.deliverViaSlack(
      testData,
      channel,
      { message, includeData }
    );

    setTestResult(result.success);
    setTesting(false);

    toast({
      title: result.success ? "Test Message Sent" : "Test Failed",
      description: result.error || "Check your Slack channel",
      variant: result.success ? "default" : "destructive",
    });
  };

  const handleSave = () => {
    const config = {
      channel,
      message,
      includeData,
      mentions,
    };

    onSave?.(config);
    toast({
      title: "Slack Integration Configured",
      description: "Reports will be sent to this Slack channel",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Configure Slack Integration</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="channel">Slack Channel</Label>
            <Input
              id="channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="#reports or @username"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use # for channels, @ for direct messages
            </p>
          </div>

          <div>
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a custom message to include with the report"
              rows={3}
            />
          </div>

          <div>
            <Label>Notification Options</Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-data"
                  checked={includeData}
                  onCheckedChange={(checked) => setIncludeData(checked as boolean)}
                />
                <Label htmlFor="include-data" className="font-normal">
                  Include report data in message
                </Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="mentions">Mentions</Label>
            <Select onValueChange={(value) => setMentions(prev => [...prev, value])}>
              <SelectTrigger id="mentions">
                <SelectValue placeholder="Add mentions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="@channel">@channel (everyone in channel)</SelectItem>
                <SelectItem value="@here">@here (active members)</SelectItem>
              </SelectContent>
            </Select>
            {mentions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {mentions.map((mention, idx) => (
                  <Badge key={idx} variant="secondary">
                    {mention}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleTest} disabled={!channel || testing}>
              {testing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Test Message
            </Button>

            {testResult !== null && (
              <Badge variant={testResult ? "default" : "destructive"}>
                {testResult ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Sent
                  </>
                ) : (
                  <>
                    ✗ Failed
                  </>
                )}
              </Badge>
            )}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Ensure your Slack workspace is connected and the bot has access to the specified channel.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!channel}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
