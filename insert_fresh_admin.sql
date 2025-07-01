-- Insert a fresh admin to test the plain to hash conversion

-- First, let's clear any existing test admin
DELETE FROM admins WHERE username = 'testadmin_fresh';

-- Insert a fresh admin with plain password (this should trigger the conversion on first login)
-- Using a unique phone number to avoid conflicts
INSERT INTO admins (username, phone_number, plain_password, email)
VALUES ('testadmin_fresh', '9999999999', 'testpass123', 'test@example.com');

-- Check the admin record before login
SELECT '=== FRESH ADMIN BEFORE LOGIN ===' as debug_info;
SELECT username, phone_number, plain_password, hashed_password FROM admins WHERE username = 'testadmin_fresh';

-- Test the authentication (this should convert plain_password to hashed_password)
SELECT '=== TESTING FIRST LOGIN ===' as debug_info;
SELECT * FROM authenticate_admin('testadmin_fresh', '9999999999', 'testpass123');

-- Check the admin record after login
SELECT '=== FRESH ADMIN AFTER LOGIN ===' as debug_info;
SELECT username, phone_number, plain_password, hashed_password FROM admins WHERE username = 'testadmin_fresh';

-- Test second login (should use hashed_password)
SELECT '=== TESTING SECOND LOGIN ===' as debug_info;
SELECT * FROM authenticate_admin('testadmin_fresh', '9999999999', 'testpass123'); 