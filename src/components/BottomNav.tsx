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
    </nav>
  );
};

export default BottomNav;
