
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Users, Building, UserCheck,
  FolderOpen, Edit, AppWindow, Trash2, Send, Clock, Activity
} from 'lucide-react';
import TileConfigModal from './TileConfigModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface AccessPortalTile {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  totalItems?: number;
  approvalRate?: string;
  ordersCount?: number;
  isActive?: boolean;
  onClick: () => void;
}

interface AccessPortalHomepageProps {
  onTileClick: (category: string) => void;
  isAdmin?: boolean;
}

const AccessPortalHomepage: React.FC<AccessPortalHomepageProps> = ({
  onTileClick,
  isAdmin = false
}) => {
  const [isConfigModalOpen, setIsConfigModalOpen] = React.useState(false);
  const [selectedTile, setSelectedTile] = React.useState<any>(null);
  const [isCreatingTile, setIsCreatingTile] = React.useState(false);
  const [tiles, setTiles] = React.useState<AccessPortalTile[]>([
    {
      id: 'full-catalog',
      title: 'Access the full catalog',
      description: 'Access the full entitlements catalog and search for the access of your dream. Several search types are available: structured, by keyword, by population.',
      icon: Plus,
      category: 'catalog',
      totalItems: 247,
      approvalRate: '94%',
      ordersCount: 1250,
      isActive: true,
      onClick: () => onTileClick('catalog')
    },
    {
      id: 'business-applications',
      title: 'Business Applications',
      description: 'Access to Business Applications. This will give you a list of all the business applications used at Identity Inc.',
      icon: AppWindow,
      category: 'applications',
      totalItems: 45,
      approvalRate: '92%',
      ordersCount: 890,
      isActive: true,
      onClick: () => onTileClick('applications')
    },
    {
      id: 'directories',
      title: 'Directories',
      description: 'Entitlements from LDAP Directories. You will find here the technical directories used by most of the business applications.',
      icon: Building,
      category: 'directories',
      totalItems: 89,
      approvalRate: '89%',
      ordersCount: 456,
      isActive: true,
      onClick: () => onTileClick('directories')
    },
    {
      id: 'oracle-applications',
      title: 'Oracle Applications',
      description: 'Access to Oracle Applications.',
      icon: Building,
      category: 'oracle',
      totalItems: 156,
      approvalRate: '87%',
      ordersCount: 623,
      isActive: true,
      onClick: () => onTileClick('oracle')
    },
    {
      id: 'peers-access',
      title: 'Peers Access',
      description: 'Search for access like my peers. This will suggest you entitlements that most of your peers already have.',
      icon: Users,
      category: 'peers',
      totalItems: 67,
      approvalRate: '96%',
      ordersCount: 234,
      isActive: true,
      onClick: () => onTileClick('peers')
    },
    {
      id: 'roles',
      title: 'Roles',
      description: 'Search for business roles. Business roles are reflecting your position, your activities or your projects.',
      icon: UserCheck,
      category: 'roles',
      totalItems: 34,
      approvalRate: '91%',
      ordersCount: 567,
      isActive: true,
      onClick: () => onTileClick('roles')
    },
    {
      id: 'shared-folders',
      title: 'Shared Folders',
      description: 'Access to Shared folders both traditional and cloud based.',
      icon: FolderOpen,
      category: 'shared-folders',
      totalItems: 123,
      approvalRate: '85%',
      ordersCount: 345,
      isActive: true,
      onClick: () => onTileClick('shared-folders')
    }
  ]);

  const [itemsPerPage, setItemsPerPage] = React.useState(8);
  const [currentPage, setCurrentPage] = React.useState(1);

  const activeTiles = tiles.filter(tile => tile.isActive);
  const paginatedTiles = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return activeTiles.slice(startIndex, endIndex);
  }, [activeTiles, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(activeTiles.length / itemsPerPage);

  const [activeTab, setActiveTab] = React.useState('request'); // for tab activation

  const handleEditTile = (tile: AccessPortalTile) => {
    setSelectedTile({
      id: tile.id,
      title: tile.title,
      description: tile.description,
      category: tile.category,
      icon: 'AppWindow', // Fixed: Use a string instead of trying to access .name property
      visibility: ['all-users'],
      isActive: tile.isActive || true
    });
    setIsCreatingTile(false);
    setIsConfigModalOpen(true);
  };

  const handleDeleteTile = (tileId: string) => {
    if (window.confirm('Are you sure you want to delete this tile? This action cannot be undone.')) {
      setTiles(tiles.filter(tile => tile.id !== tileId));
      console.log('Deleted tile:', tileId);
    }
  };

  const handleCreateNewTile = () => {
    setSelectedTile(null);
    setIsCreatingTile(true);
    setIsConfigModalOpen(true);
  };

  const handleSaveTileConfig = (config: any) => {
    if (isCreatingTile) {
      // Create new tile
      const newTile: AccessPortalTile = {
        id: config.id,
        title: config.title,
        description: config.description,
        icon: AppWindow, // Default icon for now
        category: config.category,
        totalItems: Math.floor(Math.random() * 200) + 10,
        approvalRate: `${Math.floor(Math.random() * 20) + 80}%`,
        ordersCount: Math.floor(Math.random() * 1000) + 100,
        isActive: config.isActive,
        onClick: () => onTileClick(config.category)
      };
      setTiles([...tiles, newTile]);
      console.log('Created new tile:', newTile);
    } else {
      // Update existing tile
      setTiles(tiles.map(tile =>
        tile.id === config.id
          ? { ...tile, title: config.title, description: config.description, isActive: config.isActive }
          : tile
      ));
      console.log('Updated tile:', config);
    }
  };

  const getPendingRequestsCount = () => {
    // Dummy count for now
    return 3;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Business Application Access Request
            </h1>
            <p className="text-gray-600 mt-1">
              Choose from the categories below to request access to applications, roles, and entitlements
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <Button
                onClick={handleCreateNewTile}
                className="bg-black hover:bg-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Tile
              </Button>
            )}
          </div>
        </div>

        {/* Main Tabs - ADD THIS SECTION */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="request" className="flex items-center gap-2 data-[state=active]:!text-black !text-gray-500">
              <Send className="h-4 w-4" />
              Request Access
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2 data-[state=active]:!text-black !text-gray-500">
              <Clock className="h-4 w-4" />
              My Requests
              {getPendingRequestsCount() > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {getPendingRequestsCount()}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:!text-black !text-gray-500">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="request">

            {/* Tiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedTiles.map((tile) => (
                <Card
                  key={tile.id}
                  className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group relative"
                  onClick={tile.onClick}
                >
                  {/* Action Icons - Only visible to admins */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTile(tile);
                        }}
                      >
                        <Edit className="h-3 w-3 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTile(tile.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-brand-teal/10 rounded-lg flex-shrink-0">
                        <tile.icon className="h-6 w-6 text-brand-teal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                          {tile.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {tile.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t text-xs">
                      <div>
                        <span className="text-gray-500">Total Items</span>
                        <div className="font-semibold">{tile.totalItems}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Orders</span>
                        <div className="font-semibold">{tile.ordersCount}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-gray-500">Approval Rate</span>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        {tile.approvalRate}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1"
                >
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                </select>
                <span>per page.</span>
              </div>

              <div className="text-sm text-gray-600">
                Total of Tiles: {activeTiles.length}
              </div>
            </div>

          </TabsContent>

          <TabsContent value="requests">
            {/* My Requests - DUMMY CONTENT */}
            <Card>
              <CardHeader>
                <CardTitle>My Access Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your access requests will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            {/* Analytics - DUMMY CONTENT */}
            <Card>
              <CardHeader>
                <CardTitle>Access Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>


      </div>

      {/* Tile Configuration Modal */}
      <TileConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        tile={selectedTile}
        onSave={handleSaveTileConfig}
        isCreating={isCreatingTile}
      />
    </>
  );
};

export default AccessPortalHomepage;
