import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import NotificationBanner from '../components/NotificationBanner';
import RoomListings from '../components/RoomListings';
import BottomNav from '../components/BottomNav';
import AccountPage from '../components/AccountPage';
import { Search, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import type { Room } from '@/lib/supabase';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, usePageMeta } from '@/components/Seo';
import RoomEditModal from '../components/RoomEditModal';
import { Dialog as UIDialog, DialogContent as UIDialogContent, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import AddRoom from './AddRoom';
// Utility to get logged-in user's phone
function getAccountPhone() {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return '';
  try {
    const user = JSON.parse(userStr);
    return user.phone || user.phone_number || '';
  } catch {
    return '';
  }
}

function SignInPrompt({ title }: { title: string }) {
  return (
    <div className="px-4 py-16 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">You can browse rooms without an account. Sign in to save listings or add a property.</p>
      <Link to="/login" className="inline-block bg-kisu-green text-white px-4 py-2 rounded-lg font-medium">
        Sign in
      </Link>
    </div>
  );
}

interface IndexProps {
  onLogout: () => void;
  onViewModeChange: (mode: 'admin' | 'user') => void;
  user: any;
}

const Index = ({ onLogout, onViewModeChange, user }: IndexProps) => {
  usePageMeta({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: '/',
  });
  const [filters, setFilters] = useState({
    roomType: 'all',
    area: 'all',
    priceRange: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedRooms, setBookmarkedRooms] = useState<Room[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUserAddRoom, setShowUserAddRoom] = useState(false);
  const [userAddRoomLoading, setUserAddRoomLoading] = useState(false);
  const [userAddRoomSuccess, setUserAddRoomSuccess] = useState(false);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [userPhone, setUserPhone] = useState(getAccountPhone());
  const [phoneError, setPhoneError] = useState('');

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

  // Phone popup submit
  const handlePhoneSubmit = () => {
    // Simple Safaricom validation: starts with 07 and 10 digits
    if (!/^07\d{8}$/.test(userPhone)) {
      setPhoneError('Please enter a valid Safaricom number (e.g., 07XXXXXXXX)');
      return;
    }
    setPhoneError('');
    setShowPhonePopup(false);
    setShowUserAddRoom(true);
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

  // User add room submit handler — the room is already saved by RoomEditModal,
  // so only show the congratulatory overlay here (no second create!)
  const handleUserAddRoom = async (roomData: any) => {
    setUserAddRoomSuccess(true);
    setTimeout(() => {
      setShowUserAddRoom(false);
      setUserAddRoomSuccess(false);
      setUserPhone('');
    }, 3500);
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
        if (!user) {
          return <SignInPrompt title="Sign in to manage your account" />;
        }
        return (
          <>
            <NotificationBanner />
            <AccountPage onLogout={onLogout} />
          </>
        );
      case 'add-rooms':
        if (!user) {
          return <SignInPrompt title="Sign in to list a room" />;
        }
        return <AddRoom userPhone={userPhone} />;
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
        onLogout={onLogout}
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

      {/* User Add Room Modal */}
      {showUserAddRoom && (
        <RoomEditModal
          room={null}
          isOpen={showUserAddRoom}
          onClose={() => setShowUserAddRoom(false)}
          onSave={handleUserAddRoom}
          isCreateMode={true}
          hideVerifiedToggle={true}
          loading={userAddRoomLoading}
          success={userAddRoomSuccess}
          userMode={true}
          userPhone={userPhone}
        />
      )}

      {/* Congratulatory Note Overlay - always on top */}
      {userAddRoomSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto text-center shadow-lg">
            <h2 className="text-2xl font-bold mb-2 text-kisu-green">Thank you!</h2>
            <p className="text-gray-700 mb-2">Your property has been submitted for review.</p>
            <p className="text-gray-600">After review, your property will be uploaded. Good day!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
