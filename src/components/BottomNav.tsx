import { Home, Search, Bookmark, User, Plus } from 'lucide-react';
import { useState } from 'react';

interface BottomNavProps {
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ onTabChange }: BottomNavProps) => {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { id: 'add-rooms', icon: Plus, label: 'Add Rooms' },
    { id: 'account', icon: User, label: 'Account' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              className={`relative flex-1 py-2.5 px-2 flex flex-col items-center gap-0.5 transition-colors ${
                isActive ? 'text-kisu-green' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 h-0.5 w-10 bg-kisu-green rounded-full" aria-hidden="true" />
              )}
              <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
