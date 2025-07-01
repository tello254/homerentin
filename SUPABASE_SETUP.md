# Supabase Setup Guide

This guide will help you set up Supabase database for your room finder application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `kisu-rooms-finder`
   - Database Password: (create a strong password)
   - Region: (choose closest to you)
6. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy your:
   - Project URL
   - Anon (public) key

## 3. Set Up Environment Variables

1. Create a `.env.local` file in your project root
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Create Database Tables

Run these SQL commands in your Supabase SQL Editor:

### Rooms Table
```sql
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  location TEXT NOT NULL,
  distance TEXT,
  walk_time TEXT,
  room_type TEXT CHECK (room_type IN ('bedsitter', 'single', 'apartment', 'studio')) NOT NULL,
  status TEXT CHECK (status IN ('vacant', 'occupied', 'pending')) DEFAULT 'vacant',
  verified BOOLEAN DEFAULT false,
  images TEXT[] DEFAULT '{}',
  contact TEXT,
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access" ON rooms FOR SELECT USING (true);

-- Create policy for authenticated users to insert
CREATE POLICY "Authenticated users can insert" ON rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated users to update their own rooms
CREATE POLICY "Users can update own rooms" ON rooms FOR UPDATE USING (auth.uid()::text = created_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own bookings
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to create their own bookings
CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own bookings
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);
```

### User Profiles Table (Optional)
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 5. Insert Sample Data

```sql
-- Insert sample rooms
INSERT INTO rooms (title, description, price, location, distance, walk_time, room_type, status, verified, images, contact, amenities) VALUES
('Modern Bedsitter', 'Spacious bedsitter with modern amenities', 3500, 'Jogoo Estate', '300m', '4 min', 'bedsitter', 'vacant', true, ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300'], '+254712345678', ARRAY['WiFi', 'Water', 'Security']),
('Spacious Single Room', 'Comfortable single room with balcony', 4200, 'Mwembe Estate', '500m', '6 min', 'single', 'vacant', true, ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300'], '+254712345679', ARRAY['WiFi', 'Water', 'Security', 'Balcony']),
('Student Apartment', 'Perfect for students, near campus', 6000, 'Town Area', '1km', '12 min', 'apartment', 'pending', false, ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300'], '+254712345680', ARRAY['WiFi', 'Water', 'Security', 'Kitchen', 'Study Area']),
('Cozy Bedsitter', 'Affordable and cozy bedsitter', 2800, 'Campus Road', '200m', '3 min', 'bedsitter', 'vacant', true, ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300'], '+254712345681', ARRAY['WiFi', 'Water']),
('Premium Single', 'Luxury single room with premium amenities', 5500, 'Jogoo Estate', '400m', '5 min', 'single', 'occupied', true, ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300'], '+254712345682', ARRAY['WiFi', 'Water', 'Security', 'AC', 'Balcony']);
```

## 6. Test Your Connection

1. Start your development server: `npm run dev`
2. Open your browser and check the console for any connection errors
3. The app should now be connected to Supabase!

## 7. Next Steps

- Set up authentication UI components
- Create room management features
- Add booking functionality
- Implement real-time updates
- Add image upload functionality

## Troubleshooting

- Make sure your environment variables are correct
- Check that your Supabase project is active
- Verify that your database tables are created correctly
- Check the browser console for any error messages 