-- Function to convert admin plain_password to hashed_password on first login
-- This function should be called when an admin logs in for the first time

CREATE OR REPLACE FUNCTION convert_admin_password(
    admin_phone VARCHAR(20),
    admin_username VARCHAR(50),
    new_hashed_password VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
    admin_exists BOOLEAN;
BEGIN
    -- Check if admin exists with plain_password
    SELECT EXISTS(
        SELECT 1 FROM admins 
        WHERE phone_number = admin_phone 
        AND username = admin_username 
        AND plain_password IS NOT NULL
        AND hashed_password IS NULL
    ) INTO admin_exists;
    
    -- If admin exists and has plain_password, convert it
    IF admin_exists THEN
        UPDATE admins 
        SET 
            hashed_password = new_hashed_password,
            plain_password = NULL,
            updated_at = NOW()
        WHERE phone_number = admin_phone 
        AND username = admin_username;
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check if admin exists and get their details
CREATE OR REPLACE FUNCTION get_admin_by_credentials(
    admin_phone VARCHAR(20),
    admin_username VARCHAR(50)
)
RETURNS TABLE(
    id UUID,
    username VARCHAR(50),
    phone_number VARCHAR(20),
    hashed_password VARCHAR(255),
    plain_password VARCHAR(255),
    email VARCHAR(255),
    is_first_login BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.username,
        a.phone_number,
        a.hashed_password,
        a.plain_password,
        a.email,
        (a.hashed_password IS NULL AND a.plain_password IS NOT NULL) as is_first_login
    FROM admins a
    WHERE a.phone_number = admin_phone 
    AND a.username = admin_username;
END;
$$ LANGUAGE plpgsql;

-- Function to get user by credentials
CREATE OR REPLACE FUNCTION get_user_by_credentials(
    user_phone VARCHAR(20)
)
RETURNS TABLE(
    id UUID,
    username VARCHAR(50),
    phone_number VARCHAR(20),
    hashed_password VARCHAR(255),
    email VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.phone_number,
        u.hashed_password,
        u.email
    FROM users u
    WHERE u.phone_number = user_phone;
END;
$$ LANGUAGE plpgsql;

-- Simplified admin authentication and password conversion functions

-- Function to authenticate admin and convert plain password to hashed on first login
CREATE OR REPLACE FUNCTION authenticate_admin(
    admin_phone VARCHAR(20),
    admin_username VARCHAR(50),
    input_password VARCHAR(255)
)
RETURNS TABLE(
    id UUID,
    username VARCHAR(50),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    is_authenticated BOOLEAN,
    is_first_login BOOLEAN
) AS $$
DECLARE
    admin_record RECORD;
    hashed_password VARCHAR(255);
BEGIN
    -- Get admin record
    SELECT * INTO admin_record 
    FROM admins 
    WHERE phone_number = admin_phone 
    AND username = admin_username;
    
    -- If admin not found
    IF admin_record IS NULL THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            NULL::VARCHAR(50), 
            NULL::VARCHAR(20), 
            NULL::VARCHAR(255), 
            FALSE, 
            FALSE;
        RETURN;
    END IF;
    
    -- Check if this is first login (has plain_password, no hashed_password)
    IF admin_record.hashed_password IS NULL AND admin_record.plain_password IS NOT NULL THEN
        -- First login - compare with plain password
        IF admin_record.plain_password = input_password THEN
            -- Convert plain password to hashed password
            hashed_password := crypt(input_password, gen_salt('bf'));
            
            -- Update admin record
            UPDATE admins 
            SET 
                hashed_password = hashed_password,
                plain_password = NULL,
                updated_at = NOW()
            WHERE id = admin_record.id;
            
            -- Return success for first login
            RETURN QUERY SELECT 
                admin_record.id,
                admin_record.username,
                admin_record.phone_number,
                admin_record.email,
                TRUE,
                TRUE;
        ELSE
            -- Plain password doesn't match
            RETURN QUERY SELECT 
                admin_record.id,
                admin_record.username,
                admin_record.phone_number,
                admin_record.email,
                FALSE,
                TRUE;
        END IF;
    ELSE
        -- Regular login - compare with hashed password
        IF admin_record.hashed_password IS NOT NULL AND 
           crypt(input_password, admin_record.hashed_password) = admin_record.hashed_password THEN
            -- Return success for regular login
            RETURN QUERY SELECT 
                admin_record.id,
                admin_record.username,
                admin_record.phone_number,
                admin_record.email,
                TRUE,
                FALSE;
        ELSE
            -- Hashed password doesn't match
            RETURN QUERY SELECT 
                admin_record.id,
                admin_record.username,
                admin_record.phone_number,
                admin_record.email,
                FALSE,
                FALSE;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to authenticate regular user
CREATE OR REPLACE FUNCTION authenticate_user(
    user_phone VARCHAR(20),
    input_password VARCHAR(255)
)
RETURNS TABLE(
    id UUID,
    username VARCHAR(50),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    is_authenticated BOOLEAN
) AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Get user record
    SELECT * INTO user_record 
    FROM users 
    WHERE phone_number = user_phone;
    
    -- If user not found
    IF user_record IS NULL THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            NULL::VARCHAR(50), 
            NULL::VARCHAR(20), 
            NULL::VARCHAR(255), 
            FALSE;
        RETURN;
    END IF;
    
    -- Check password
    IF crypt(input_password, user_record.hashed_password) = user_record.hashed_password THEN
        -- Return success
        RETURN QUERY SELECT 
            user_record.id,
            user_record.username,
            user_record.phone_number,
            user_record.email,
            TRUE;
    ELSE
        -- Return failure
        RETURN QUERY SELECT 
            user_record.id,
            user_record.username,
            user_record.phone_number,
            user_record.email,
            FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create new user (for signup)
CREATE OR REPLACE FUNCTION create_user(
    new_username VARCHAR(50),
    new_phone VARCHAR(20),
    new_password VARCHAR(255),
    new_email VARCHAR(255) DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    username VARCHAR(50),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    success BOOLEAN,
    message VARCHAR(255)
) AS $$
DECLARE
    hashed_password VARCHAR(255);
    new_user_id UUID;
BEGIN
    -- Check if username or phone already exists
    IF EXISTS(SELECT 1 FROM users WHERE username = new_username) THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            NULL::VARCHAR(50), 
            NULL::VARCHAR(20), 
            NULL::VARCHAR(255), 
            FALSE, 
            'Username already exists'::VARCHAR(255);
        RETURN;
    END IF;
    
    IF EXISTS(SELECT 1 FROM users WHERE phone_number = new_phone) THEN
        RETURN QUERY SELECT 
            NULL::UUID, 
            NULL::VARCHAR(50), 
            NULL::VARCHAR(20), 
            NULL::VARCHAR(255), 
            FALSE, 
            'Phone number already exists'::VARCHAR(255);
        RETURN;
    END IF;
    
    -- Hash the password
    hashed_password := crypt(new_password, gen_salt('bf'));
    
    -- Insert new user
    INSERT INTO users (username, phone_number, hashed_password, email)
    VALUES (new_username, new_phone, hashed_password, new_email)
    RETURNING id INTO new_user_id;
    
    -- Return success
    RETURN QUERY SELECT 
        new_user_id,
        new_username,
        new_phone,
        new_email,
        TRUE,
        'User created successfully'::VARCHAR(255);
END;
$$ LANGUAGE plpgsql; 