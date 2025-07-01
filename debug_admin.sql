-- Debug script to check admin authentication

-- First, let's see what's in the admins table
SELECT 'Current admin records:' as info;
SELECT username, phone_number, plain_password, hashed_password, email FROM admins;

-- Let's test the authentication function with the admin credentials
-- Replace 'your_admin_username' and 'your_admin_phone' with your actual admin credentials
SELECT 'Testing admin authentication:' as info;
SELECT * FROM authenticate_admin('xavionetello', '0700000000', 'xavitello');

-- Let's also check if there are any issues with the function
SELECT 'Function definition:' as info;
SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'authenticate_admin'; 