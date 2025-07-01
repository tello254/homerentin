-- Add room_id column to rooms table with auto-incrementing sequential numbers starting from 00200
-- This script creates a sequence and adds the room_id column

-- Create a sequence starting from 200 (which will display as 00200)
CREATE SEQUENCE IF NOT EXISTS room_id_sequence START 200;

-- Add room_id column to rooms table
ALTER TABLE rooms ADD COLUMN room_id VARCHAR(10) UNIQUE;

-- Create a function to generate the next room_id in the format XX201XX
CREATE OR REPLACE FUNCTION generate_room_id()
RETURNS TRIGGER AS $$
DECLARE
    seq_part TEXT;
    rand1 TEXT;
    rand2 TEXT;
    rand3 TEXT;
    rand4 TEXT;
BEGIN
    -- Get the next value from sequence and format it as 3-digit string
    seq_part := LPAD(nextval('room_id_sequence')::text, 3, '0');
    -- Generate two random digits for the prefix and two for the suffix
    rand1 := (FLOOR(random() * 10))::int::text;
    rand2 := (FLOOR(random() * 10))::int::text;
    rand3 := (FLOOR(random() * 10))::int::text;
    rand4 := (FLOOR(random() * 10))::int::text;
    NEW.room_id := rand1 || rand2 || seq_part || rand3 || rand4;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set room_id before insert
CREATE TRIGGER set_room_id_trigger
    BEFORE INSERT ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION generate_room_id();

-- Update existing rooms with new room_ids in the format XX201XX
WITH numbered_rooms AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
    FROM rooms 
    WHERE room_id IS NULL
)
UPDATE rooms 
SET room_id = 
    (SELECT (FLOOR(random() * 10))::int::text || (FLOOR(random() * 10))::int::text ||
            LPAD((200 + numbered_rooms.row_num - 1)::text, 3, '0') ||
            (FLOOR(random() * 10))::int::text || (FLOOR(random() * 10))::int::text
    FROM numbered_rooms WHERE rooms.id = numbered_rooms.id)
FROM numbered_rooms
WHERE rooms.id = numbered_rooms.id;

-- Set the sequence to start from the next available number (using the middle 3 digits)
SELECT setval('room_id_sequence', (SELECT COALESCE(MAX(CAST(SUBSTRING(room_id, 3, 3) AS INTEGER)), 199) + 1 FROM rooms));

-- Add comment to the column
COMMENT ON COLUMN rooms.room_id IS 'Auto-generated random room identifier in the format XX201XX, where X are random digits.';

-- Show the updated table structure
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

-- Show sample of rooms with their new room_ids
SELECT room_id, title, price, location FROM rooms ORDER BY room_id LIMIT 10; 