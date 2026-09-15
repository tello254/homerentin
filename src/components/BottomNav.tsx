import { Home, Search, Bookmark, User, Plus, LogOut } from 'lucide-react';
import { useState } from 'react';

interface BottomNavProps {
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
}

const BottomNav = ({ onTabChange, onLogout }: BottomNavProps) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { id: 'add-rooms', icon: Plus, label: 'Add Rooms' },
    { id: 'account', icon: User, label: 'Account' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 transition-colors ${
                activeTab === item.id
                  ? 'text-kisu-green'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Logout Button - appears at bottom of nav */}
        <div className="border-t border-gray-200 p-2">
          <button
            onClick={handleLogoutClick}
            className="w-full py-2 px-3 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNav;
