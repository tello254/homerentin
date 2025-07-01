import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Edit, Save, X, LogOut, User, Phone, Mail, Loader2 } from 'lucide-react';
import { userApi } from '@/lib/supabase';

interface UserInfo {
  id: string;
  username: string;
  phone_number: string;
  email: string;
  type: 'user' | 'admin';
}

interface AccountPageProps {
  onLogout: () => void;
}

const AccountPage = ({ onLogout }: AccountPageProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Partial<UserInfo>>({});
  const [saving, setSaving] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user from localStorage
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        throw new Error('No user data found');
      }
      
      const currentUser = JSON.parse(currentUserStr);
      const { phone, type } = currentUser;
      
      let data;
      let error;
      
      // Fetch from correct table based on user type
      if (type === 'admin') {
        const result = await userApi.getAdminByPhone(phone);
        data = result.data;
        error = result.error;
      } else {
        const result = await userApi.getUserByPhone(phone);
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      
      // Transform data to match our interface
      const userData: UserInfo = {
        id: data.id,
        username: data.username,
        phone_number: data.phone_number,
        email: data.email || '',
        type: type
      };
      
      setUserInfo(userData);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: keyof UserInfo) => {
    setEditingField(field);
    setTempValues({ [field]: userInfo?.[field] || '' });
  };

  const handleSave = async (field: keyof UserInfo) => {
    if (!userInfo) return;
    
    try {
      setSaving(true);
      const newValue = tempValues[field];
      
      // Update in database
      let result;
      if (userInfo.type === 'admin') {
        result = await userApi.updateAdmin(userInfo.id, { [field]: newValue });
      } else {
        result = await userApi.updateUser(userInfo.id, { [field]: newValue });
      }
      
      if (result.error) throw result.error;
      
      // Update local state
      setUserInfo(prev => prev ? { ...prev, [field]: newValue } : null);
      setEditingField(null);
      
      // Update localStorage
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        const updatedUser = { ...currentUser, [field]: newValue };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValues({});
  };

  const handleLogout = () => {
    onLogout();
  };

  const renderEditableField = (
    field: keyof UserInfo,
    label: string,
    icon: React.ReactNode,
    type: string = 'text'
  ) => {
    if (!userInfo) return null;
    
    const isEditing = editingField === field;
    const value = isEditing ? tempValues[field] : userInfo[field];

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <div className="flex-1">
                  <Label htmlFor={field} className="sr-only">
                    {label}
                  </Label>
                  <Input
                    id={field}
                    type={type}
                    value={value || ''}
                    onChange={(e) =>
                      setTempValues(prev => ({
                        ...prev,
                        [field]: e.target.value
                      }))
                    }
                    className="text-base"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSave(field)}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <p className="text-base text-gray-700">{value || 'Not set'}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(field)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading account information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 pb-20">
        <div className="max-w-md mx-auto text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading account</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchUserData} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="p-4 pb-20">
        <div className="max-w-md mx-auto text-center">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No account found</h3>
          <p className="text-gray-500">Please log in again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">My Account</h2>
        
        {/* User Type Badge */}
        <div className="mb-6 text-center">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            userInfo.type === 'admin' 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {userInfo.type === 'admin' ? 'Administrator' : 'User'}
          </span>
        </div>
        
        {renderEditableField('username', 'Username', <User className="h-5 w-5" />)}
        {renderEditableField('phone_number', 'Phone Number', <Phone className="h-5 w-5" />, 'tel')}
        {renderEditableField('email', 'Email Address', <Mail className="h-5 w-5" />, 'email')}
        
        <Card className="mt-8 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountPage; 