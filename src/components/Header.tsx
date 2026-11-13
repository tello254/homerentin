import { Menu, ChevronDown, Settings, X, LogOut, LogIn, Mail, FileText, ShieldCheck, MessageCircle, Send, Linkedin, MapPin, Phone } from 'lucide-react';
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
  const [editingModal, setEditingModal] = useState<null | 'terms' | 'privacy'>(null);
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

  // Structured sections for the professional Terms & Privacy popups
  const termsSections = [
    { title: 'Service Description', body: 'Homerentin provides a platform for finding and booking student accommodation near educational institutions.' },
    { title: 'User Responsibilities', body: 'Users are responsible for providing accurate information and maintaining the security of their accounts.' },
    { title: 'Booking and Payment', body: 'All bookings are subject to availability and payment terms as specified by individual landlords.' },
    { title: 'Cancellation Policy', body: 'Cancellation policies vary by landlord and are clearly stated in each room listing.' },
    { title: 'Privacy and Data Protection', body: 'We are committed to protecting your privacy and personal information as outlined in our Privacy Policy.' },
    { title: 'Limitation of Liability', body: 'Homerentin acts as a platform and is not responsible for disputes between users and landlords.' },
    { title: 'Changes to Terms', body: 'We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of updated terms.' },
  ];

  const privacySections = [
    { title: 'Information We Collect', body: 'We collect information you provide directly to us, such as when you create an account, search for rooms, or contact landlords.' },
    { title: 'How We Use Your Information', body: 'We use your information to provide our services, improve user experience, and communicate with you about your account.' },
    { title: 'Information Sharing', body: 'We do not sell your personal information. We may share information with landlords when you express interest in their properties.' },
    { title: 'Data Security', body: 'We implement appropriate security measures to protect your personal information from unauthorized access or disclosure.' },
    { title: 'Your Rights', body: 'You have the right to access, update, or delete your personal information. Contact us to exercise these rights.' },
    { title: 'Cookies and Tracking', body: 'We use cookies and similar technologies to improve your browsing experience and analyze site usage.' },
    { title: 'Contact Us', body: 'If you have questions about this Privacy Policy, please contact us through the contact form.' },
  ];

  // Structured contact rows with their respective icons
  const contactRows = [
    { icon: Phone, label: 'Call us', value: '0703 209 997', href: 'tel:+254703209997', color: 'bg-green-100 text-green-600' },
    { icon: Phone, label: 'Call us', value: '0756 600 280', href: 'tel:+254756600280', color: 'bg-green-100 text-green-600' },
    { icon: MessageCircle, label: 'WhatsApp', value: '+254 182 544 098', href: 'https://wa.me/254182544098', color: 'bg-emerald-100 text-emerald-600' },
    { icon: Mail, label: 'Email', value: 'support.homerentin@gmail.com', href: 'mailto:support.homerentin@gmail.com', color: 'bg-blue-100 text-blue-600' },
    { icon: Send, label: 'Telegram', value: '@homerentin', href: 'https://t.me/homerentin', color: 'bg-sky-100 text-sky-500' },
    { icon: Linkedin, label: 'LinkedIn', value: 'support@homerentin.com', href: '', color: 'bg-indigo-100 text-indigo-600' },
    { icon: MapPin, label: 'Address', value: 'Kisii, Kenya', href: '', color: 'bg-orange-100 text-orange-600' },
  ];

  // Get current content — empty string means "not edited", so the styled default shows
  const termsContent = getEditableContent('termsContent', '');
  const privacyContent = getEditableContent('privacyContent', '');

  // Save handler
  const handleSaveEdit = () => {
    if (editingModal === 'terms') setEditableContent('termsContent', editValue);
    if (editingModal === 'privacy') setEditableContent('privacyContent', editValue);
    setEditingModal(null);
  };

  // Open edit modal
  const handleEditModal = (type: 'terms' | 'privacy', current: string) => {
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
            <button className="p-2 -ml-1 rounded-lg hover:bg-white/10 transition-colors" aria-label="Open filter menu">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 max-w-[85vw] p-0 flex flex-col">
            {/* Sidebar header with logo */}
            <div className="bg-kisu-green px-4 py-3 flex items-center">
              <div className="w-32 h-10 flex items-center overflow-hidden">
                <img
                  src="/newlogo-homerentinn.png"
                  alt="Homerentin Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* Filters section */}
              <div className="p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Filter Rooms</h2>
                <FilterTabs filters={filters} onFilterChange={handleFilterChange} />
              </div>
              {/* Support section */}
              <div className="px-4 pb-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Support</h2>
                <div className="space-y-1">
                  <button
                    onClick={() => setShowContact(true)}
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors text-left"
                  >
                    <Mail className="w-4 h-4 text-kisu-green" />
                    Contact us
                  </button>
                  <button
                    onClick={() => setShowTerms(true)}
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-kisu-green" />
                    Terms &amp; Conditions
                  </button>
                  <button
                    onClick={() => setShowPrivacy(true)}
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors text-left"
                  >
                    <ShieldCheck className="w-4 h-4 text-kisu-green" />
                    Privacy Policy
                  </button>
                </div>
              </div>
            </div>
            
            {/* Logout Button - at the bottom of sidebar */}
            <div className="border-t p-4">
              {user ? (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full py-2 px-3 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2 px-3 flex items-center justify-center gap-2 text-kisu-green hover:bg-green-50 rounded-lg transition-colors font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in
                </button>
              )}
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
            <DialogTitle className="flex flex-col items-center gap-2 pt-2 mb-2">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-kisu-green/10 text-kisu-green">
                <FileText className="w-6 h-6" />
              </span>
              <span className="text-2xl font-bold text-kisu-green">Terms &amp; Conditions</span>
              <span className="text-xs font-normal text-gray-400 tracking-wide uppercase">Last updated: November 2026</span>
            </DialogTitle>
          </DialogHeader>
          <div className="h-px bg-gray-100 mb-2" />
          {editingModal === 'terms' ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="edit-terms" className="font-semibold text-sm text-gray-700 mb-1">Edit Terms &amp; Conditions</label>
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
          ) : termsContent ? (
            <div className="prose prose-sm max-w-none whitespace-pre-line text-black">
              {termsContent}
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 italic mb-2">
                Welcome to Homerentin. By using our service, you agree to these terms and conditions.
              </p>
              <div className="space-y-1 pb-2">
              {termsSections.map((section, i) => (
                <div key={section.title} className="flex gap-3 py-2">
                  <span className="flex-shrink-0 mt-0.5 flex items-center justify-center w-7 h-7 rounded-full bg-kisu-green/10 text-kisu-green text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-0.5">{section.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{section.body}</p>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
          <DialogFooter>
            {isAdmin() && editingModal !== 'terms' && (
              <Button onClick={() => handleEditModal('terms', termsContent || defaultTerms)} variant="outline">Edit</Button>
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
            <DialogTitle className="flex flex-col items-center gap-2 pt-2 mb-2">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-kisu-green/10 text-kisu-green">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <span className="text-2xl font-bold text-kisu-green">Privacy Policy</span>
              <span className="text-xs font-normal text-gray-400 tracking-wide uppercase">Last updated: November 2026</span>
            </DialogTitle>
          </DialogHeader>
          <div className="h-px bg-gray-100 mb-2" />
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
          ) : privacyContent ? (
            <div className="prose prose-sm max-w-none whitespace-pre-line text-black">
              {privacyContent}
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 italic mb-2">
                This Privacy Policy explains how Homerentin collects, uses, and protects your personal information.
              </p>
              <div className="space-y-1 pb-2">
              {privacySections.map((section, i) => (
                <div key={section.title} className="flex gap-3 py-2">
                  <span className="flex-shrink-0 mt-0.5 flex items-center justify-center w-7 h-7 rounded-full bg-kisu-green/10 text-kisu-green text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-0.5">{section.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{section.body}</p>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
          <DialogFooter>
            {isAdmin() && editingModal !== 'privacy' && (
              <Button onClick={() => handleEditModal('privacy', privacyContent || defaultPrivacy)} variant="outline">Edit</Button>
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
          {/* Contact rows, each with its brand icon */}
          <div className="space-y-2 py-1">
            {contactRows.map((row) => {
              const Icon = row.icon;
              const inner = (
                <>
                  <span className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${row.color}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="text-xs text-gray-500 font-medium">{row.label}</span>
                    <span className="text-sm text-gray-900 font-medium truncate">{row.value}</span>
                  </span>
                </>
              );
              const className = "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors text-left";
              return row.href ? (
                <a key={row.label} href={row.href} target="_blank" rel="noreferrer" className={className}>
                  {inner}
                </a>
              ) : (
                <div key={row.label} className={className}>
                  {inner}
                </div>
              );
            })}
          </div>
          {/* Response time highlight */}
          <div className="rounded-xl bg-kisu-green/10 border border-kisu-green/20 px-4 py-3 text-center">
            <p className="text-sm text-gray-700">
              We typically respond <span className="font-semibold text-kisu-green-dark">in minutes</span>
            </p>
          </div>
          <DialogFooter>
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
