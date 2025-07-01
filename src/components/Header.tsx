import { Menu, ChevronDown, Settings, X } from 'lucide-react';
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
}

const Header = ({ onFilterChange, onViewModeChange, user }: HeaderProps) => {
  const navigate = useNavigate();
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  
  // Check if current user is admin
  const isAdmin = () => {
    return user?.type === 'admin';
  };

  const handleAdminDashboard = () => {
    onViewModeChange('admin');
    navigate('/admin');
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
          <SheetContent side="left" className="w-1/2 p-0">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Filter Rooms</h2>
            </div>
            <div className="p-4">
              <FilterTabs onFilterChange={onFilterChange} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Center - Logo */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
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
          <div className="prose prose-sm max-w-none">
            <p className="text-black leading-relaxed">
              Welcome to Homerentin. By using our service, you agree to these terms and conditions.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black">1. Service Description</h3>
            <p className="text-black leading-relaxed">
              Homerentin provides a platform for finding and booking student accommodation near educational institutions.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black">2. User Responsibilities</h3>
            <p className="text-black leading-relaxed">
              Users are responsible for providing accurate information and maintaining the security of their accounts.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black">3. Booking and Payment</h3>
            <p className="text-black leading-relaxed">
              All bookings are subject to availability and payment terms as specified by individual landlords.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black">4. Cancellation Policy</h3>
            <p className="text-black leading-relaxed">
              Cancellation policies vary by landlord and are clearly stated in each room listing.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black">5. Privacy and Data Protection</h3>
            <p className="text-black leading-relaxed">
              We are committed to protecting your privacy and personal information as outlined in our Privacy Policy.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black">6. Limitation of Liability</h3>
            <p className="text-black leading-relaxed">
              Homerentin acts as a platform and is not responsible for disputes between users and landlords.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black">7. Changes to Terms</h3>
            <p className="text-black leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of updated terms.
            </p>
          </div>
          <DialogFooter>
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
          <div className="prose prose-sm max-w-none">
            <p className="text-black leading-relaxed">
              This Privacy Policy explains how Homerentin collects, uses, and protects your personal information.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black">1. Information We Collect</h3>
            <p className="text-black leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, search for rooms, or contact landlords.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black">2. How We Use Your Information</h3>
            <p className="text-black leading-relaxed">
              We use your information to provide our services, improve user experience, and communicate with you about your account.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black">3. Information Sharing</h3>
            <p className="text-black leading-relaxed">
              We do not sell your personal information. We may share information with landlords when you express interest in their properties.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black">4. Data Security</h3>
            <p className="text-black leading-relaxed">
              We implement appropriate security measures to protect your personal information from unauthorized access or disclosure.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black">5. Your Rights</h3>
            <p className="text-black leading-relaxed">
              You have the right to access, update, or delete your personal information. Contact us to exercise these rights.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black">6. Cookies and Tracking</h3>
            <p className="text-black leading-relaxed">
              We use cookies and similar technologies to improve your browsing experience and analyze site usage.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black">7. Contact Us</h3>
            <p className="text-black leading-relaxed">
              If you have questions about this Privacy Policy, please contact us through the contact form.
            </p>
          </div>
          <DialogFooter>
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
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Get in Touch</h3>
              <p className="text-black text-sm">
                Have questions or need assistance? We're here to help!
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-kisu-green rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📧</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-black">Email</p>
                  <p className="text-black text-sm">support.homerentin@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-kisu-green rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📱</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-black">Phone</p>
                  <p className="text-black text-sm">+254 756 600 218</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-kisu-green rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📍</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-black">Address</p>
                  <p className="text-black text-sm">Kisii, Kenya</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-kisu-green rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📱</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-black">Telegram</p>
                  <p className="text-black text-sm">@homerentin</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-kisu-green rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💬</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-black">WhatsApp</p>
                  <p className="text-black text-sm">+254 756 600 218</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-kisu-green rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💼</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-black">LinkedIn</p>
                  <p className="text-black text-sm">support@homerentin.com</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <p className="text-black text-xs">
                We typically respond within 24 hours during business days.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowContact(false)} aria-label="Close contact information">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
