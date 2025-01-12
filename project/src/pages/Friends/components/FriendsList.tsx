import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, UserMinus } from 'lucide-react';
import { toast } from 'react-hot-toast';

type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  university?: string;
  full_name?: string;
  field_of_study?: string;
  bio?: string;
};

export default function FriendsList() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;
    
    try {
      // First get all friend connections
      const { data: connections, error: connectionsError } = await supabase
        .from('friends')
        .select('user_id1, user_id2')
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);

      if (connectionsError) throw connectionsError;

      // Extract friend IDs
      const friendIds = connections?.map(conn => 
        conn.user_id1 === user.id ? conn.user_id2 : conn.user_id1
      ) || [];

      if (friendIds.length > 0) {
        // Get friend profiles
        const { data: friendProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, university')
          .in('id', friendIds);

        if (profilesError) throw profilesError;
        setFriends(friendProfiles as Profile[] || []);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = async (friendId: string) => {
    if (!user) return;

    const friend = friends.find(f => f.id === friendId);
    if (!friend) return;

    if (!window.confirm(`Are you sure you want to unfriend ${friend.username}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id1.eq.${user.id},user_id2.eq.${friendId}),and(user_id1.eq.${friendId},user_id2.eq.${user.id})`);

      if (error) throw error;

      setFriends(friends.filter(f => f.id !== friendId));
      toast.success(`Removed ${friend.username} from your friends`);
    } catch (error) {
      console.error('Error unfriending:', error);
      toast.error('Failed to remove friend');
    }
  };

  const navigateToChat = async (friendId: string) => {
    if (!user) return;
    const friend = friends.find(f => f.id === friendId);
    if (!friend) return;
    navigate('/dashboard/chat', { state: { selectedFriendId: friendId, selectedFriendName: friend.username } });
  };

  return (
    <section className="p-6 bg-white rounded-lg shadow">
      <h2 className="mb-6 text-xl font-semibold">Your Friends</h2>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 rounded-full border-b-2 border-blue-500 animate-spin" />
        </div>
      ) : friends.length === 0 ? (
        <p className="py-8 text-center text-gray-500">You haven't added any friends yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {friends.map(friend => (
            <div
              key={friend.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={friend.avatar_url || '/default-avatar.png'}
                  alt={`${friend.username}'s avatar`}
                  className="object-cover w-12 h-12 rounded-full border-2 border-white shadow"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{friend.username}</h3>
                  <p className="text-sm text-gray-500">{friend.university}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigateToChat(friend.id)}
                  className="flex justify-center items-center w-10 h-10 text-white bg-blue-500 rounded-full transition-colors hover:bg-blue-600"
                  title="Chat with friend"
                >
                  <MessageCircle size={20} />
                </button>
                <button
                  onClick={() => handleUnfriend(friend.id)}
                  className="flex justify-center items-center w-10 h-10 text-white bg-red-500 rounded-full transition-colors hover:bg-red-600"
                  title="Remove friend"
                >
                  <UserMinus size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}