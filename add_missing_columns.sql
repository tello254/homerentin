-- Add missing columns to rooms table
-- Run this after the initial rooms table setup

-- Add wifi column
ALTER TABLE rooms ADD COLUMN wifi BOOLEAN DEFAULT false;

-- Add additional_info column
ALTER TABLE rooms ADD COLUMN additional_info TEXT;

-- Update existing sample data to include the new columns
UPDATE rooms SET 
  wifi = true,
  additional_info = 'Near shopping center, quiet neighborhood, 24/7 security'
WHERE title = 'Cozy Bedsitter Near Campus';

UPDATE rooms SET 
  wifi = true,
  additional_info = 'Modern amenities, parking available, elevator access'
WHERE title = 'Modern Studio Apartment';

UPDATE rooms SET 
  wifi = false,
  additional_info = 'Basic accommodation, shared bathroom, budget-friendly'
WHERE title = 'Affordable Single Room'; 