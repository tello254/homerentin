import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, LogOut, Users, Search, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRooms } from '@/hooks/useSupabase';
import { roomsApi } from '@/lib/supabase';
import type { Room } from '@/lib/supabase';
import RoomEditModal from '@/components/RoomEditModal';
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  onLogout: () => void;
  onViewModeChange: (mode: 'admin' | 'user') => void;
}

const AdminDashboard = ({ onLogout, onViewModeChange }: AdminDashboardProps) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'title' | 'roomId' | 'landlordPhone'>('title');
  
  // Individual privacy states for each statistics card
  const [showTotalRooms, setShowTotalRooms] = useState(false);
  const [showVacantRooms, setShowVacantRooms] = useState(false);
  const [showOccupiedRooms, setShowOccupiedRooms] = useState(false);
  const [showVerifiedRooms, setShowVerifiedRooms] = useState(false);

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await roomsApi.getRooms();
      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Filter rooms by search query and type
  const filteredRooms = searchQuery.trim() 
    ? rooms.filter(room => {
        if (searchType === 'title') {
          return room.title.toLowerCase().includes(searchQuery.toLowerCase());
        } else if (searchType === 'roomId') {
          return room.id && room.id.toLowerCase().includes(searchQuery.toLowerCase());
        } else if (searchType === 'landlordPhone') {
          return room.landlord_phone && room.landlord_phone.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return false;
      })
    : rooms;

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsCreateMode(false);
    setIsEditModalOpen(true);
  };

  const handleCreateRoom = () => {
    setSelectedRoom(null);
    setIsCreateMode(true);
    setIsEditModalOpen(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const { error } = await roomsApi.deleteRoom(roomId);
      if (error) throw error;
      await fetchRooms(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete room:', err);
      alert('Failed to delete room');
    }
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedRoom(null);
    setIsCreateMode(false);
  };

  const handleRoomSaved = () => {
    fetchRooms(); // Refresh the list
    handleModalClose();
  };

  const handleViewAsUser = () => {
    onViewModeChange('user');
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vacant': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'bedsitter': return 'bg-purple-100 text-purple-800';
      case 'single': return 'bg-blue-100 text-blue-800';
      case 'apartment': return 'bg-indigo-100 text-indigo-800';
      case 'studio': return 'bg-pink-100 text-pink-800';
      case 'shared': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your room listings</p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleViewAsUser} variant="outline" className="border-gray-300">
                <Users className="w-4 h-4 mr-2" />
                View as User
              </Button>
              <Button onClick={handleCreateRoom} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Room
              </Button>
              <Button onClick={onLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative max-w-md flex gap-2 items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={
              searchType === 'title' ? 'Search rooms by title...' :
              searchType === 'roomId' ? 'Search by Room ID...' :
              'Search by Landlord Phone...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <select
            aria-label="Search type"
            value={searchType}
            onChange={e => setSearchType(e.target.value as 'title' | 'roomId' | 'landlordPhone')}
            className="border rounded px-2 py-1 text-sm bg-white"
            style={{ minWidth: 120 }}
          >
            <option value="title">Room Title</option>
            <option value="roomId">Room ID</option>
            <option value="landlordPhone">Landlord Phone</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {showTotalRooms ? rooms.length : 'XX'}
                  </div>
                  <div className="text-sm text-gray-600">Total Rooms</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTotalRooms(!showTotalRooms)}
                  className="p-1"
                >
                  {showTotalRooms ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {showVacantRooms ? rooms.filter(r => r.status === 'vacant').length : 'XX'}
                  </div>
                  <div className="text-sm text-gray-600">Vacant</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVacantRooms(!showVacantRooms)}
                  className="p-1"
                >
                  {showVacantRooms ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {showOccupiedRooms ? rooms.filter(r => r.status === 'occupied').length : 'XX'}
                  </div>
                  <div className="text-sm text-gray-600">Occupied</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOccupiedRooms(!showOccupiedRooms)}
                  className="p-1"
                >
                  {showOccupiedRooms ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {showVerifiedRooms ? rooms.filter(r => r.verification).length : 'XX'}
                  </div>
                  <div className="text-sm text-gray-600">Verified</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVerifiedRooms(!showVerifiedRooms)}
                  className="p-1"
                >
                  {showVerifiedRooms ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results Info */}
        {searchQuery.trim() && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Found {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card 
              key={room.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleEditRoom(room)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{room.title}</CardTitle>
                  <div className="flex gap-1">
                    <Badge className={getStatusColor(room.status)}>
                      {room.status}
                    </Badge>
                    <Badge className={getRoomTypeColor(room.room_type)}>
                      {room.room_type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold text-green-600">
                    KES {room.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Location:</span>
                  <span className="text-sm">{room.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Landlord:</span>
                  <span className="text-sm">{room.landlord_phone || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {room.verification && (
                    <Badge variant="secondary" className="bg-blue-500 text-white text-xs">
                      Verified
                    </Badge>
                  )}
                  {room.wifi && (
                    <Badge variant="outline" className="text-xs">WiFi</Badge>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    onClick={() => handleEditRoom(room)}
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteRoom(room.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredRooms.length === 0 && searchQuery.trim() && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-500">No rooms match your search for "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <RoomEditModal
        room={selectedRoom}
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        onSave={handleRoomSaved}
        isCreateMode={isCreateMode}
      />
    </div>
  );
};

export default AdminDashboard; 