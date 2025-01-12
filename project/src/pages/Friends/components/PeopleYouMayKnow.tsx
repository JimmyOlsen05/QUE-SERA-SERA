import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import { UserPlus } from 'lucide-react';
import type { Profile } from '../../../types/database.types';

interface FriendOfFriend extends Profile {
  mutualFriends: number;
}

export default function PeopleYouMayKnow() {
  const { user } = useAuthStore();
  const [people, setPeople] = useState<FriendOfFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const INITIAL_DISPLAY_COUNT = 5;

  const handleSendRequest = async (receiverId: string) => {
    try {
      if (!user) return;

      const { error: friendError } = await supabase
        .from('friends')
        .insert([
          {
            user_id1: user.id,
            user_id2: receiverId,
            status: 'pending'
          }
        ]);

      if (friendError) throw friendError;

      const { error: activityError } = await supabase.rpc('create_activity', {
        p_user_id: receiverId,
        p_activity_type: 'friend_request',
        p_content: `${user?.email?.split('@')[0] || 'Someone'} sent you a friend request`,
        p_related_id: user?.id
      });

      if (activityError) throw activityError;

      setPeople(prev => prev.filter(person => person.id !== receiverId));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  useEffect(() => {
    const fetchFriendsOfFriends = async () => {
      if (!user) return;
      
      try {
        // First get user's direct friends
        const { data: directFriends, error: friendsError } = await supabase
          .from('friends')
          .select('user_id1, user_id2')
          .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);

        if (friendsError) throw friendsError;

        // Get IDs of direct friends
        const directFriendIds = new Set(
          directFriends?.map(f => 
            f.user_id1 === user.id ? f.user_id2 : f.user_id1
          ) || []
        );

        // Get pending friend requests to exclude
        const { data: requests } = await supabase
          .from('friend_requests')
          .select('sender_id, receiver_id')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        const pendingIds = new Set(
          requests?.flatMap(r => [r.sender_id, r.receiver_id]) || []
        );

        // Get friends of friends
        const friendsOfFriendsPromises = Array.from(directFriendIds).map(friendId =>
          supabase
            .from('friends')
            .select('user_id1, user_id2')
            .or(`user_id1.eq.${friendId},user_id2.eq.${friendId}`)
        );

        const friendsOfFriendsResults = await Promise.all(friendsOfFriendsPromises);

        // Collect potential friends and count mutual friends
        const mutualFriendCounts = new Map<string, number>();
        const potentialFriendIds = new Set<string>();

        friendsOfFriendsResults.forEach(({ data: friendships }) => {
          friendships?.forEach(friendship => {
            const potentialFriendId = 
              friendship.user_id1 === user.id ? friendship.user_id2 :
              friendship.user_id2 === user.id ? friendship.user_id1 :
              friendship.user_id1 in directFriendIds ? friendship.user_id2 :
              friendship.user_id1;

            // Skip if this is the user, a direct friend, or has a pending request
            if (
              potentialFriendId === user.id ||
              directFriendIds.has(potentialFriendId) ||
              pendingIds.has(potentialFriendId)
            ) {
              return;
            }

            potentialFriendIds.add(potentialFriendId);
            mutualFriendCounts.set(
              potentialFriendId,
              (mutualFriendCounts.get(potentialFriendId) || 0) + 1
            );
          });
        });

        if (potentialFriendIds.size === 0) {
          setPeople([]);
          return;
        }

        // Get profiles of potential friends
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', Array.from(potentialFriendIds))
          .limit(20);

        if (profilesError) throw profilesError;

        // Combine profiles with mutual friend counts and sort
        const peopleWithMutual = profiles.map(profile => ({
          ...profile,
          mutualFriends: mutualFriendCounts.get(profile.id) || 0
        })).sort((a, b) => b.mutualFriends - a.mutualFriends);

        setPeople(peopleWithMutual);
      } catch (error) {
        console.error('Error fetching friends of friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsOfFriends();
  }, [user]);

  const displayedPeople = showAll ? people : people.slice(0, INITIAL_DISPLAY_COUNT);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="mb-4 text-xl font-semibold">People You May Know</h2>
      {displayedPeople.length === 0 ? (
        <p className="text-gray-500">No suggestions available</p>
      ) : (
        <>
          <div className="space-y-4">
            {displayedPeople.map((person) => (
              <div
                key={person.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={person.avatar_url || '/default-avatar.png'}
                    alt={`${person.username}'s avatar`}
                    className="object-cover w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{person.username}</h3>
                    <p className="text-sm text-gray-500">
                      {person.mutualFriends} mutual friend{person.mutualFriends !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSendRequest(person.id)}
                  className="flex justify-center items-center w-10 h-10 text-white bg-blue-500 rounded-full transition-colors hover:bg-blue-600"
                  title="Send friend request"
                >
                  <UserPlus size={20} />
                </button>
              </div>
            ))}
          </div>
          {people.length > INITIAL_DISPLAY_COUNT && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 font-medium text-indigo-600 hover:text-indigo-800"
            >
              {showAll ? 'Show Less' : `View ${people.length - INITIAL_DISPLAY_COUNT} More`}
            </button>
          )}
        </>
      )}
    </div>
  );
}