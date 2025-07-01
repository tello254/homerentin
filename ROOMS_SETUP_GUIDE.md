# 🏠 Rooms Table & Storage Setup Guide

## 📋 **Step-by-Step Instructions**

### **Step 1: Create the Rooms Table**

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `cmeqhzuagqjqamgmbutx`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Rooms Table SQL**
   - Copy the contents of `rooms_table_setup.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

### **Step 2: Create Storage Bucket for Images**

1. **Go to Storage in Supabase Dashboard**
   - Click on "Storage" in the left sidebar
   - Click "Create a new bucket"

2. **Configure the Bucket**
   - **Bucket name**: `images`
   - **Public bucket**: ✅ Check this box
   - **File size limit**: `10MB`
   - **Allowed MIME types**: `image/*`
   - Click "Create bucket"

### **Step 3: Set Storage Bucket Policies**

1. **Go to Storage > Policies**
   - Click on the `images` bucket
   - Click "New Policy"

2. **Create Public Read Policy**
   - **Policy name**: `Public Access`
   - **Allowed operation**: `SELECT`
   - **Policy definition**: 
   ```sql
   (bucket_id = 'images')
   ```
   - Click "Review" then "Save policy"

3. **Create Upload Policy (for authenticated users)**
   - **Policy name**: `Authenticated users can upload images`
   - **Allowed operation**: `INSERT`
   - **Policy definition**:
   ```sql
   (bucket_id = 'images' AND auth.role() = 'authenticated')
   ```
   - Click "Review" then "Save policy"

4. **Create Update Policy**
   - **Policy name**: `Users can update own images`
   - **Allowed operation**: `UPDATE`
   - **Policy definition**:
   ```sql
   (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1])
   ```
   - Click "Review" then "Save policy"

5. **Create Delete Policy**
   - **Policy name**: `Users can delete own images`
   - **Allowed operation**: `DELETE`
   - **Policy definition**:
   ```sql
   (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1])
   ```
   - Click "Review" then "Save policy"

### **Step 4: Verify Setup**

1. **Check Tables**
   - Go to "Table Editor"
   - You should see the `rooms` table with all columns

2. **Check Storage**
   - Go to "Storage"
   - You should see the `images` bucket

3. **Test the App**
   - Run `npm run dev`
   - The home page should now show the sample rooms

## 🎯 **What We've Created**

### **Rooms Table Columns:**
- `id` - Unique identifier
- `title` - Room title/name
- `price` - Monthly rent in KES
- `time_from_campus` - Walking time (e.g., "15 minutes")
- `distance_from_campus` - Distance (e.g., "2.1 km")
- `verification` - Boolean for verified rooms
- `status` - vacant/occupied/pending/maintenance
- `room_type` - bedsitter/single/apartment/studio/shared
- `location` - Area/location
- `payment_type` - monthly/quarterly/semester/yearly
- `floor` - Floor number
- `interior_water_supply` - Boolean
- `ceiling` - Boolean
- `size` - Room dimensions (e.g., "15x20 feet")
- `sink` - Boolean
- `working_toilet` - Boolean
- `flashing` - Boolean
- `security_rating` - 1-5 rating
- `images` - Array of Supabase storage URLs
- `created_at` - Timestamp
- `updated_at` - Timestamp

### **Storage Bucket:**
- **Name**: `images`
- **Public**: Yes (anyone can view images)
- **Upload**: Authenticated users only
- **File types**: Images only
- **Size limit**: 10MB per file

## 🚀 **Next Steps**

After completing this setup:

1. **Test the app** - Rooms should now display on the home page
2. **Create admin interface** - For adding/editing rooms
3. **Implement image upload** - For room photos
4. **Add booking system** - For users to book rooms

## 🔧 **Troubleshooting**

If you encounter issues:

1. **Check SQL errors** - Look for any error messages in the SQL editor
2. **Verify bucket creation** - Make sure the `images` bucket exists
3. **Check policies** - Ensure all storage policies are created
4. **Test connection** - Verify the app can connect to Supabase

## 📞 **Need Help?**

If you get stuck at any step, let me know the specific error message and I'll help you resolve it! 