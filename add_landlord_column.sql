-- Add landlord_phone column to rooms table
-- Run this to add landlord contact information

ALTER TABLE rooms ADD COLUMN landlord_phone VARCHAR(20);

-- Update existing rooms with sample landlord numbers
UPDATE rooms SET landlord_phone = '+254700000001' WHERE title = 'Cozy Bedsitter Near Campus';
UPDATE rooms SET landlord_phone = '+254700000002' WHERE title = 'Modern Studio Apartment';
UPDATE rooms SET landlord_phone = '+254700000003' WHERE title = 'Affordable Single Room';
UPDATE rooms SET landlord_phone = '+254700000004' WHERE title = 'Luxury Apartment Complex';
UPDATE rooms SET landlord_phone = '+254700000005' WHERE title = 'Student Shared Room';
UPDATE rooms SET landlord_phone = '+254700000006' WHERE title = 'Executive Studio Suite';
UPDATE rooms SET landlord_phone = '+254700000007' WHERE title = 'Family Apartment';
UPDATE rooms SET landlord_phone = '+254700000008' WHERE title = 'Budget Single Room'; 