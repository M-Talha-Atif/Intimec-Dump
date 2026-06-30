"use client"
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Settings, 
  Database, 
  Shield, 
  Activity, 
  RefreshCw, 
  Edit, 
  Trash2, 
  Plus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Users,
  Clock
} from 'lucide-react';

interface SearchIndexEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  path: string;
  keywords: string[];
  aliases: string[];
  weight: number;
  visible: boolean;
  roleRequired?: string[];
  lastUpdated: string;
}

const mockSearchIndex: SearchIndexEntry[] = [
  {
    id: 'settings-email',
    title: 'Email Server Configuration',
    description: 'Configure SMTP settings and email templates',
    category: 'Settings',
    path: '/',
    keywords: ['email', 'smtp', 'notifications'],
    aliases: ['mail server', 'email settings'],
    weight: 10,
    visible: true,
    roleRequired: ['admin'],
    lastUpdated: '2024-01-15'
  },
  {
    id: 'identities-human',
    title: 'Human Identities',
    description: 'Manage employee identities',
    category: 'Users',
    path: '/identities/human',
    keywords: ['users', 'employees', 'people'],
    aliases: ['staff', 'workers', 'personnel'],
    weight: 10,
    visible: true,
    lastUpdated: '2024-01-14'
  },
  {
    id: 'apps-list',
    title: 'Applications',
    description: 'Manage connected applications',
    category: 'Applications',
    path: '/applications',
    keywords: ['applications', 'apps', 'systems'],
    aliases: ['software', 'platforms'],
    weight: 9,
    visible: true,
    lastUpdated: '2024-01-13'
  }
];

const mockSearchStats = {
  totalSearches: 1247,
  topSearches: [
    { query: 'user management', count: 156 },
    { query: 'access review', count: 143 },
    { query: 'email settings', count: 98 },
    { query: 'applications', count: 87 },
    { query: 'workflows', count: 72 }
  ],
  noResultsQueries: [
    { query: 'password policy', count: 23 },
    { query: 'backup settings', count: 18 },
    { query: 'api keys', count: 12 }
  ]
};

const SearchManagement = () => {
  const [searchIndex, setSearchIndex] = useState<SearchIndexEntry[]>(mockSearchIndex);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<SearchIndexEntry | null>(null);
  const [globalSearchEnabled, setGlobalSearchEnabled] = useState(true);
  const [typoTolerance, setTypoTolerance] = useState(true);
  const [semanticSearch, setSemanticSearch] = useState(false);
  const [updateInterval, setUpdateInterval] = useState('24');
  const [isReindexing, setIsReindexing] = useState(false);
  const { toast } = useToast();

  const handleEditEntry = (entry: SearchIndexEntry) => {
    setCurrentEntry({ ...entry });
    setIsEditModalOpen(true);
  };

  const handleSaveEntry = () => {
    if (!currentEntry) return;

    setSearchIndex(prev => 
      prev.map(item => 
        item.id === currentEntry.id ? currentEntry : item
      )
    );

    setIsEditModalOpen(false);
    setCurrentEntry(null);
    toast({
      description: "Search index entry updated successfully",
      duration: 3000,
    });
  };

  const handleToggleVisibility = (id: string) => {
    setSearchIndex(prev =>
      prev.map(item =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
    toast({
      description: "Entry visibility updated",
      duration: 3000,
    });
  };

  const handleReindex = async (partial = false) => {
    setIsReindexing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        description: `${partial ? 'Partial' : 'Full'} reindex completed successfully`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Reindex failed",
        duration: 3000,
      });
    } finally {
      setIsReindexing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Search className="h-6 w-6 text-brand-teal" />
        <h2 className="text-2xl font-bold">Search Management</h2>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="index" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Index Manager</span>
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Access Control</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Debug</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Search Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable Global Search</Label>
                  <p className="text-sm text-gray-600">Allow users to search across the entire platform</p>
                </div>
                <Switch
                  checked={globalSearchEnabled}
                  onCheckedChange={setGlobalSearchEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Typo Tolerance</Label>
                  <p className="text-sm text-gray-600">Allow fuzzy matching for misspelled queries</p>
                </div>
                <Switch
                  checked={typoTolerance}
                  onCheckedChange={setTypoTolerance}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Semantic Search</Label>
                  <p className="text-sm text-gray-600">Enable AI-powered contextual search</p>
                </div>
                <Switch
                  checked={semanticSearch}
                  onCheckedChange={setSemanticSearch}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="updateInterval">Index Update Interval (hours)</Label>
                <Select value={updateInterval} onValueChange={setUpdateInterval}>
                  <SelectTrigger id="updateInterval" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Every hour</SelectItem>
                    <SelectItem value="6">Every 6 hours</SelectItem>
                    <SelectItem value="24">Daily</SelectItem>
                    <SelectItem value="168">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full sm:w-auto">
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="index" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Search Index Manager</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchIndex.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.title}</div>
                          <div className="text-sm text-gray-500">{entry.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.category}</Badge>
                      </TableCell>
                      <TableCell>{entry.weight}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleVisibility(entry.id)}
                        >
                          {entry.visible ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>{entry.lastUpdated}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Configure role-based visibility for search results. Sensitive features can be hidden from non-privileged users.
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Default Role Access</Label>
                    <Select defaultValue="user">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Standard User</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="superadmin">Super Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Restrict Admin Features</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Search Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-brand-teal">{mockSearchStats.totalSearches}</div>
                    <div className="text-sm text-gray-600">Total Searches (30 days)</div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Top Search Queries</h4>
                    <div className="space-y-2">
                      {mockSearchStats.topSearches.map((search, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{search.query}</span>
                          <Badge variant="secondary">{search.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>No Results Queries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockSearchStats.noResultsQueries.map((query, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-red-600">{query.query}</span>
                      <Badge variant="destructive">{query.count}</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Add Missing Entries
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="debug" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reindex & Debug Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleReindex(false)}
                  disabled={isReindexing}
                  className="w-full"
                >
                  {isReindexing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Reindexing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Full Reindex
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleReindex(true)}
                  disabled={isReindexing}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Partial Reindex
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Test Search Query</Label>
                <div className="flex space-x-2">
                  <Input placeholder="Enter test query..." />
                  <Button variant="outline">
                    Test Search
                  </Button>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Search index is healthy. Last update: {new Date().toLocaleString()}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Entry Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Search Index Entry</DialogTitle>
          </DialogHeader>
          
          {currentEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={currentEntry.title}
                    onChange={(e) => setCurrentEntry({
                      ...currentEntry,
                      title: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={currentEntry.category}
                    onValueChange={(value) => setCurrentEntry({
                      ...currentEntry,
                      category: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Settings">Settings</SelectItem>
                      <SelectItem value="Users">Users</SelectItem>
                      <SelectItem value="Applications">Applications</SelectItem>
                      <SelectItem value="Entitlements">Entitlements</SelectItem>
                      <SelectItem value="Reports">Reports</SelectItem>
                      <SelectItem value="Workflows">Workflows</SelectItem>
                      <SelectItem value="Actions">Actions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={currentEntry.description}
                  onChange={(e) => setCurrentEntry({
                    ...currentEntry,
                    description: e.target.value
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Keywords (comma-separated)</Label>
                  <Input
                    value={currentEntry.keywords.join(', ')}
                    onChange={(e) => setCurrentEntry({
                      ...currentEntry,
                      keywords: e.target.value.split(',').map(k => k.trim())
                    })}
                  />
                </div>
                <div>
                  <Label>Weight (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={currentEntry.weight}
                    onChange={(e) => setCurrentEntry({
                      ...currentEntry,
                      weight: parseInt(e.target.value) || 1
                    })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEntry}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchManagement;
