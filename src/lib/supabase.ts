import { createClient } from '@supabase/supabase-js'

// Direct Supabase configuration - no environment variables needed
const supabaseUrl = 'https://cmeqhzuagqjqamgmbutx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtZXFoenVhZ3FqcWFtZ21idXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5ODIyNjgsImV4cCI6MjA2NjU1ODI2OH0.pgNEPH46pZV6gb_NvO7BWsMb1bCGwZXU6h8kY4kV9Bs'

// Debug logging
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'undefined')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Room {
  id: string
  room_id: string // Auto-generated sequential room identifier (e.g., "00200", "00201")
  title: string
  price: number
  deposit?: number
  time_from_campus: string
  distance_from_campus: string
  verification: boolean
  status: 'vacant' | 'occupied' | 'pending' | 'maintenance'
  room_type: 'bedsitter' | 'single' | 'apartment' | 'studio' | 'shared'
  location: string
  payment_type: 'monthly' | 'quarterly' | 'semester' | 'yearly'
  floor: string
  interior_water_supply: boolean
  ceiling: boolean
  size: string
  sink: boolean
  working_toilet: boolean
  flashable_toilets: boolean
  security_rating: number
  wifi: boolean
  additional_info: string
  landlord_phone: string
  position: number
  images: string[]
  created_at: string
  updated_at: string
  user_phone: string // uploader's phone number
  terms?: string;
}

export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  avatar_url?: string
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  room_id: string
  check_in_date: string
  check_out_date: string
  status: 'pending' | 'confirmed' | 'cancelled'
  total_amount: number
  created_at: string
}

// Database functions
export const roomsApi = {
  // Get all rooms with optional filters
  async getRooms(filters?: {
    roomType?: string
    area?: string
    priceRange?: string
    status?: string
    verification?: boolean
    user_phone?: string
  }) {
    let query = supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.roomType && filters.roomType !== 'all') {
      query = query.eq('room_type', filters.roomType)
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters?.verification !== undefined) {
      query = query.eq('verification', filters.verification)
    }

    if (filters?.area && filters.area !== 'all') {
      // Case-insensitive partial match for area/location
      query = query.ilike('location', `%${filters.area}%`);
    }

    if (filters?.priceRange && filters.priceRange !== 'all') {
      // Accepts formats like '2K-4K', '8K+', or numeric '0-10000'
      const range = filters.priceRange.toUpperCase().replace('K', '000').replace('+', '');
      if (range.includes('-')) {
        const [minStr, maxStr] = range.split('-');
        const min = parseInt(minStr);
        const max = parseInt(maxStr);
        if (!isNaN(min)) query = query.gte('price', min);
        if (!isNaN(max)) query = query.lte('price', max);
      } else {
        const min = parseInt(range);
        if (!isNaN(min)) query = query.gte('price', min);
      }
    }

    if (filters?.user_phone) {
      query = query.eq('user_phone', filters.user_phone);
    }

    const { data, error } = await query
    return { data, error }
  },

  // Get a single room by ID
  async getRoom(id: string) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Create a new room (admin only)
  async createRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>) {
    console.log('Creating room with data:', room);
    
    const { data, error } = await supabase
      .from('rooms')
      .insert([room])
      .select()
      .single()
    
    if (error) {
      console.error('Supabase create room error:', error);
      return { data: null, error }
    }
    
    console.log('Room created successfully:', data);
    return { data, error: null }
  },

  // Update a room (admin only)
  async updateRoom(id: string, updates: Partial<Room>) {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Delete a room (admin only)
  async deleteRoom(id: string) {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id)
    return { error }
  }
}

// Storage functions for image upload
export const storageApi = {
  // Upload image to Supabase storage
  async uploadImage(file: File, fileName?: string): Promise<{ url: string; error: any }> {
    const fileExt = file.name.split('.').pop()
    const fileNameWithExt = fileName || `${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileNameWithExt, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return { url: '', error }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileNameWithExt)

    return { url: publicUrl, error: null }
  },

  // Delete image from storage
  async deleteImage(fileName: string) {
    const { error } = await supabase.storage
      .from('images')
      .remove([fileName])
    return { error }
  },

  // Get public URL for an image
  getImageUrl(fileName: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)
    return publicUrl
  }
}

export const authApi = {
  // Sign up user
  async signUp(username: string, phone: string, password: string, email?: string) {
    const { data, error } = await supabase.rpc('create_user', {
      p_username: username,
      p_phone_number: phone,
      p_password: password,
      p_email: email
    })
    return { data, error }
  },

  // Sign in user
  async signIn(username: string, phone: string, password: string) {
    const { data, error } = await supabase.rpc('authenticate_user', {
      p_username: username,
      p_phone_number: phone,
      p_password: password
    })
    return { data, error }
  },

  // Sign in admin
  async signInAdmin(username: string, phone: string, password: string) {
    console.log('🚀 authApi.signInAdmin RPC call:', { username, phone, password: '***' + password.slice(-2) });
    
    const { data, error } = await supabase.rpc('authenticate_admin', {
      p_username: username,
      p_phone_number: phone,
      p_password: password
    })
    
    console.log('🚀 authenticate_admin RPC response:', { data, error });
    return { data, error }
  },

  // Reset user password
  async resetPassword(username: string, phone: string, newPassword: string, confirmPassword: string) {
    const { data, error } = await supabase.rpc('reset_user_password', {
      p_username: username,
      p_phone_number: phone,
      p_new_password: newPassword,
      p_confirm_password: confirmPassword
    })
    return { data, error }
  },

  // Sign out (we'll handle this with local state since we're not using Supabase auth)
  async signOut() {
    // Clear local storage or state
    return { error: null }
  },

  // Get current user (we'll handle this with local state)
  async getCurrentUser() {
    // Get user from local storage or state
    const userStr = localStorage.getItem('currentUser')
    const user = userStr ? JSON.parse(userStr) : null
    return { user, error: null }
  },

  // Listen to auth changes (we'll handle this with local state)
  onAuthStateChange(callback: (event: string, session: any) => void) {
    // We'll implement this with local state management
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
}

export const bookingsApi = {
  // Get user bookings
  async getUserBookings(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Create a booking
  async createBooking(booking: Omit<Booking, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([booking])
      .select()
      .single()
    return { data, error }
  },

  // Update booking status
  async updateBookingStatus(id: string, status: Booking['status']) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

export const userApi = {
  // Get user by phone number
  async getUserByPhone(phone: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phone)
      .single()
    return { data, error }
  },

  // Get admin by phone number
  async getAdminByPhone(phone: string) {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('phone_number', phone)
      .single()
    return { data, error }
  },

  // Update user
  async updateUser(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Update admin
  async updateAdmin(id: string, updates: any) {
    const { data, error } = await supabase
      .from('admins')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Get user by username and phone number
  async getUserByUsernameAndPhone(username: string, phone: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('phone_number', phone)
      .single();
    return { data, error };
  }
} 