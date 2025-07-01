-- Add position column to rooms table
ALTER TABLE rooms 
ADD COLUMN position INTEGER DEFAULT 0;

-- Update existing rooms to have position 0
UPDATE rooms SET position = 0 WHERE position IS NULL;

-- Add comment to the column
COMMENT ON COLUMN rooms.position IS 'Position/order of room on the website'; 