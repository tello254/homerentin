-- Simple admin test

-- Clear any existing test admin
DELETE FROM admins WHERE username = 'testadmin';

-- Insert a fresh test admin with plain password
INSERT INTO admins (username, phone_number, plain_password, email)
VALUES ('testadmin', '1234567890', 'testpass123', 'test@example.com');

-- Check the record before login
SELECT 'Before login:' as info;
SELECT username, phone_number, plain_password, hashed_password FROM admins WHERE username = 'testadmin';

-- Test authentication
SELECT 'Authentication result:' as info;
SELECT * FROM authenticate_admin('testadmin', '1234567890', 'testpass123');

-- Check the record after login
SELECT 'After login:' as info;
SELECT username, phone_number, plain_password, hashed_password FROM admins WHERE username = 'testadmin'; 