import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import FriendRequests from '../components/Friends/FriendRequests';
import SuggestedFriends from '../components/Friends/SuggestedFriends';
import SearchUsers from '../components/Friends/SearchUsers';

interface Friend {
  id: string;
  username: string;
  avatar_url: string;
  university: string;
}

export default function Friends() {
  const { user } = useAuthStore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;

    try {
      console.log('Fetching friends for user:', user.id);

      // Get all friend connections
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
        setFriends(friendProfiles || []);
      } else {
        setFriends([]);
      }

    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-8 mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">Friends</h1>
      
      <SearchUsers />
      
      <div className="grid gap-6 md:grid-cols-2">
        <FriendRequests onUpdate={fetchFriends} />
        <SuggestedFriends />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Your Friends</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-b-2 border-indigo-600 animate-spin" />
          </div>
        ) : friends.length === 0 ? (
          <p className="text-gray-500">You haven't added any friends yet</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center p-4 space-x-4 bg-white rounded-lg shadow">
                <img
                  src={friend.avatar_url || 'https://via.placeholder.com/40'}
                  alt={friend.username}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{friend.username}</h3>
                  <p className="text-sm text-gray-500">{friend.university}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}