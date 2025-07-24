import { useState, useEffect } from 'react'
import { supabase, roomsApi, authApi, bookingsApi, type Room, type Booking } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Utility to normalize username and phone
const normalizeUsername = (u: string) => u.trim().toLowerCase();
const normalizePhone = (p: string) => p.trim();

export const useRooms = (filters?: {
  roomType?: string
  area?: string
  priceRange?: string
  status?: string
}) => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const { data, error } = await roomsApi.getRooms(filters)
      if (error) throw error
      setRooms(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [filters?.roomType, filters?.area, filters?.priceRange, filters?.status])

  return { rooms, loading, error, refetch: fetchRooms }
}

export const useAuth = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user from localStorage
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
    setLoading(false)
  }, [])

  const signUp = async (username: string, phone: string, password: string, email?: string) => {
    try {
      const { data, error } = await authApi.signUp(normalizeUsername(username), normalizePhone(phone), password, email)
      if (error) throw new Error(error.message || 'Sign up failed')
      
      // If signup successful, automatically sign in
      if (data?.success) {
        const signInResult = await signIn(username, phone, password)
        return signInResult
      }
      
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Sign up failed' }
    }
  }

  const signIn = async (username: string, phone: string, password: string) => {
    try {
      console.log('🔍 signIn called with:', { username, phone, password: '***' + password.slice(-2) });
      
      const { data, error } = await authApi.signIn(normalizeUsername(username), normalizePhone(phone), password);
      console.log('signIn data:', data);
      console.log('signIn error:', error);
      
      if (error) throw new Error(error.message || 'Sign in failed')
      
      // Handle the response structure - data is an array with one object
      const userData = Array.isArray(data) ? data[0] : data;
      console.log('🔍 Processed user data:', userData);
      
      if (userData?.success) {
        // Store user in localStorage
        const userInfo = {
          id: userData.user_id,
          username: userData.user_username,
          phone: userData.user_phone,
          email: userData.user_email,
          type: 'user'
        }
        console.log('✅ User login successful, storing data:', userInfo);
        localStorage.setItem('currentUser', JSON.stringify(userInfo))
        setUser(userInfo)
        return { data: userInfo, error: null }
      }
      
      console.log('❌ User login failed - no success in response:', userData);
      return { data: null, error: 'Invalid credentials' }
    } catch (err) {
      console.error('💥 signIn error:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Sign in failed' }
    }
  }

  const signInAdmin = async (username: string, phone: string, password: string) => {
    try {
      console.log('🔍 signInAdmin called with:', { username, phone, password: '***' + password.slice(-2) });
      
      const { data, error } = await authApi.signInAdmin(normalizeUsername(username), normalizePhone(phone), password);
      console.log('🔍 authApi.signInAdmin response:', { data, error });
      
      if (error) throw new Error(error.message || 'Admin sign in failed')
      
      // Handle the response structure - data is an array with one object
      const adminData = Array.isArray(data) ? data[0] : data;
      console.log('🔍 Processed admin data:', adminData);
      
      if (adminData?.success) {
        // Store admin in localStorage
        const userData = {
          id: adminData.admin_id,
          username: adminData.admin_username,
          phone: adminData.admin_phone,
          email: adminData.admin_email,
          type: 'admin'
        }
        console.log('✅ Admin login successful, storing data:', userData);
        localStorage.setItem('currentUser', JSON.stringify(userData))
        setUser(userData)
        return { data: userData, error: null }
      }
      
      console.log('❌ Admin login failed - no success in response:', adminData);
      return { data: null, error: 'Invalid admin credentials' }
    } catch (err) {
      console.error('💥 signInAdmin error:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Admin sign in failed' }
    }
  }

  const resetPassword = async (username: string, phone: string, newPassword: string, confirmPassword: string) => {
    try {
      const { data, error } = await authApi.resetPassword(normalizeUsername(username), normalizePhone(phone), newPassword, confirmPassword)
      if (error) throw new Error(error.message || 'Password reset failed')
      
      if (data?.success) {
        // Automatically sign in after password reset and return its result
        const signInResult = await signIn(username, phone, newPassword);
        console.log('signIn result after password reset:', signInResult);
        return signInResult;
      }
      
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Password reset failed' }
    }
  }

  const signOut = async () => {
    try {
      localStorage.removeItem('currentUser')
      setUser(null)
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign out failed' }
    }
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signInAdmin,
    resetPassword,
    signOut
  }
}

export const useBookings = (userId?: string) => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      const { data, error } = await bookingsApi.getUserBookings(userId)
      if (error) throw error
      setBookings(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const createBooking = async (booking: Omit<Booking, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await bookingsApi.createBooking(booking)
      if (error) throw error
      await fetchBookings() // Refresh bookings
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create booking' }
    }
  }

  const updateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      const { data, error } = await bookingsApi.updateBookingStatus(id, status)
      if (error) throw error
      await fetchBookings() // Refresh bookings
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update booking' }
    }
  }

  useEffect(() => {
    if (userId) {
      fetchBookings()
    }
  }, [userId])

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBookingStatus,
    refetch: fetchBookings
  }
} 