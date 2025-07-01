-- Working admin authentication - simple and functional

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS authenticate_admin(varchar, varchar, varchar);
DROP FUNCTION IF EXISTS authenticate_user(varchar, varchar, varchar);
DROP FUNCTION IF EXISTS reset_user_password(varchar, varchar, varchar, varchar);
DROP FUNCTION IF EXISTS create_user(varchar, varchar, varchar, varchar);

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the admins table
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    plain_password VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to authenticate admin
CREATE OR REPLACE FUNCTION authenticate_admin(
    p_username VARCHAR,
    p_phone_number VARCHAR,
    p_password VARCHAR
) RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    admin_id UUID,
    admin_username VARCHAR,
    admin_phone VARCHAR,
    admin_email VARCHAR
) AS $$
DECLARE
    admin_record RECORD;
    hashed_pwd VARCHAR(255);
BEGIN
    -- Find admin by username and phone number
    SELECT * INTO admin_record 
    FROM admins 
    WHERE username = p_username AND phone_number = p_phone_number;
    
    -- If admin not found
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Admin not found'::TEXT, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR;
        RETURN;
    END IF;
    
    -- If admin has plain_password (first login), hash it and convert
    IF admin_record.plain_password IS NOT NULL AND admin_record.plain_password = p_password THEN
        -- Hash the password using bcrypt
        hashed_pwd := crypt(p_password, gen_salt('bf'));
        
        -- Update the admin record: hash the password and clear plain_password
        UPDATE admins 
        SET 
            hashed_password = hashed_pwd,
            plain_password = '',  -- Set to empty string instead of NULL
            updated_at = NOW()
        WHERE id = admin_record.id;
        
        RETURN QUERY SELECT 
            TRUE, 
            'Login successful'::TEXT, 
            admin_record.id, 
            admin_record.username, 
            admin_record.phone_number, 
            admin_record.email;
        RETURN;
    END IF;
    
    -- If admin has hashed_password (subsequent logins), verify with bcrypt
    IF admin_record.hashed_password IS NOT NULL AND admin_record.hashed_password = crypt(p_password, admin_record.hashed_password) THEN
        RETURN QUERY SELECT 
            TRUE, 
            'Login successful'::TEXT, 
            admin_record.id, 
            admin_record.username, 
            admin_record.phone_number, 
            admin_record.email;
        RETURN;
    END IF;
    
    -- Password doesn't match
    RETURN QUERY SELECT FALSE, 'Invalid password'::TEXT, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- Function to authenticate user
CREATE OR REPLACE FUNCTION authenticate_user(
    p_username VARCHAR,
    p_phone_number VARCHAR,
    p_password VARCHAR
) RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    user_id UUID,
    user_username VARCHAR,
    user_phone VARCHAR,
    user_email VARCHAR
) AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Find user by username and phone number
    SELECT * INTO user_record 
    FROM users 
    WHERE username = p_username AND phone_number = p_phone_number;
    
    -- If user not found
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'User not found'::TEXT, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR;
        RETURN;
    END IF;
    
    -- Check password using bcrypt
    IF user_record.hashed_password = crypt(p_password, user_record.hashed_password) THEN
        RETURN QUERY SELECT 
            TRUE, 
            'Login successful'::TEXT, 
            user_record.id, 
            user_record.username, 
            user_record.phone_number, 
            user_record.email;
    ELSE
        RETURN QUERY SELECT FALSE, 'Invalid password'::TEXT, NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to reset user password
CREATE OR REPLACE FUNCTION reset_user_password(
    p_username VARCHAR,
    p_phone_number VARCHAR,
    p_new_password VARCHAR,
    p_confirm_password VARCHAR
) RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    user_record RECORD;
    hashed_pwd VARCHAR(255);
BEGIN
    -- Check if passwords match
    IF p_new_password != p_confirm_password THEN
        RETURN QUERY SELECT FALSE, 'Passwords do not match'::TEXT;
        RETURN;
    END IF;
    
    -- Find user by username and phone number
    SELECT * INTO user_record 
    FROM users 
    WHERE username = p_username AND phone_number = p_phone_number;
    
    -- If user not found
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'User not found'::TEXT;
        RETURN;
    END IF;
    
    -- Hash the new password
    hashed_pwd := crypt(p_new_password, gen_salt('bf'));
    
    -- Update password
    UPDATE users 
    SET 
        hashed_password = hashed_pwd,
        updated_at = NOW()
    WHERE id = user_record.id;
    
    RETURN QUERY SELECT TRUE, 'Password reset successful'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to create new user
CREATE OR REPLACE FUNCTION create_user(
    p_username VARCHAR,
    p_phone_number VARCHAR,
    p_password VARCHAR,
    p_email VARCHAR DEFAULT NULL
) RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    user_id UUID
) AS $$
DECLARE
    new_user_id UUID;
    hashed_pwd VARCHAR(255);
BEGIN
    -- Check if username already exists
    IF EXISTS(SELECT 1 FROM users WHERE username = p_username) THEN
        RETURN QUERY SELECT FALSE, 'Username already exists'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Check if phone number already exists
    IF EXISTS(SELECT 1 FROM users WHERE phone_number = p_phone_number) THEN
        RETURN QUERY SELECT FALSE, 'Phone number already exists'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Hash the password
    hashed_pwd := crypt(p_password, gen_salt('bf'));
    
    -- Insert new user
    INSERT INTO users (username, phone_number, hashed_password, email)
    VALUES (p_username, p_phone_number, hashed_pwd, p_email)
    RETURNING id INTO new_user_id;
    
    RETURN QUERY SELECT TRUE, 'User created successfully'::TEXT, new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample admin (for testing)
INSERT INTO admins (username, phone_number, plain_password, email) 
VALUES ('admin', '+1234567890', 'admin123', 'admin@example.com')
ON CONFLICT (username) DO NOTHING;

-- Insert sample user (for testing)
INSERT INTO users (username, phone_number, hashed_password, email) 
VALUES ('user1', '+9876543210', crypt('user123', gen_salt('bf')), 'user1@example.com')
ON CONFLICT (username) DO NOTHING; 