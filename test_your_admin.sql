-- Test your admin credentials directly in the database

-- First, let's see what admins exist
SELECT 'Current admins in database:' as info;
SELECT username, phone_number, plain_password, hashed_password FROM admins;

-- Test the authentication function with your admin credentials
-- Replace these with your actual admin credentials:
SELECT 'Testing admin authentication function:' as info;
SELECT * FROM authenticate_admin('xavionetello', '0700000000', 'xavitello');

-- If you have a different admin, test with those credentials:
-- SELECT * FROM authenticate_admin('your_admin_username', 'your_admin_phone', 'your_admin_password'); 