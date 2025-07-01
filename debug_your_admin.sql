-- Debug script for your specific admin: Xavitello

-- 1. Check if your admin exists in the database
SELECT '=== CHECKING YOUR ADMIN ===' as debug_info;
SELECT 
    username, 
    phone_number, 
    CASE 
        WHEN plain_password = '' THEN 'EMPTY'
        WHEN plain_password IS NULL THEN 'NULL'
        ELSE 'HAS_VALUE: ' || LEFT(plain_password, 10) || '...'
    END as plain_password_status,
    CASE 
        WHEN hashed_password = '' THEN 'EMPTY'
        WHEN hashed_password IS NULL THEN 'NULL'
        WHEN hashed_password LIKE '$2a$%' THEN 'BCRYPT_HASH: ' || LEFT(hashed_password, 20) || '...'
        ELSE 'OTHER: ' || LEFT(hashed_password, 20) || '...'
    END as hashed_password_status,
    email
FROM admins 
WHERE username = 'Xavitello' OR phone_number = '0703209999';

-- 2. Test authentication with your exact credentials
SELECT '=== TESTING YOUR ADMIN LOGIN ===' as debug_info;
SELECT * FROM authenticate_admin('Xavitello', '0703209999', 'tello1@Gmail');

-- 3. If admin doesn't exist, let's create it
SELECT '=== CREATING YOUR ADMIN IF NOT EXISTS ===' as debug_info;
INSERT INTO admins (username, phone_number, plain_password, email)
VALUES ('Xavitello', '0703209999', 'tello1@Gmail', 'xavitello@gmail.com')
ON CONFLICT (username) DO NOTHING;

-- 4. Check the admin record after creation/conflict
SELECT '=== YOUR ADMIN RECORD ===' as debug_info;
SELECT username, phone_number, plain_password, hashed_password FROM admins WHERE username = 'Xavitello';

-- 5. Test authentication again
SELECT '=== TESTING AUTHENTICATION AGAIN ===' as debug_info;
SELECT * FROM authenticate_admin('Xavitello', '0703209999', 'tello1@Gmail');

-- 6. Check final state
SELECT '=== FINAL ADMIN STATE ===' as debug_info;
SELECT username, phone_number, plain_password, hashed_password FROM admins WHERE username = 'Xavitello'; 