"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Bot, Sparkles, Loader } from "lucide-react";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import { useMappingContext } from "./context/MappingContext";
import {
  AISuggestion,
  generateMockSuggestions,
} from "./data/aiSuggestionsData";
import { getConfidenceBadge } from "./utils/aiAssistantUtils";

export const AIMappingAssistant = () => {
  const { identityType, sources, handleApplyAISuggestions } =
    useMappingContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  // Add error handling for AI Assistant context
  let setIsAssistantOpen: ((open: boolean) => void) | null = null;

  try {
    const aiContext = useAIAssistant();
    setIsAssistantOpen = aiContext.setIsAssistantOpen;
  } catch (error) {
    console.error("AI Assistant context not available:", error);
  }

  const generateSuggestions = async () => {
    console.log("Generating AI suggestions for:", identityType, sources);
    setIsGenerating(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockSuggestions = generateMockSuggestions(
      sources[0]?.name || "Active Directory"
    );

    console.log("Generated suggestions:", mockSuggestions);
    setSuggestions(mockSuggestions);
    setSelectedSuggestions(mockSuggestions.map((s) => s.id));
    setIsGenerating(false);
  };

  const handleOpenAIAssistant = () => {
    console.log("Opening AI Assistant");
    if (setIsAssistantOpen) {
      setIsAssistantOpen(true);
      setIsModalOpen(false);
    } else {
      console.error("AI Assistant context not available");
      alert("AI Assistant is not available. Please check the configuration.");
    }
  };

  const handleApplySelected = () => {
    console.log("Applying selected suggestions:", selectedSuggestions);
    const selectedMappings = suggestions.filter((s) =>
      selectedSuggestions.includes(s.id)
    );
    handleApplyAISuggestions(selectedMappings);
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    console.log("Opening AI Mapping Assistant modal");
    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleOpenModal}
        className="flex items-center space-x-2"
        variant="outline"
      >
        <Bot className="h-4 w-4" />
        <span>AI Mapping Assistant</span>
        <Sparkles className="h-3 w-3" />
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary" />
              <span>AI Mapping Assistant</span>
            </DialogTitle>
            <DialogDescription>
              Generate intelligent attribute mappings for {identityType}{" "}
              identities using AI analysis
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {!suggestions.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Generate Mapping Suggestions</CardTitle>
                  <CardDescription>
                    AI will analyze your source systems and suggest optimal
                    attribute mappings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">
                        Source Systems to Analyze:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {sources.map((source, index) => (
                          <Badge key={index} variant="outline">
                            {source.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Target Schema:</h4>
                      <Badge className="bg-blue-100 text-blue-800">
                        {identityType} Identity Schema
                      </Badge>
                    </div>
                    <Button
                      onClick={generateSuggestions}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing Sources & Generating Suggestions...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate AI Suggestions
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    AI-Generated Mapping Suggestions
                  </h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleOpenAIAssistant}>
                      <Bot className="h-4 w-4 mr-2" />
                      Chat with AI
                    </Button>
                    <Button
                      onClick={handleApplySelected}
                      disabled={selectedSuggestions.length === 0}
                    >
                      Apply {selectedSuggestions.length} Selected
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Source Attribute</TableHead>
                        <TableHead>Target Attribute</TableHead>
                        <TableHead>Transformation</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>AI Reasoning</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suggestions.map((suggestion) => (
                        <TableRow key={suggestion.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedSuggestions.includes(
                                suggestion.id
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedSuggestions([
                                    ...selectedSuggestions,
                                    suggestion.id,
                                  ]);
                                } else {
                                  setSelectedSuggestions(
                                    selectedSuggestions.filter(
                                      (id) => id !== suggestion.id
                                    )
                                  );
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">
                              {suggestion.sourceAttribute}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {suggestion.targetAttribute}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-purple-600"
                            >
                              {suggestion.transformation}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getConfidenceBadge(suggestion.confidence)}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <span className="text-sm text-muted-foreground">
                              {suggestion.reasoning}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {suggestion.source}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{suggestions.length} suggestions generated</span>
                  <Button variant="ghost" onClick={() => setSuggestions([])}>
                    Generate New Suggestions
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
