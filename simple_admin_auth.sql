-- Simple admin authentication - just insert plain password into hashed_password column

-- Function to authenticate admin (simple approach)
CREATE OR REPLACE FUNCTION simple_authenticate_admin(
    admin_phone VARCHAR(20),
    admin_username VARCHAR(50),
    input_password VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_record RECORD;
BEGIN
    -- Get admin record
    SELECT * INTO admin_record 
    FROM admins 
    WHERE phone_number = admin_phone 
    AND username = admin_username;
    
    -- If admin not found
    IF admin_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- If admin has plain_password, insert it into hashed_password and remove plain_password
    IF admin_record.plain_password IS NOT NULL THEN
        UPDATE admins 
        SET 
            hashed_password = admin_record.plain_password,
            plain_password = NULL
        WHERE id = admin_record.id;
        
        -- Check if password matches
        RETURN admin_record.plain_password = input_password;
    ELSE
        -- Check hashed password
        RETURN admin_record.hashed_password = input_password;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to authenticate user (simple approach)
CREATE OR REPLACE FUNCTION simple_authenticate_user(
    user_phone VARCHAR(20),
    input_password VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Get user record
    SELECT * INTO user_record 
    FROM users 
    WHERE phone_number = user_phone;
    
    -- If user not found
    IF user_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check password
    RETURN user_record.hashed_password = input_password;
END;
$$ LANGUAGE plpgsql; 