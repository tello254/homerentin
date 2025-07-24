-- Test script for authentication functions

-- First, let's check if our tables exist and have data
SELECT 'Checking tables...' as status;

-- Check admins table
SELECT 'Admins table:' as table_name, COUNT(*) as count FROM admins;

-- Check users table  
SELECT 'Users table:' as table_name, COUNT(*) as count FROM users;

-- Test 1: Admin first login (should convert plain_password to hashed_password)
SELECT 'Test 1: Admin first login' as test_name;
SELECT * FROM authenticate_admin('admin', '+1234567890', 'admin123');

-- Check the admin record after first login
SELECT 'Admin record after first login:' as info;
SELECT username, phone_number, plain_password, hashed_password FROM admins WHERE username = 'admin';

-- Test 2: Admin subsequent login (should use hashed_password)
SELECT 'Test 2: Admin subsequent login' as test_name;
SELECT * FROM authenticate_admin('admin', '+1234567890', 'admin123');

-- Test 3: User login
SELECT 'Test 3: User login' as test_name;
SELECT * FROM authenticate_user('user1', '+9876543210', 'user123');

-- Test 4: Create new user
SELECT 'Test 4: Create new user' as test_name;
SELECT * FROM create_user('newuser', '+1111111111', 'newpass123', 'newuser@example.com');

-- Test 5: Login with new user
SELECT 'Test 5: Login with new user' as test_name;
SELECT * FROM authenticate_user('newuser', '+1111111111', 'newpass123');

-- Test 6:  user password
SELECT 'Test 6: Reset user password' as test_name;
SELECT * FROM _password('user1', '+9876543210', 'newpassword123', 'newpassword123');

-- Test 7: Login with new password
SELECT 'Test 7: Login with new password' as test_name;
SELECT * FROM authenticate_user('user1', '+9876543210', 'newpassword123');

-- Test 8: Invalid admin login
SELECT 'Test 8: Invalid admin login' as test_name;
SELECT * FROM authenticate_admin('admin', '+1234567890', 'wrongpassword');

-- Test 9: Invalid user login
SELECT 'Test 9: Invalid user login' as test_name;
SELECT * FROM authenticate_user('user1', '+9876543210', 'wrongpassword');

-- Test 10: Non-existent user
SELECT 'Test 10: Non-existent user' as test_name;
SELECT * FROM authenticate_user('nonexistent', '+9999999999', 'password123');

-- Insert the test user
INSERT INTO users (username, phone_number, hashed_password, email)
VALUES ('Xavionetello', '0703209997', crypt('tello1@Gmail', gen_salt('bf')), 'tello1@gmail.com')
ON CONFLICT (username) DO NOTHING;

-- Test authentication for the new user
SELECT 'Test: Login with Xavionetello' as test_name;
SELECT * FROM authenticate_user('Xavionetello', '0703209997', 'tello1@Gmail');

-- Test for admin Xavionetello (if exists in admins table)
SELECT 'Test: Admin Xavionetello first login' as test_name;
SELECT * FROM authenticate_admin('Xavionetello', '0703209997', 'tello1@Gmail');

-- Check admin record after login (if it exists)
SELECT 'Admin Xavionetello record after login:' as info;
SELECT username, phone_number, plain_password, hashed_password FROM admins WHERE username = 'Xavionetello';

-- Insert the test user (xavionetello)
INSERT INTO users (username, phone_number, hashed_password, email)
VALUES ('xavionetello', '0700000000', crypt('xavitello', gen_salt('bf')), 'xavitello@gmail.com')
ON CONFLICT (username) DO NOTHING;

-- Test authentication for the new user (xavionetello)
SELECT 'Test: Login with xavionetello' as test_name;
SELECT * FROM authenticate_user('xavionetello', '0700000000', 'xavitello');

-- Insert the test admin (xavionetello) with plain password
INSERT INTO admins (username, phone_number, plain_password, email)
VALUES ('xavionetello', '0700000000', 'xavitello', 'xavitello@gmail.com')
ON CONFLICT (username) DO NOTHING;

-- Check admin record before login
SELECT 'Before login (admin xavionetello)' as info;
SELECT username, phone_number, plain_password, hashed_password FROM admins WHERE username = 'xavionetello';

-- Attempt first login (should hash plain_password and clear it)
SELECT 'First login attempt (admin xavionetello)' as test_name;
SELECT * FROM authenticate_admin('xavionetello', '0700000000', 'xavitello');

-- Check admin record after login
SELECT 'After login (admin xavionetello)' as info;
SELECT username, phone_number, plain_password, hashed_password FROM admins WHERE username = 'xavionetello'; 