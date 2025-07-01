-- Rooms Table Setup for Kisu Rooms App
-- This script creates the rooms table with all required columns

-- Create rooms table with all specified columns
CREATE TABLE rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    time_from_campus VARCHAR(50), -- e.g., "15 minutes"
    distance_from_campus VARCHAR(50), -- e.g., "2.5 km"
    verification BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'pending', 'maintenance')),
    room_type VARCHAR(50) CHECK (room_type IN ('bedsitter', 'single', 'apartment', 'studio', 'shared')),
    location VARCHAR(255) NOT NULL,
    payment_type VARCHAR(50) CHECK (payment_type IN ('monthly', 'quarterly', 'semester', 'yearly')),
    floor INTEGER,
    interior_water_supply BOOLEAN DEFAULT false,
    ceiling BOOLEAN DEFAULT true,
    size VARCHAR(50), -- e.g., "12x15 feet"
    sink BOOLEAN DEFAULT false,
    working_toilet BOOLEAN DEFAULT false,
    flashing BOOLEAN DEFAULT false,
    security_rating INTEGER CHECK (security_rating >= 1 AND security_rating <= 5),
    images TEXT[], -- Array of Supabase storage URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security for rooms table (we'll handle permissions in the app)
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(room_type);
CREATE INDEX idx_rooms_location ON rooms(location);
CREATE INDEX idx_rooms_price ON rooms(price);
CREATE INDEX idx_rooms_verification ON rooms(verification);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON rooms TO authenticated;
GRANT ALL ON rooms TO anon;

-- Insert sample rooms for testing (you can remove these later)
INSERT INTO rooms (
    title, 
    price, 
    time_from_campus, 
    distance_from_campus, 
    verification, 
    status, 
    room_type, 
    location, 
    payment_type, 
    floor, 
    interior_water_supply, 
    ceiling, 
    size, 
    sink, 
    working_toilet, 
    flashing, 
    security_rating,
    images
) VALUES 
(
    'Cozy Bedsitter Near Campus',
    25000,
    '10 minutes',
    '1.2 km',
    true,
    'vacant',
    'bedsitter',
    'Westlands, Nairobi',
    'monthly',
    2,
    true,
    true,
    '15x20 feet',
    true,
    true,
    true,
    4,
    ARRAY['https://example.com/placeholder1.jpg', 'https://example.com/placeholder2.jpg']
),
(
    'Modern Studio Apartment',
    45000,
    '15 minutes',
    '2.1 km',
    true,
    'vacant',
    'studio',
    'Kilimani, Nairobi',
    'monthly',
    3,
    true,
    true,
    '20x25 feet',
    true,
    true,
    true,
    5,
    ARRAY['https://example.com/placeholder3.jpg']
),
(
    'Affordable Single Room',
    18000,
    '8 minutes',
    '0.8 km',
    false,
    'vacant',
    'single',
    'Hurlingham, Nairobi',
    'monthly',
    1,
    false,
    true,
    '12x15 feet',
    false,
    true,
    false,
    3,
    ARRAY['https://example.com/placeholder4.jpg']
);

-- Create storage bucket for images
-- Note: This needs to be run in Supabase dashboard or via API
-- Bucket name: 'images'
-- Public bucket: true
-- File size limit: 10MB
-- Allowed MIME types: image/*

-- Storage bucket policies (run these after creating the bucket)
-- Allow public read access to images
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated users to upload images
-- CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Allow users to update their own uploads
-- CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own uploads
-- CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]); 