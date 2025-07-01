import { useState } from 'react';
import Header from '../components/Header';
import NotificationBanner from '../components/NotificationBanner';
import RoomListings from '../components/RoomListings';
import BottomNav from '../components/BottomNav';
import AccountPage from '../components/AccountPage';
import { Search, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import type { Room } from '@/lib/supabase';

interface IndexProps {
  onLogout: () => void;
  onViewModeChange: (mode: 'admin' | 'user') => void;
  user: any;
}

const Index = ({ onLogout, onViewModeChange, user }: IndexProps) => {
  const [filters, setFilters] = useState({
    roomType: 'all',
    area: 'all',
    priceRange: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedRooms, setBookmarkedRooms] = useState<Room[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'search') {
      setShowSearchModal(true);
    } else {
      setShowSearchModal(false);
      setSearchQuery('');
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Close search modal after search
    setShowSearchModal(false);
  };

  const handleSearchButtonClick = () => {
    // Close search modal after search button is clicked
    setShowSearchModal(false);
  };

  const handleCloseSearchModal = () => {
    setShowSearchModal(false);
    setSearchQuery('');
  };

  const handleBookmark = (room: Room) => {
    // Check if room is already bookmarked
    const isAlreadyBookmarked = bookmarkedRooms.some(bookmarkedRoom => bookmarkedRoom.id === room.id);
    
    if (isAlreadyBookmarked) {
      // Remove from bookmarks
      setBookmarkedRooms(prev => prev.filter(bookmarkedRoom => bookmarkedRoom.id !== room.id));
    } else {
      // Add to bookmarks
      setBookmarkedRooms(prev => [...prev, room]);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <NotificationBanner />
            <RoomListings filters={filters} searchQuery={searchQuery} onBookmark={handleBookmark} bookmarkedRooms={bookmarkedRooms} />
          </>
        );
      case 'search':
        return (
          <>
            <NotificationBanner />
            <RoomListings filters={filters} searchQuery={searchQuery} onBookmark={handleBookmark} bookmarkedRooms={bookmarkedRooms} />
          </>
        );
      case 'bookmarks':
        return (
          <>
            <NotificationBanner />
          <div className="p-4 pb-20">
              <h2 className="text-xl font-bold mb-4">My Bookmarks</h2>
              {bookmarkedRooms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔖</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
                  <p className="text-gray-500">Start bookmarking rooms you like to see them here!</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    You have {bookmarkedRooms.length} bookmarked room{bookmarkedRooms.length !== 1 ? 's' : ''}
                  </p>
                  <RoomListings 
                    filters={filters} 
                    searchQuery={searchQuery} 
                    onBookmark={handleBookmark}
                    customRooms={bookmarkedRooms}
                    bookmarkedRooms={bookmarkedRooms}
                    showBookmarkButton={false}
                  />
                </div>
              )}
          </div>
          </>
        );
      case 'account':
        return (
          <>
            <NotificationBanner />
            <AccountPage onLogout={onLogout} />
          </>
        );
      default:
        return (
          <>
            <NotificationBanner />
            <RoomListings filters={filters} searchQuery={searchQuery} onBookmark={handleBookmark} bookmarkedRooms={bookmarkedRooms} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onFilterChange={handleFilterChange} 
        onViewModeChange={onViewModeChange}
        user={user}
      />
      {renderContent()}
      <BottomNav onTabChange={handleTabChange} />

      {/* Search Popup Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Search Rooms</h2>
              <button
                onClick={handleCloseSearchModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search room titles..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="pl-10"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCloseSearchModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSearchButtonClick}
                  className="flex-1 px-4 py-2 bg-kisu-green text-white rounded-lg hover:bg-kisu-green-dark transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
