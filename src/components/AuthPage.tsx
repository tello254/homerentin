import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Phone, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';
import { useAuth } from '@/hooks/useSupabase';
import AdminVerificationModal, { AdminWelcomeModal } from './AdminVerificationModal';
import { userApi } from '@/lib/supabase';

interface AuthPageProps {
  onLogin: (user?: any) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-step1' | 'forgot-step2';

const AuthPage = ({ onLogin }: AuthPageProps) => {
  const { signIn, signInAdmin, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Admin verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [pendingAdminCredentials, setPendingAdminCredentials] = useState<{
    username: string;
    phone: string;
    password: string;
  } | null>(null);
  
  // Sign up fields
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  // Forgot password step 1
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotUsername, setForgotUsername] = useState('');
  
  // Forgot password step 2
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification code constant
  const ADMIN_VERIFICATION_CODE = '2050';

  // Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeUsername, setWelcomeUsername] = useState('');

  const [showAdminCheckbox, setShowAdminCheckbox] = useState(false);
  const [backClickCount, setBackClickCount] = useState(0);
  const [lastBackClick, setLastBackClick] = useState(0);

  // Add a ref to store the last successful admin user data
  const [lastAdminUser, setLastAdminUser] = useState<any>(null);

  // Triple-click handler for 'Back'
  const handleBackClick = () => {
    const now = Date.now();
    if (now - lastBackClick < 600) { // 600ms window for fast triple click
      setBackClickCount((count) => {
        if (count + 1 === 3) {
          setShowAdminCheckbox((v) => !v);
          return 0;
        }
        return count + 1;
      });
    } else {
      setBackClickCount(1);
    }
    setLastBackClick(now);
  };

  // Utility to normalize username and phone
  const normalizeUsername = (u: string) => u.trim().toLowerCase();
  const normalizePhone = (p: string) => p.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    console.log('🔐 Login attempt:', {
      username,
      phone,
      password: '***' + password.slice(-2),
      isAdmin
    });
    
    try {
      if (isAdmin) {
        // For admin login, show verification modal first
        console.log('👑 Admin login requested, showing verification modal...');
        setPendingAdminCredentials({ username, phone, password });
        setShowVerificationModal(true);
        setIsLoading(false);
        return;
      } else {
        console.log('👤 Attempting user login...');
        const result = await signIn(normalizeUsername(username), normalizePhone(phone), password);
        console.log('👤 User login result:', result);
        
        if (result.error) {
          console.error('❌ Login failed:', result.error);
          setError(result.error);
        } else {
          console.log('✅ Login successful:', result.data);
          onLogin(); // Call the onLogin prop to authenticate the user
        }
      }
    } catch (err) {
      console.error('💥 Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (code: string) => {
    if (!pendingAdminCredentials) return;
    setIsLoading(true);
    setVerificationError(null);
    try {
      if (code !== ADMIN_VERIFICATION_CODE) {
        setVerificationError('Invalid verification code');
        setIsLoading(false);
        return;
      }
      // Proceed with admin login
      const result = await signInAdmin(
        pendingAdminCredentials.username,
        pendingAdminCredentials.phone,
        pendingAdminCredentials.password
      );
      if (result.error) {
        setVerificationError(result.error);
      } else {
        const adminUsername = result.data?.username || pendingAdminCredentials.username;
        setWelcomeUsername(adminUsername);
        setShowVerificationModal(false);
        setPendingAdminCredentials(null);
        setVerificationError(null);
        setShowWelcomeModal(true);
        setLastAdminUser(result.data); // Store admin user data for redirect
      }
    } catch (err) {
      setVerificationError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseVerificationModal = () => {
    setShowVerificationModal(false);
    setPendingAdminCredentials(null);
    setVerificationError(null);
    // Reset form fields
    setUsername('');
    setPhone('');
    setPassword('');
    setIsAdmin(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signUp(normalizeUsername(signupUsername), normalizePhone(signupPhone), signupPassword);
      
      if (result.error) {
        setError(result.error);
      } else {
        // After successful signup, sign in with the new credentials
        const loginResult = await signIn(normalizeUsername(signupUsername), normalizePhone(signupPhone), signupPassword);
        if (loginResult.error) {
          setError(loginResult.error);
        } else {
          onLogin(loginResult.data);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    if (forgotPhone && forgotUsername) {
      // Check if user exists with both username and phone
      const { data, error } = await userApi.getUserByUsernameAndPhone(normalizeUsername(forgotUsername), normalizePhone(forgotPhone));
      if (error || !data) {
        setError('Seems like you have forgoten either of the details, kindly sign up.');
        setIsLoading(false);
        return;
      }
      setMode('forgot-step2');
    }
    setIsLoading(false);
  };

  const handleForgotStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && confirmPassword && newPassword === confirmPassword) {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await resetPassword(normalizeUsername(forgotUsername), normalizePhone(forgotPhone), newPassword, confirmPassword);
        console.log('resetPassword result:', result);
        if (result.error) {
          setError(result.error);
        } else {
          // After password reset, sign in with the new credentials
          const loginResult = await signIn(normalizeUsername(forgotUsername), normalizePhone(forgotPhone), newPassword);
          if (loginResult.error) {
            setError(loginResult.error);
          } else {
            onLogin(loginResult.data);
            console.log('currentUser in localStorage after reset:', localStorage.getItem('currentUser'));
          }
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    } else if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
    }
  };

  const handleBackToLogin = () => {
    setMode('login');
    setError(null);
    setForgotPhone('');
    setForgotUsername('');
    setNewPassword('');
    setConfirmPassword('');
    setSignupUsername('');
    setSignupPhone('');
    setSignupPassword('');
  };

  const handleWelcomeOk = () => {
    setShowWelcomeModal(false);
    if (lastAdminUser) {
      onLogin(lastAdminUser); // Pass admin user data for redirect
    } else {
      onLogin();
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="username" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Username
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="text-base"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="text-base"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="text-base pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-2 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-gray-400 line-through" />
            )}
          </Button>
        </div>
        {/* Forgot Password link below password input, aligned right */}
        <div className="w-full flex justify-between items-center mt-1 mb-1">
          <button
            type="button"
            onClick={() => setMode('forgot-step1')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium text-left"
          >
            Forgot Password?
          </button>
          <span className="text-xs text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-kisu-green font-bold text-base hover:text-green-700 focus:outline-none"
            >
              Sign up
            </button>
          </span>
        </div>
      </div>
      
      {showAdminCheckbox && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isAdmin"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            className="rounded border-gray-300"
            aria-label="Login as admin"
          />
          <Label htmlFor="isAdmin" className="text-sm">
            Login as Admin
          </Label>
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : (isAdmin ? 'Sign In as Admin' : 'Sign In')}
      </Button>
    </form>
  );

  const renderSignupForm = () => (
    <form onSubmit={handleSignup} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="signupUsername" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Username
        </Label>
        <Input
          id="signupUsername"
          type="text"
          placeholder="Enter your username"
          value={signupUsername}
          onChange={(e) => setSignupUsername(e.target.value)}
          required
          className="text-base"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signupPhone" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Phone Number
        </Label>
        <Input
          id="signupPhone"
          type="tel"
          placeholder="Enter your phone number"
          value={signupPhone}
          onChange={(e) => setSignupPhone(e.target.value)}
          required
          className="text-base"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signupPassword" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Password
        </Label>
        <div className="relative">
          <Input
            id="signupPassword"
            type={showSignupPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            required
            className="text-base pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-2 py-2 hover:bg-transparent"
            onClick={() => setShowSignupPassword(!showSignupPassword)}
            tabIndex={-1}
          >
            {showSignupPassword ? (
              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-gray-400 line-through" />
            )}
          </Button>
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </Button>
      
      <div className="text-center">
        <button
          type="button"
          onClick={handleBackToLogin}
          className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-1 mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </button>
      </div>
    </form>
  );

  const renderForgotStep1 = () => (
    <form onSubmit={handleForgotStep1} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="forgotPhone" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Phone Number
        </Label>
        <Input
          id="forgotPhone"
          type="tel"
          placeholder="Enter your phone number"
          value={forgotPhone}
          onChange={(e) => setForgotPhone(e.target.value)}
          required
          className="text-base"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="username" className="flex items-center gap-2">
          Username
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={forgotUsername}
          onChange={(e) => setForgotUsername(e.target.value)}
          required
          className="text-base"
        />
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={!forgotPhone || !forgotUsername}
      >
        Continue
      </Button>
      
      <div className="text-center">
        <button
          type="button"
          onClick={handleBackToLogin}
          className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </button>
      </div>
    </form>
  );

  const renderForgotStep2 = () => (
    <form onSubmit={handleForgotStep2} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newPassword" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          New Password
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="text-base pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-2 py-2 hover:bg-transparent"
            onClick={() => setShowNewPassword(!showNewPassword)}
            tabIndex={-1}
          >
            {showNewPassword ? (
              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-gray-400 line-through" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Confirm New Password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="text-base pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-2 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-gray-400 line-through" />
            )}
          </Button>
        </div>
      </div>
      
      {confirmPassword && newPassword !== confirmPassword && (
        <p className="text-sm text-red-600">Passwords do not match</p>
      )}
      
      <Button
        type="submit"
        className="w-full"
        disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || isLoading}
      >
        {isLoading ? 'Resetting Password...' : 'Reset Password'}
      </Button>
      
      <div className="text-center">
        <button
          type="button"
          onClick={handleBackToLogin}
          className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </button>
      </div>
    </form>
  );

  const getTitle = () => {
    if (mode === 'login') {
      return (
        <>
          Welcome{' '}
          <span
            className="text-black cursor-pointer hover:underline"
            onClick={handleBackClick}
            title="Triple-click to show admin login option"
          >
            Back
          </span>
        </>
      );
    }
    switch (mode) {
      case 'signup':
        return 'Create Account';
      case 'forgot-step1':
        return 'Reset Password';
      case 'forgot-step2':
        return 'Set New Password';
      default:
        return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup':
        return 'Create your account to get started';
      case 'forgot-step1':
        return 'Enter your phone number and username';
      case 'forgot-step2':
        return 'Enter your new password';
      default:
        return 'Sign in to your account';
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'signup':
        return renderSignupForm();
      case 'forgot-step1':
        return renderForgotStep1();
      case 'forgot-step2':
        return renderForgotStep2();
      default:
        return renderLoginForm();
    }
  };

  return (
    <div
      className="min-h-screen min-w-screen w-screen h-screen flex flex-col items-center justify-center p-4 overflow-x-hidden"
      style={{ background: '#0a2240', width: '100vw', height: '100vh', overflowX: 'hidden', position: 'relative' }}
    >
      <img src="/newlogo-homerentinn.png" alt="HomeRentInn Logo" className="w-44 h-auto mb-6 mx-auto" />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
          <p className="text-gray-600 mt-2">{getSubtitle()}</p>
        </CardHeader>
        <CardContent>
          {renderForm()}
        </CardContent>
      </Card>
      {showVerificationModal && (
        <AdminVerificationModal
          isOpen={showVerificationModal}
          onClose={handleCloseVerificationModal}
          onVerify={handleVerification}
          error={verificationError}
        />
      )}
      {showWelcomeModal && (
        <AdminWelcomeModal
          isOpen={showWelcomeModal}
          username={welcomeUsername}
          onClose={handleWelcomeOk}
        />
      )}
      <footer
        className="mt-8 w-full px-2 text-xs text-gray-400"
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-start w-full max-w-3xl mx-auto gap-2 md:gap-0">
          <div className="flex flex-col items-start md:items-start whitespace-nowrap mb-2 md:mb-0">
            <span>© 2025 Homerentin.</span>
            <span>All rights reserved.</span>
        </div>
          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-0.5 md:gap-x-6 md:gap-y-0 items-start md:items-center">
          <span>Email: <a href="mailto:support.homerentin@gmail.com" className="text-blue-600 hover:underline">support.homerentin@gmail.com</a></span>
          <span>Call: <a href="tel:+254703209997" className="text-blue-600 hover:underline">0703 209 997</a></span>
          <span>WhatsApp: <a href="https://wa.me/254182544098" target="_blank" rel="noreferrer" className="text-green-600 hover:underline">+254 182 544 098</a></span>
          <span>Telegram: <a href="https://t.me/homerentin" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@homerentin</a></span>
          <span>LinkedIn: <span className="text-gray-600">support@homerentin.com</span></span>
          <span>Address: <span className="text-gray-600">Kisii, Kenya</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
