import { useEffect, useState } from 'react';
import RoomCard from '../components/RoomCard';
import RoomEditModal from '../components/RoomEditModal';
import { roomsApi } from '../lib/supabase';
import type { Room } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Dialog as UIDialog, DialogContent as UIDialogContent, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle } from '../components/ui/dialog';
import { useRef } from 'react';

interface AddRoomPageProps {
  userPhone: string;
}

const AddRoom = ({ userPhone }: AddRoomPageProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      if (!userPhone || userPhone.trim() === '') {
        setRooms([]);
        setLoading(false);
        return;
      }
      const { data, error } = await roomsApi.getRooms({ user_phone: userPhone });
      if (!error && data) {
        setRooms(data);
      } else {
        setRooms([]);
      }
      setLoading(false);
    };
    fetchRooms();
  }, [userPhone, addSuccess]);

  const handleAddRoom = async (roomData: any) => {
    // The room is already saved by RoomEditModal (which owns validation and creation).
    // Only show the success state here — the list refetches via the addSuccess effect.
    setAddSuccess(true);
    setTimeout(() => {
      setShowAddModal(false);
      setAddSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">My Uploaded Rooms</h1>
        <Button className="mb-4" onClick={() => setShowConfirmDialog(true)}>
          Add Room
        </Button>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">You have not uploaded any rooms yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} onClick={() => {}} showVerificationStatus={true} />
            ))}
          </div>
        )}
      </div>
      {/* Confirmation Dialog before Add Room Modal */}
      <UIDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <UIDialogContent className="max-w-md">
          <UIDialogHeader>
            <UIDialogTitle>Before You List a House</UIDialogTitle>
          </UIDialogHeader>
          <div className="mb-4 text-gray-700">
            <p>List a house, earn <b>25% commission</b> on marketing profits. Get <b>KES 50–100</b> for every house you listed once it’s taken.</p>
            <p className="mt-3">Please confirm the phone number you provide is correct, registered, and a <b>Safaricom</b> number (for easy payments). Make sure it matches the number you use to log in.</p>
            <div className="mt-4 p-3 rounded bg-gray-100 border text-center">
              <span className="font-semibold">Your phone number:</span><br />
              <span className="text-lg font-mono">{userPhone}</span>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button type="button" onClick={() => { setShowConfirmDialog(false); setShowAddModal(true); }}>Confirm</Button>
          </div>
        </UIDialogContent>
      </UIDialog>
      {showAddModal && (
        <RoomEditModal
          room={null}
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddRoom}
          isCreateMode={true}
          hideVerifiedToggle={true}
          loading={addLoading}
          success={addSuccess}
          userMode={true}
          userPhone={userPhone}
        />
      )}
      {addSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto text-center shadow-lg">
            <h2 className="text-2xl font-bold mb-2 text-kisu-green">Thank you!</h2>
            <p className="text-gray-700 mb-2">Your property has been submitted for review.</p>
            <p className="text-gray-600">After review, your property will be uploaded. Good day!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddRoom; 