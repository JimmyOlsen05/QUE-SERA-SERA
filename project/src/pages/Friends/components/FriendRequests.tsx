import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import { Check, X, Clock } from 'lucide-react';
import type { Profile } from '../../../types/database.types';

interface FriendRequestWithProfiles {
  id: string;
  sender: Profile;
  receiver: Profile;
  status: string;
  created_at: string;
}

export default function FriendRequests() {
  const { user } = useAuthStore();
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestWithProfiles[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      
      try {
        // Fetch received requests
        const { data: receivedData, error: receivedError } = await supabase
          .from('friend_requests')
          .select(`
            id,
            status,
            created_at,
            sender:sender_id(id, username, avatar_url, university),
            receiver:receiver_id(id, username, avatar_url, university)
          `)
          .eq('receiver_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .returns<FriendRequestWithProfiles[]>();

        if (receivedError) {
          console.error('Error fetching received requests:', receivedError);
          return;
        }
        setReceivedRequests(receivedData || []);

        // Fetch sent requests
        const { data: sentData, error: sentError } = await supabase
          .from('friend_requests')
          .select(`
            id,
            status,
            created_at,
            sender:sender_id(id, username, avatar_url, university),
            receiver:receiver_id(id, username, avatar_url, university)
          `)
          .eq('sender_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .returns<FriendRequestWithProfiles[]>();

        if (sentError) {
          console.error('Error fetching sent requests:', sentError);
          return;
        }
        setSentRequests(sentData || []);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const handleRequest = async (senderId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status })
        .eq('sender_id', senderId)
        .eq('receiver_id', user?.id);

      if (updateError) throw updateError;

      // If accepted, create a friendship entry
      if (status === 'accepted') {
        const { error: friendError } = await supabase
          .from('friends')
          .insert([
            {
              user_id1: senderId,
              user_id2: user?.id
            }
          ]);

        if (friendError) throw friendError;
      }

      // Remove the request from the received requests list
      setReceivedRequests(requests => requests.filter(request => request.sender.id !== senderId));
    } catch (error) {
      console.error('Error handling friend request:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 rounded-full border-b-2 border-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Received Requests */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Received Friend Requests</h2>
        <div className="space-y-4">
          {receivedRequests.length === 0 ? (
            <p className="text-gray-500">No pending friend requests.</p>
          ) : (
            receivedRequests.map((request) => (
              <div key={request.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={request.sender.avatar_url || 'https://via.placeholder.com/40'}
                    alt={request.sender.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{request.sender.username}</p>
                    <p className="text-sm text-gray-500">{request.sender.university}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRequest(request.sender.id, 'accepted')}
                    className="p-2 text-green-600 rounded-full transition-colors hover:bg-green-50"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRequest(request.sender.id, 'rejected')}
                    className="p-2 text-red-600 rounded-full transition-colors hover:bg-red-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sent Requests */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">Sent Friend Requests</h2>
        <div className="space-y-4">
          {sentRequests.length === 0 ? (
            <p className="text-gray-500">No pending sent requests.</p>
          ) : (
            sentRequests.map((request) => (
              <div key={request.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={request.receiver.avatar_url || 'https://via.placeholder.com/40'}
                    alt={request.receiver.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{request.receiver.username}</p>
                    <p className="text-sm text-gray-500">{request.receiver.university}</p>
                  </div>
                </div>
                <span className="flex items-center text-sm text-gray-500">
                  <Clock className="mr-1 w-4 h-4" /> Pending
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}