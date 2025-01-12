import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import { UserPlus } from 'lucide-react';
import type { Profile } from '../../../types/database.types';
import { toast } from 'react-hot-toast';

export default function RecommendedUsers() {
  const { user } = useAuthStore();
  const [recommendedUsers, setRecommendedUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const INITIAL_DISPLAY_COUNT = 5;

  useEffect(() => {
    const fetchRecommendedUsers = async () => {
      if (!user) return;
      
      try {
        const { data: recommendedUsers, error } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            avatar_url,
            university,
            field_of_study,
            profile_interests (
              interests (
                id,
                name
              )
            )
          `)
          .neq('id', user.id)
          .limit(50)
          .returns<Profile[]>();

        if (error) throw error;
        setRecommendedUsers(recommendedUsers || []);
      } catch (error) {
        console.error('Error fetching recommended users:', error);
        toast.error('Failed to fetch recommended users');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedUsers();
  }, [user]);

  const displayedUsers = showAll ? recommendedUsers : recommendedUsers.slice(0, INITIAL_DISPLAY_COUNT);

  const handleSendRequest = async (receiverId: string) => {
    try {
      // Check if request already exists
      const { data: existingRequest, error: checkError } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .or(`sender_id.eq.${receiverId},receiver_id.eq.${receiverId}`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingRequest) {
        toast.error('A friend request already exists between you and this user');
        return;
      }

      // If no existing request, proceed with creating new request
      const { error: requestError } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user?.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (requestError) throw requestError;

      toast.success('Friend request sent successfully!');
      setRecommendedUsers(prev => prev.filter(person => person.id !== receiverId));

    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="mb-4 text-xl font-semibold">Recommended Users</h2>
      {displayedUsers.length === 0 ? (
        <p className="text-gray-500">No recommendations available</p>
      ) : (
        <>
          <div className="space-y-4">
            {displayedUsers.map((person) => (
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
                      {person.university}
                      {person.field_of_study && ` • ${person.field_of_study}`}
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
          {recommendedUsers.length > INITIAL_DISPLAY_COUNT && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 font-medium text-indigo-600 hover:text-indigo-800"
            >
              {showAll ? 'Show Less' : `View ${recommendedUsers.length - INITIAL_DISPLAY_COUNT} More`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
