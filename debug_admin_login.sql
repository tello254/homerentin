-- Comprehensive admin login debug script

-- 1. Check all admins in the database
SELECT '=== ALL ADMINS IN DATABASE ===' as debug_info;
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
FROM admins;

-- 2. Test authentication with common admin credentials
-- Replace these with your actual admin credentials:
SELECT '=== TESTING AUTHENTICATION ===' as debug_info;

-- Test 1: xavionetello (if this is your admin)
SELECT 'Test 1: xavionetello' as test_name;
SELECT * FROM authenticate_admin('xavionetello', '0700000000', 'xavitello');

-- Test 2: admin (if this is your admin)
SELECT 'Test 2: admin' as test_name;
SELECT * FROM authenticate_admin('admin', '+1234567890', 'admin123');

-- Test 3: testadmin (if this is your admin)
SELECT 'Test 3: testadmin' as test_name;
SELECT * FROM authenticate_admin('testadmin', '1234567890', 'testpass123');

-- 3. Check specific admin by username (replace 'your_admin_username' with actual username)
SELECT '=== SEARCHING FOR SPECIFIC ADMIN ===' as debug_info;
SELECT 
    username, 
    phone_number, 
    plain_password,
    hashed_password,
    email
FROM admins 
WHERE username = 'xavionetello';  -- Replace with your actual admin username

-- 4. Test with exact credentials from database
-- This will help identify if there are any formatting issues
SELECT '=== TESTING WITH EXACT DATABASE VALUES ===' as debug_info;
-- Replace the values below with the exact values from your admin record:
-- SELECT * FROM authenticate_admin('EXACT_USERNAME', 'EXACT_PHONE', 'EXACT_PASSWORD'); 