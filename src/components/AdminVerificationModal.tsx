import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Lock, X, CheckCircle } from 'lucide-react';

interface AdminVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const AdminVerificationModal = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  isLoading = false, 
  error = null 
}: AdminVerificationModalProps) => {
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim()) {
      onVerify(verificationCode.trim());
    }
  };

  const handleClose = () => {
    setVerificationCode('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">Admin Verification</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="verificationCode" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Verification Code
              </Label>
              <Input
                id="verificationCode"
                type="password"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="text-base"
                autoFocus
              />
            </div>
            
            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="font-medium mb-1">Security Notice:</p>
              <p>Admin access requires additional verification. Please enter the verification code to proceed.</p>
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || !verificationCode.trim()}
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

interface AdminWelcomeModalProps {
  isOpen: boolean;
  username: string;
  onClose: () => void;
}

const AdminWelcomeModal = ({ isOpen, username, onClose }: AdminWelcomeModalProps) => {
  console.log('🎭 AdminWelcomeModal render:', { isOpen, username });
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center space-y-2 pb-2">
          <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
          <CardTitle className="text-2xl font-bold text-center">Welcome CEO {username}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg">We are Glad To Have You!!</p>
          <Button className="w-full" onClick={onClose} autoFocus>
            OK
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVerificationModal;
export { AdminWelcomeModal }; 