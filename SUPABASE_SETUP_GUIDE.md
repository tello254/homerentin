# Supabase Database Setup Guide

## Overview
This guide sets up the database tables for the Kisu Rooms app with two user types: **users** and **admins**.

## Table Structure

### Users Table
- `id` - UUID primary key
- `username` - Unique username
- `phone_number` - Unique phone number
- `hashed_password` - Hashed password (required)
- `email` - Optional email
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Admins Table
- `id` - UUID primary key
- `username` - Unique username
- `phone_number` - Unique phone number
- `hashed_password` - Hashed password (initially NULL)
- `plain_password` - Plain text password (for manual insertion)
- `email` - Optional email
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Setup Instructions

### 1. Create Tables
Run the SQL commands from `database_setup.sql` in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content of database_setup.sql
```

### 2. Create Functions
Run the SQL commands from `admin_password_conversion.sql` in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content of admin_password_conversion.sql
```

### 3. Manual Admin Insertion
To add admins manually, use this format:

```sql
INSERT INTO admins (username, phone_number, plain_password, email) 
VALUES ('admin_username', '+1234567890', 'plain_password_here', 'admin@example.com');
```

## Authentication Flow

### For Regular Users:
1. User signs up → `create_user()` function creates record in `users` table with hashed password
2. User logs in → `authenticate_user()` function checks phone number and password

### For Admins:
1. Admin manually inserted → Recorded in `admins` table with plain_password
2. Admin first login → `authenticate_admin()` compares plain password, converts to hashed, removes plain_password
3. Subsequent logins → `authenticate_admin()` checks hashed password

## Security Features

- **RLS Disabled** - Simple access without complex policies
- **Password Hashing** - All passwords stored as hashed values using bcrypt
- **Plain Password Removal** - Admin plain_password removed after first login
- **Unique Constraints** - Username and phone number are unique
- **Indexes** - Performance optimization for queries

## Sample Data

### Sample Admin (already included in setup):
- Username: `admin`
- Phone: `+1234567890`
- Plain Password: `admin123`
- Email: `admin@example.com`

### To add more admins:
```sql
INSERT INTO admins (username, phone_number, plain_password, email) 
VALUES ('manager', '+1987654321', 'manager123', 'manager@example.com');
```

## API Functions Available

### For Authentication:

#### `authenticate_admin(phone, username, password)`
- Authenticates admin and converts plain password to hashed on first login
- Returns: id, username, phone_number, email, is_authenticated, is_first_login

#### `authenticate_user(phone, password)`
- Authenticates regular user
- Returns: id, username, phone_number, email, is_authenticated

#### `create_user(username, phone, password, email)`
- Creates new user account
- Returns: id, username, phone_number, email, success, message

### Usage Examples:

```sql
-- Authenticate admin (first login will convert plain to hashed)
SELECT * FROM authenticate_admin('+1234567890', 'admin', 'admin123');

-- Authenticate user
SELECT * FROM authenticate_user('+1234567890', 'userpassword');

-- Create new user
SELECT * FROM create_user('newuser', '+1234567890', 'password123', 'user@example.com');
```

## How It Works

### Admin First Login:
1. Admin enters phone, username, and password
2. System checks if admin exists with plain_password
3. If plain password matches, converts to hashed password
4. Removes plain_password for security
5. Returns authentication success

### Admin Subsequent Logins:
1. Admin enters phone, username, and password
2. System checks hashed password
3. Returns authentication result

### User Authentication:
1. User enters phone and password
2. System checks hashed password in users table
3. Returns authentication result

## Next Steps

1. **Test the setup** - Try the authentication functions
2. **Integrate with app** - Update authentication logic in the app
3. **Add more admins** - Insert additional admin accounts as needed
4. **Monitor security** - Ensure plain passwords are properly converted

## Important Notes

- **Keep plain passwords secure** - Only use for initial admin setup
- **Backup data** - Before running any destructive operations
- **Test thoroughly** - Verify authentication flows work correctly
- **Monitor logs** - Check for any authentication issues
- **Password hashing** - Uses bcrypt with salt for security 