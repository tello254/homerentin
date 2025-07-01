# 🗂️ Storage Bucket Setup Guide

## 📋 **Step-by-Step Instructions for Creating the Images Storage Bucket**

### **Step 1: Go to Supabase Storage**

1. **Open your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `cmeqhzuagqjqamgmbutx`

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - You should see an empty storage section

### **Step 2: Create the Images Bucket**

1. **Click "Create a new bucket"**
   - You'll see a form to configure the bucket

2. **Fill in the bucket details:**
   - **Bucket name**: `images` (exactly as shown)
   - **Public bucket**: ✅ **CHECK THIS BOX** (very important!)
   - **File size limit**: `10MB`
   - **Allowed MIME types**: `image/*`

3. **Click "Create bucket"**
   - You should see the new `images` bucket appear

### **Step 3: Set Storage Policies**

After creating the bucket, you need to set up policies to control access:

#### **Policy 1: Public Read Access**
1. Click on the `images` bucket
2. Click "New Policy"
3. **Policy name**: `Public Access`
4. **Allowed operation**: `SELECT`
5. **Policy definition**: 
   ```sql
   (bucket_id = 'images')
   ```
6. Click "Review" then "Save policy"

#### **Policy 2: Authenticated Upload**
1. Click "New Policy" again
2. **Policy name**: `Authenticated users can upload images`
3. **Allowed operation**: `INSERT`
4. **Policy definition**:
   ```sql
   (bucket_id = 'images' AND auth.role() = 'authenticated')
   ```
5. Click "Review" then "Save policy"

#### **Policy 3: Update Own Images**
1. Click "New Policy" again
2. **Policy name**: `Users can update own images`
3. **Allowed operation**: `UPDATE`
4. **Policy definition**:
   ```sql
   (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1])
   ```
5. Click "Review" then "Save policy"

#### **Policy 4: Delete Own Images**
1. Click "New Policy" again
2. **Policy name**: `Users can delete own images`
3. **Allowed operation**: `DELETE`
4. **Policy definition**:
   ```sql
   (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1])
   ```
5. Click "Review" then "Save policy"

### **Step 4: Verify Setup**

1. **Check Bucket Creation**
   - You should see the `images` bucket in the storage list
   - It should show "Public" status

2. **Check Policies**
   - Click on the `images` bucket
   - Go to "Policies" tab
   - You should see 4 policies listed

3. **Test the App**
   - Go back to your app at http://localhost:8081/
   - The rooms should now display properly

## 🎯 **What This Enables:**

### **For Admins:**
- ✅ Upload room images
- ✅ Store images as URLs (not base64)
- ✅ Manage image files
- ✅ Delete old images

### **For Users:**
- ✅ View room images
- ✅ Fast image loading
- ✅ No storage limits on client

### **For the App:**
- ✅ Efficient image storage
- ✅ Scalable solution
- ✅ Professional image handling

## 🔧 **Troubleshooting:**

### **If bucket creation fails:**
- Make sure you're in the correct project
- Check that the bucket name is exactly `images`
- Ensure "Public bucket" is checked

### **If policies fail:**
- Copy the SQL exactly as shown
- Make sure you're in the correct bucket
- Check that all 4 policies are created

### **If images don't load:**
- Verify the bucket is public
- Check that the SELECT policy is active
- Test with a simple image upload

## 📞 **Need Help?**

If you get stuck at any step:
1. Take a screenshot of the error
2. Tell me exactly which step failed
3. I'll help you resolve it!

---

## 🚀 **Next Steps After Storage Setup:**

1. **Test image upload** - We'll create an admin interface
2. **Add real room images** - Replace placeholder images
3. **Create admin panel** - For managing rooms and images
4. **Implement booking system** - For users to book rooms

Ready to create the storage bucket? Let me know when you're done! 🎉 