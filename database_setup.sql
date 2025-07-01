-- Database Setup for Kisu Rooms App
-- Create tables for users and admins with RLS disabled

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table
CREATE TABLE admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    hashed_password VARCHAR(255),
    plain_password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security (RLS) for both tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_admins_phone ON admins(phone_number);
CREATE INDEX idx_admins_username ON admins(username);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin (you can modify these values)
-- This admin will have plain_password that will be converted to hashed_password on first login
INSERT INTO admins (username, phone_number, plain_password, email) 
VALUES ('admin', '+1234567890', 'admin123', 'admin@example.com');

-- Grant necessary permissions (adjust based on your Supabase setup)
GRANT ALL ON users TO authenticated;
GRANT ALL ON admins TO authenticated;
GRANT ALL ON users TO anon;
GRANT ALL ON admins TO anon; 