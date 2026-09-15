import { Menu, ChevronDown, Settings, X, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import FilterTabs from './FilterTabs';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface HeaderProps {
  onFilterChange: (filters: {
    roomType: string;
    area: string;
    priceRange: string;
  }) => void;
  onViewModeChange: (mode: 'admin' | 'user') => void;
  user: any;
  onLogout: () => void;
}

const Header = ({ onFilterChange, onViewModeChange, user, onLogout }: HeaderProps) => {
  const navigate = useNavigate();
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // Editable modal content state
  const [editingModal, setEditingModal] = useState<null | 'terms' | 'privacy' | 'contact'>(null);
  const [editValue, setEditValue] = useState('');

  // Default content
  const defaultTerms = `Welcome to Homerentin. By using our service, you agree to these terms and conditions.

1. Service Description
Homerentin provides a platform for finding and booking student accommodation near educational institutions.

2. User Responsibilities
Users are responsible for providing accurate information and maintaining the security of their accounts.

3. Booking and Payment
All bookings are subject to availability and payment terms as specified by individual landlords.

4. Cancellation Policy
Cancellation policies vary by landlord and are clearly stated in each room listing.

5. Privacy and Data Protection
We are committed to protecting your privacy and personal information as outlined in our Privacy Policy.

6. Limitation of Liability
Homerentin acts as a platform and is not responsible for disputes between users and landlords.

7. Changes to Terms
We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of updated terms.`;
  const defaultPrivacy = `This Privacy Policy explains how Homerentin collects, uses, and protects your personal information.

1. Information We Collect
We collect information you provide directly to us, such as when you create an account, search for rooms, or contact landlords.

2. How We Use Your Information
We use your information to provide our services, improve user experience, and communicate with you about your account.

3. Information Sharing
We do not sell your personal information. We may share information with landlords when you express interest in their properties.

4. Data Security
We implement appropriate security measures to protect your personal information from unauthorized access or disclosure.

5. Your Rights
You have the right to access, update, or delete your personal information. Contact us to exercise these rights.

6. Cookies and Tracking
We use cookies and similar technologies to improve your browsing experience and analyze site usage.

7. Contact Us
If you have questions about this Privacy Policy, please contact us through the contact form.`;
  const defaultContact = `Get in Touch
Have questions or need assistance? We're here to help!

Email: support.homerentin@gmail.com
Phone/WhatsApp: +254 756 600 218
Telegram: @homerentin
LinkedIn: support@homerentin.com
Address: Kisii, Kenya

We typically respond within 24 hours during business days.`;

  // Get current content
  const termsContent = getEditableContent('termsContent', defaultTerms);
  const privacyContent = getEditableContent('privacyContent', defaultPrivacy);
  const contactContent = getEditableContent('contactContent', defaultContact);

  // Save handler
  const handleSaveEdit = () => {
    if (editingModal === 'terms') setEditableContent('termsContent', editValue);
    if (editingModal === 'privacy') setEditableContent('privacyContent', editValue);
    if (editingModal === 'contact') setEditableContent('contactContent', editValue);
    setEditingModal(null);
  };

  // Open edit modal
  const handleEditModal = (type: 'terms' | 'privacy' | 'contact', current: string) => {
    setEditingModal(type);
    setEditValue(current);
  };
  // Persisted filter state
  const [filters, setFilters] = useState({
    roomType: 'all',
    area: 'all',
    priceRange: 'all',
  });

  // Check if current user is admin
  const isAdmin = () => {
    return user?.type === 'admin';
  };

  const handleAdminDashboard = () => {
    onViewModeChange('admin');
    navigate('/admin');
  };

  // Handler to update filters and propagate change
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <header className="bg-kisu-green text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Left side - Menu button */}
      <div className="flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-1 mt-2" aria-label="Open filter menu">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-1/2 p-0 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Filter Rooms</h2>
            </div>
            <div className="p-4 flex-1">
              <FilterTabs filters={filters} onFilterChange={handleFilterChange} />
            </div>
            
            {/* Logout Button - at the bottom of sidebar */}
            <div className="border-t p-4">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-2 px-3 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Logo next to hamburger menu, fixed position */}
      <div className="flex items-center ml-3">
        <div className="w-36 h-12 flex items-center justify-center overflow-hidden">
          <img
            src="/newlogo-homerentinn.png"
            alt="Homerentin Logo"
            className="max-h-full max-w-full object-contain"
            style={{ background: 'transparent' }}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Admin Dashboard Button */}
        {isAdmin() && (
          <Button
            onClick={handleAdminDashboard}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Settings className="w-4 h-4 mr-1" />
            Admin
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-2 hover:bg-kisu-green-dark rounded-lg transition-colors" aria-label="Open menu">
              <ChevronDown className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white">
            <DropdownMenuItem className="text-sm font-medium text-gray-700 cursor-default">
              About us
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-sm text-gray-600 cursor-pointer"
              onClick={() => setShowTerms(true)}
            >
              Terms & Conditions
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-sm text-gray-600 cursor-pointer"
              onClick={() => setShowPrivacy(true)}
            >
              Privacy Policy
            </DropdownMenuItem>
            <DropdownMenuItem className="text-sm font-medium text-gray-700 cursor-default mt-2">
              Support
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-sm text-gray-600 cursor-pointer"
              onClick={() => setShowContact(true)}
            >
              Contact us
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Terms & Conditions Modal */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-kisu-green mb-4">
              Terms & Conditions
            </DialogTitle>
          </DialogHeader>
          {editingModal === 'terms' ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="edit-terms" className="font-semibold text-sm text-gray-700 mb-1">Edit Terms & Conditions</label>
              <textarea
                id="edit-terms"
                className="w-full min-h-[300px] border rounded p-2 text-black"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                title="Edit Terms & Conditions"
                placeholder="Enter Terms & Conditions..."
              />
              <div className="flex gap-2 justify-end">
                <Button onClick={() => setEditingModal(null)} variant="outline">Cancel</Button>
                <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 text-white">Save</Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none whitespace-pre-line text-black">
              {termsContent}
            </div>
          )}
          <DialogFooter>
            {isAdmin() && editingModal !== 'terms' && (
              <Button onClick={() => handleEditModal('terms', termsContent)} variant="outline">Edit</Button>
            )}
            <Button onClick={() => setShowTerms(false)} aria-label="Close terms and conditions">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-kisu-green mb-4">
              Privacy Policy
            </DialogTitle>
          </DialogHeader>
          {editingModal === 'privacy' ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="edit-privacy" className="font-semibold text-sm text-gray-700 mb-1">Edit Privacy Policy</label>
              <textarea
                id="edit-privacy"
                className="w-full min-h-[300px] border rounded p-2 text-black"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                title="Edit Privacy Policy"
                placeholder="Enter Privacy Policy..."
              />
              <div className="flex gap-2 justify-end">
                <Button onClick={() => setEditingModal(null)} variant="outline">Cancel</Button>
                <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 text-white">Save</Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none whitespace-pre-line text-black">
              {privacyContent}
            </div>
          )}
          <DialogFooter>
            {isAdmin() && editingModal !== 'privacy' && (
              <Button onClick={() => handleEditModal('privacy', privacyContent)} variant="outline">Edit</Button>
            )}
            <Button onClick={() => setShowPrivacy(false)} aria-label="Close privacy policy">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Us Modal */}
      <Dialog open={showContact} onOpenChange={setShowContact}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-kisu-green mb-4">
              Contact Us
            </DialogTitle>
          </DialogHeader>
          {editingModal === 'contact' ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="edit-contact" className="font-semibold text-sm text-gray-700 mb-1">Edit Contact Information</label>
              <textarea
                id="edit-contact"
                className="w-full min-h-[200px] border rounded p-2 text-black"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                title="Edit Contact Information"
                placeholder="Enter Contact Information..."
              />
              <div className="flex gap-2 justify-end">
                <Button onClick={() => setEditingModal(null)} variant="outline">Cancel</Button>
                <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 text-white">Save</Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none whitespace-pre-line text-black">
              {contactContent}
            </div>
          )}
          <DialogFooter>
            {isAdmin() && editingModal !== 'contact' && (
              <Button onClick={() => handleEditModal('contact', contactContent)} variant="outline">Edit</Button>
            )}
            <Button onClick={() => setShowContact(false)} aria-label="Close contact information">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Modal */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Confirm Logout</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Are you sure you want to log out?</p>
          <DialogFooter>
            <Button 
              onClick={() => setShowLogoutConfirm(false)} 
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

// Helper to get/set editable content in localStorage
const getEditableContent = (key: string, fallback: string) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    if (stored) return stored;
  }
  return fallback;
};

const setEditableContent = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

export default Header;
