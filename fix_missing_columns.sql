-- Fix missing columns in rooms table
-- This script adds any missing columns that might not exist

-- Add position column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'position') THEN
        ALTER TABLE rooms ADD COLUMN position INTEGER DEFAULT 0;
        RAISE NOTICE 'Added position column to rooms table';
    END IF;
END $$;

-- Add landlord_phone column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'landlord_phone') THEN
        ALTER TABLE rooms ADD COLUMN landlord_phone TEXT DEFAULT '';
        RAISE NOTICE 'Added landlord_phone column to rooms table';
    END IF;
END $$;

-- Add wifi column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'wifi') THEN
        ALTER TABLE rooms ADD COLUMN wifi BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added wifi column to rooms table';
    END IF;
END $$;

-- Add additional_info column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'additional_info') THEN
        ALTER TABLE rooms ADD COLUMN additional_info TEXT DEFAULT '';
        RAISE NOTICE 'Added additional_info column to rooms table';
    END IF;
END $$;

-- Update existing records to have default values
UPDATE rooms SET position = 0 WHERE position IS NULL;
UPDATE rooms SET landlord_phone = '' WHERE landlord_phone IS NULL;
UPDATE rooms SET wifi = FALSE WHERE wifi IS NULL;
UPDATE rooms SET additional_info = '' WHERE additional_info IS NULL;

-- Show the current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'rooms' 
ORDER BY ordinal_position; 