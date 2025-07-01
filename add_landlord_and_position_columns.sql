-- Add landlord_phone and position columns to rooms table
ALTER TABLE rooms ADD COLUMN landlord_phone VARCHAR(20);
ALTER TABLE rooms ADD COLUMN position INTEGER DEFAULT 0;

-- Update sample data with landlord numbers and positions
UPDATE rooms SET landlord_phone = '+254700000001', position = 1 WHERE title = 'Cozy Bedsitter Near Campus';
UPDATE rooms SET landlord_phone = '+254700000002', position = 2 WHERE title = 'Modern Studio Apartment';
UPDATE rooms SET landlord_phone = '+254700000003', position = 3 WHERE title = 'Affordable Single Room';
UPDATE rooms SET landlord_phone = '+254700000004', position = 4 WHERE title = 'Luxury Apartment Complex';
UPDATE rooms SET landlord_phone = '+254700000005', position = 5 WHERE title = 'Student Shared Room';
UPDATE rooms SET landlord_phone = '+254700000006', position = 6 WHERE title = 'Executive Studio Suite';
UPDATE rooms SET landlord_phone = '+254700000007', position = 7 WHERE title = 'Family Apartment';
UPDATE rooms SET landlord_phone = '+254700000008', position = 8 WHERE title = 'Budget Single Room'; 