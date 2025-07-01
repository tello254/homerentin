-- Fix room table structure based on user requirements
-- This script updates the rooms table to match the correct specifications

-- 1. Change floor from INTEGER to TEXT (for floor type: red oxide, tiles, marble, etc.)
DO $$ 
BEGIN
    -- First, backup existing floor data if needed
    -- Then change the column type
    ALTER TABLE rooms ALTER COLUMN floor TYPE TEXT;
    ALTER TABLE rooms ALTER COLUMN floor SET DEFAULT '';
    RAISE NOTICE 'Changed floor column from INTEGER to TEXT';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Floor column type change failed: %', SQLERRM;
END $$;

-- 2. Rename flashing to flashable_toilets (boolean)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'rooms' AND column_name = 'flashing') THEN
        ALTER TABLE rooms RENAME COLUMN flashing TO flashable_toilets;
        RAISE NOTICE 'Renamed flashing column to flashable_toilets';
    END IF;
END $$;

-- 3. Add flashable_toilets if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'flashable_toilets') THEN
        ALTER TABLE rooms ADD COLUMN flashable_toilets BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added flashable_toilets column to rooms table';
    END IF;
END $$;

-- 4. Ensure images column can handle multiple images (up to 10)
-- The images column should already be TEXT[] (array of text) which can handle multiple URLs
-- Let's verify and update if needed
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'rooms' AND column_name = 'images') THEN
        -- Check if it's already an array type
        IF (SELECT data_type FROM information_schema.columns 
            WHERE table_name = 'rooms' AND column_name = 'images') != 'ARRAY' THEN
            -- Convert to array if it's not already
            ALTER TABLE rooms ALTER COLUMN images TYPE TEXT[] USING ARRAY[images];
            RAISE NOTICE 'Converted images column to TEXT[] array';
        ELSE
            RAISE NOTICE 'Images column is already TEXT[] array - no change needed';
        END IF;
    ELSE
        -- Add images column if it doesn't exist
        ALTER TABLE rooms ADD COLUMN images TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added images column as TEXT[] array';
    END IF;
END $$;

-- 5. Add any other missing columns that might be needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'position') THEN
        ALTER TABLE rooms ADD COLUMN position INTEGER DEFAULT 0;
        RAISE NOTICE 'Added position column to rooms table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'landlord_phone') THEN
        ALTER TABLE rooms ADD COLUMN landlord_phone TEXT DEFAULT '';
        RAISE NOTICE 'Added landlord_phone column to rooms table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'wifi') THEN
        ALTER TABLE rooms ADD COLUMN wifi BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added wifi column to rooms table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'additional_info') THEN
        ALTER TABLE rooms ADD COLUMN additional_info TEXT DEFAULT '';
        RAISE NOTICE 'Added additional_info column to rooms table';
    END IF;
END $$;

-- 6. Update existing records with default values
UPDATE rooms SET floor = '' WHERE floor IS NULL OR floor = '0';
UPDATE rooms SET flashable_toilets = FALSE WHERE flashable_toilets IS NULL;
UPDATE rooms SET images = '{}' WHERE images IS NULL;
UPDATE rooms SET position = 0 WHERE position IS NULL;
UPDATE rooms SET landlord_phone = '' WHERE landlord_phone IS NULL;
UPDATE rooms SET wifi = FALSE WHERE wifi IS NULL;
UPDATE rooms SET additional_info = '' WHERE additional_info IS NULL;

-- 7. Show the final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN data_type = 'ARRAY' THEN 
            (SELECT udt_name FROM information_schema.columns 
             WHERE table_name = 'rooms' AND column_name = c.column_name) || '[]'
        ELSE data_type 
    END as actual_type
FROM information_schema.columns c
WHERE table_name = 'rooms' 
ORDER BY ordinal_position; 