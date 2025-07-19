import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { roomsApi, storageApi, type Room } from '@/lib/supabase';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Trash2, Plus, Upload, X, Camera, Share2 } from 'lucide-react';
import { Dialog as UIDialog, DialogContent as UIDialogContent, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle } from '@/components/ui/dialog';
import { useRooms } from '@/hooks/useSupabase';

interface RoomEditModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomData: any) => void;
  isCreateMode?: boolean;
  hideVerifiedToggle?: boolean;
  loading?: boolean;
  success?: boolean;
  userMode?: boolean;
  userPhone?: string;
}

type RoomForm = Partial<Room> & { user_phone?: string };

const defaultRoom: RoomForm = {
  room_id: '',
  title: '',
  price: 0,
  time_from_campus: '',
  distance_from_campus: '',
  verification: false,
  status: 'vacant',
  room_type: 'bedsitter',
  location: '',
  payment_type: 'monthly',
  floor: '',
  interior_water_supply: false,
  ceiling: false,
  size: '',
  sink: false,
  working_toilet: false,
  flashable_toilets: false,
  security_rating: 3,
  wifi: false,
  additional_info: '',
  landlord_phone: '',
  position: 0,
  images: [],
};

const RoomEditModal = ({ room, isOpen, onClose, onSave, isCreateMode, hideVerifiedToggle, userMode, userPhone }: RoomEditModalProps) => {
  const [form, setForm] = useState<RoomForm>({ ...defaultRoom, user_phone: userPhone || '' });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Camera capture state
  const [cameraPreview, setCameraPreview] = useState<string | null>(null);
  const [cameraFile, setCameraFile] = useState<File | null>(null);
  // Ref for hidden camera input
  const cameraInputRef = useRef<HTMLInputElement>(null);
  // Export images state
  const [exportMode, setExportMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const { rooms: allRooms, loading: roomsLoading } = useRooms();
  const [selectedTargetRooms, setSelectedTargetRooms] = useState<string[]>([]);

  useEffect(() => {
    if (room && !isCreateMode) {
      setForm({ ...room, user_phone: (room as any).user_phone || userPhone || '' });
    } else {
      setForm({ ...defaultRoom, user_phone: userPhone || '' });
    }
  }, [room, isCreateMode, userPhone]);

  const handleChange = (field: keyof Room, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url, error } = await storageApi.uploadImage(file);
      if (error) throw error;
      setForm((prev) => ({ ...prev, images: [...(prev.images || []), url] }));
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Camera capture handler
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCameraPreview(reader.result as string);
      setCameraFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCameraImage = async () => {
    if (!cameraFile) return;
    setUploading(true);
    setError(null);
    try {
      const { url, error } = await storageApi.uploadImage(cameraFile);
      if (error) throw error;
      setForm((prev) => ({ ...prev, images: [...(prev.images || []), url] }));
      setCameraPreview(null);
      setCameraFile(null);
    } catch (err) {
      setError('Failed to save camera image');
    } finally {
      setUploading(false);
    }
  };

  const handleRetakeCameraImage = () => {
    setCameraPreview(null);
    setCameraFile(null);
  };

  const handleImageDelete = (url: string) => {
    setForm((prev) => ({ ...prev, images: (prev.images || []).filter((img) => img !== url) }));
  };

  // Handler to trigger camera input
  const handleOpenCamera = () => {
    cameraInputRef.current?.click();
  };

  // Toggle export mode
  const handleExportClick = () => {
    setExportMode((prev) => !prev);
    setSelectedImages([]);
  };

  // Select/deselect image for export
  const handleSelectImage = (url: string) => {
    setSelectedImages((prev) =>
      prev.includes(url) ? prev.filter((img) => img !== url) : [...prev, url]
    );
  };

  // Open export modal
  const handleExportNow = () => {
    setShowExportModal(true);
  };

  // Toggle room selection
  const handleSelectTargetRoom = (roomId: string) => {
    setSelectedTargetRooms((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  // Confirm export
  const handleConfirmExport = async () => {
    for (const roomId of selectedTargetRooms) {
      const targetRoom = allRooms.find(r => r.id === roomId);
      if (targetRoom) {
        const newImages = Array.from(new Set([...(targetRoom.images || []), ...selectedImages]));
        await roomsApi.updateRoom(roomId, { images: newImages });
      }
    }
    setShowExportModal(false);
    setExportMode(false);
    setSelectedImages([]);
    setSelectedTargetRooms([]);
    // Optionally show a success message
    alert('Images exported successfully!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields
    if (!form.title?.trim()) {
      setError('Title is required');
      return;
    }
    if (!form.price || form.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    
    try {
      // Prepare the room data with all required fields
      const roomData = {
        room_id: form.room_id || '', // Will be auto-generated by database trigger
        title: form.title?.trim() || '',
        price: Number(form.price),
        time_from_campus: form.time_from_campus || '',
        distance_from_campus: form.distance_from_campus || '',
        verification: Boolean(form.verification),
        status: form.status || 'vacant',
        room_type: form.room_type || 'bedsitter',
        location: form.location || '',
        payment_type: form.payment_type || 'monthly',
        floor: form.floor || '',
        interior_water_supply: Boolean(form.interior_water_supply),
        ceiling: Boolean(form.ceiling),
        size: form.size || '',
        sink: Boolean(form.sink),
        working_toilet: Boolean(form.working_toilet),
        flashable_toilets: Boolean(form.flashable_toilets),
        security_rating: Number(form.security_rating) || 3,
        wifi: Boolean(form.wifi),
        additional_info: form.additional_info || '',
        landlord_phone: form.landlord_phone || '',
        position: Number(form.position) || 0,
        images: form.images || [],
        user_phone: form.user_phone || userPhone || ''
      };
      
      console.log('Submitting room data:', roomData);
      
      if (isCreateMode) {
        const { data, error } = await roomsApi.createRoom(roomData);
        if (error) {
          console.error('Create room error:', error);
          throw new Error(error.message || 'Failed to create room');
        }
        console.log('Room created successfully:', data);
      } else if (room) {
        const { data, error } = await roomsApi.updateRoom(room.id, roomData);
        if (error) {
          console.error('Update room error:', error);
          throw new Error(error.message || 'Failed to update room');
        }
        console.log('Room updated successfully:', data);
      }
      onSave(roomData);
    } catch (err: any) {
      console.error('Room save error:', err);
      setError(err.message || 'Failed to save room');
    }
  };

  // Show uploader phone if present (user upload)
  const uploaderPhone = (room && (room as any).user_phone) || form.user_phone || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreateMode ? 'Add New Room' : 'Edit Room'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Room ID</Label>
              <Input 
                value={isCreateMode ? 'Auto-generated' : (form.room_id || 'Not assigned')} 
                disabled 
                className="bg-gray-50"
                placeholder="Will be auto-generated"
              />
            </div>
            <div>
              <Label>Uploader Phone</Label>
              <Input 
                value={form.user_phone || userPhone || ''}
                disabled
                className="bg-gray-50"
                placeholder="Uploader phone"
                required
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => handleChange('title', e.target.value)} required />
            </div>
            <div>
              <Label>Price (KES)</Label>
              <Input type="number" value={form.price} onChange={e => handleChange('price', Number(e.target.value))} required />
            </div>
            <div>
              <Label>Time from Campus</Label>
              <Input value={form.time_from_campus} onChange={e => handleChange('time_from_campus', e.target.value)} />
            </div>
            <div>
              <Label>Distance from Campus</Label>
              <Input value={form.distance_from_campus} onChange={e => handleChange('distance_from_campus', e.target.value)} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={e => handleChange('location', e.target.value)} />
            </div>
            <div>
              <Label>Landlord Phone</Label>
              <Input value={form.landlord_phone} onChange={e => handleChange('landlord_phone', e.target.value)} />
            </div>
            {!userMode && (
              <div>
                <Label>Position (on website)</Label>
                <Input type="number" value={form.position} onChange={e => handleChange('position', Number(e.target.value))} />
              </div>
            )}
            {!userMode && (
              <div>
                <Label>Floor</Label>
                <Input value={form.floor} onChange={e => handleChange('floor', e.target.value)} />
              </div>
            )}
            <div>
              <Label>Room Type</Label>
              <select 
                value={form.room_type} 
                onChange={e => handleChange('room_type', e.target.value)} 
                className="w-full border rounded px-2 py-1"
                aria-label="Room type"
              >
                <option value="bedsitter">Bedsitter</option>
                <option value="single">Single</option>
                <option value="apartment">Apartment</option>
                <option value="studio">Studio</option>
                <option value="shared">Shared</option>
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select 
                value={form.status} 
                onChange={e => handleChange('status', e.target.value)} 
                className="w-full border rounded px-2 py-1"
                aria-label="Room status"
              >
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="pending">Pending</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <Label>Payment Type</Label>
              <select 
                value={form.payment_type} 
                onChange={e => handleChange('payment_type', e.target.value)} 
                className="w-full border rounded px-2 py-1"
                aria-label="Payment type"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semester">Semester</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <Label>Size</Label>
              <Input value={form.size} onChange={e => handleChange('size', e.target.value)} />
            </div>
            <div>
              <Label>Security Rating (1-5)</Label>
              <Input type="number" min={1} max={5} value={form.security_rating} onChange={e => handleChange('security_rating', Number(e.target.value))} />
            </div>
            <div>
              <Label>Additional Info</Label>
              <Input value={form.additional_info} onChange={e => handleChange('additional_info', e.target.value)} />
            </div>
          </div>

          {/* Boolean fields */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {!hideVerifiedToggle && (
              <div><Label>Verified</Label><Switch checked={!!form.verification} onCheckedChange={v => handleChange('verification', v)} /></div>
            )}
            <div><Label>WiFi</Label><Switch checked={!!form.wifi} onCheckedChange={v => handleChange('wifi', v)} /></div>
            <div><Label>Water</Label><Switch checked={!!form.interior_water_supply} onCheckedChange={v => handleChange('interior_water_supply', v)} /></div>
            <div><Label>Ceiling</Label><Switch checked={!!form.ceiling} onCheckedChange={v => handleChange('ceiling', v)} /></div>
            <div><Label>Sink</Label><Switch checked={!!form.sink} onCheckedChange={v => handleChange('sink', v)} /></div>
            <div><Label>Toilet</Label><Switch checked={!!form.working_toilet} onCheckedChange={v => handleChange('working_toilet', v)} /></div>
            <div><Label>Flashable Toilets</Label><Switch checked={!!form.flashable_toilets} onCheckedChange={v => handleChange('flashable_toilets', v)} /></div>
          </div>

          {/* Image management */}
          <div>
            <Label>Images</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(form.images || []).map((img, idx) => (
                <div key={img} className="relative group">
                  <img src={img} alt="room" className="w-24 h-16 object-cover rounded border" />
                  {exportMode && (
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(img)}
                      onChange={() => handleSelectImage(img)}
                      className="absolute top-1 left-1 w-5 h-5 accent-blue-600"
                      title="Select for export"
                    />
                  )}
                  <button 
                    type="button" 
                    onClick={() => handleImageDelete(img)} 
                    className="absolute top-1 right-1 bg-white/80 rounded-full p-1 hover:bg-red-100"
                    aria-label="Delete image"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-24 h-16 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50">
                <Upload className="w-6 h-6 text-gray-400" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  aria-label="Upload image"
                />
              </label>
            </div>
            {uploading && <div className="text-blue-600 text-xs">Uploading...</div>}
            {error && <div className="text-red-600 text-xs">{error}</div>}
            {exportMode && (
              <div className="mt-4 flex gap-2">
                <Button type="button" onClick={handleExportNow} disabled={selectedImages.length === 0}>
                  Export Now
                </Button>
                <Button type="button" variant="outline" onClick={handleExportClick}>Cancel</Button>
              </div>
            )}
          </div>

          {/* Camera & Export Buttons Section */}
          <div className="col-span-1 md:col-span-2 flex gap-2 items-center">
            {!cameraPreview && (
              <>
                <Button type="button" onClick={handleOpenCamera} className="mb-2 flex items-center justify-center" disabled={uploading} title="Take Photo">
                  <Camera className="w-6 h-6" />
                </Button>
                {!hideVerifiedToggle && (
                  <Button type="button" onClick={handleExportClick} className="mb-2 flex items-center justify-center" variant={exportMode ? 'destructive' : 'outline'} title="Export Images">
                    <Share2 className="w-6 h-6" />
                  </Button>
                )}
              </>
            )}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
              disabled={uploading}
              title="Open camera to take a photo"
              placeholder="Take a photo"
            />
          </div>

          {/* Images List with Export Selection (above buttons, not duplicated) */}
          {/* (Move exportMode logic to the main images list above the buttons) */}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{userMode ? 'Submit' : (isCreateMode ? 'Add Room' : 'Save Changes')}</Button>
          </div>
        </form>
      </DialogContent>
      {/* Export Target Room Selection Modal */}
      <UIDialog open={showExportModal} onOpenChange={setShowExportModal}>
        <UIDialogContent className="max-w-lg">
          <UIDialogHeader>
            <UIDialogTitle>Select Target Room(s) for Export</UIDialogTitle>
          </UIDialogHeader>
          {roomsLoading ? (
            <div className="text-center py-8">Loading rooms...</div>
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {allRooms.filter(r => r.id !== room?.id).map(room => (
                <label key={room.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedTargetRooms.includes(room.id)}
                    onChange={() => handleSelectTargetRoom(room.id)}
                  />
                  <span className="font-medium">{room.title}</span>
                  <span className="text-xs text-gray-500">(ID: {room.room_id})</span>
                </label>
              ))}
            </div>
          )}
          <div className="flex gap-2 justify-end mt-4">
            <Button type="button" variant="outline" onClick={() => setShowExportModal(false)}>Cancel</Button>
            <Button type="button" onClick={handleConfirmExport} disabled={selectedTargetRooms.length === 0}>Confirm Export</Button>
          </div>
        </UIDialogContent>
      </UIDialog>
    </Dialog>
  );
};

export default RoomEditModal; 