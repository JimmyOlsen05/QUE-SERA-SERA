import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Users, BookOpen, Calendar, Bell, MessageSquare, UserPlus } from 'lucide-react';
import type { Profile } from '../../types/database.types';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import testEmail from '../../utils/testEmail';

interface Activity {
  id: string;
  activity_type: 'friend_request' | 'event' | 'post_share' | 'post_like' | 'comment';
  content: string;
  created_at: string;
  related_id: string | null;
  is_read: boolean;
}

interface SuggestedUser {
  id: string;
  username: string;
  avatar_url: string | null;
  department: string;
}

export default function Home() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [stats, setStats] = useState({
    friendCount: 0,
    pendingRequests: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch activities
        const { data: activitiesData } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (activitiesData) {
          setActivities(activitiesData);
        }

        // Fetch friend requests and convert them to activities
        const { data: requestsData } = await supabase
          .from('friend_requests')
          .select(`
            *,
            sender:profiles!friend_requests_sender_id_fkey(
              username,
              avatar_url
            )
          `)
          .eq('receiver_id', user.id)
          .eq('status', 'pending');

        if (requestsData) {
          const requestActivities = requestsData.map(request => ({
            id: `friend-request-${request.id}`,
            activity_type: 'friend_request',
            content: `${request.sender.username} sent you a friend request`,
            created_at: request.created_at,
            related_id: request.sender_id,
            is_read: false
          }));

          // Combine and sort all activities
          setActivities(prev => 
            [...prev, ...requestActivities]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .filter((activity): activity is Activity => Boolean(activity))
              .filter((activity, index, self) => 
                index === self.findIndex(a => a.id === activity.id)
              )
              .slice(0, 5)
          );
        }

        // Fetch stats
        const [{ count: friendCount }, { count: requestCount }] = await Promise.all([
          supabase
            .from('friends')
            .select('*', { count: 'exact', head: true })
            .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`),
          supabase
            .from('friend_requests')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('status', 'pending')
        ]);

        setStats({
          friendCount: friendCount || 0,
          pendingRequests: requestCount || 0,
          unreadMessages: 3 // Placeholder - implement real message count
        });

        // Fetch suggested users
        const { data: suggestedUsersData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, department')
          .neq('id', user.id)
          .limit(3);

        if (suggestedUsersData) {
          setSuggestedUsers(suggestedUsersData);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to realtime activities and friend requests
    const subscription = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          setActivities(current => [payload.new as Activity, ...current.slice(0, 4)]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_requests',
          filter: `receiver_id=eq.${user?.id}`
        },
        async (payload) => {
          // Fetch sender details
          const { data: sender } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          if (sender) {
            const newActivity: Activity = {
              id: `friend-request-${payload.new.id}`,
              activity_type: 'friend_request',
              content: `${sender.username} sent you a friend request`,
              created_at: payload.new.created_at,
              related_id: payload.new.sender_id,
              is_read: false
            };
            setActivities(current => [newActivity, ...current].slice(0, 5));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const getActivityIcon = (type: Activity['activity_type']) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-green-500" />;
      case 'post_share':
      case 'post_like':
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleActivityClick = (activity: Activity) => {
    if (!activity.related_id) return;

    switch (activity.activity_type) {
      case 'friend_request':
        navigate('/dashboard/friends');
        break;
      case 'event':
        navigate(`/dashboard/events/${activity.related_id}`);
        break;
      case 'post_share':
      case 'post_like':
      case 'comment':
        navigate(`/dashboard/forum/post/${activity.related_id}`);
        break;
    }
  };

  const handleTestEmail = async () => {
    try {
      await testEmail();
      alert('Email sent successfully!');
    } catch (error) {
      alert('Failed to send email: ' + (error as Error).message);
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
    <div className="mx-auto space-y-6 max-w-7xl">
      <div className="mb-6">
        <button 
          onClick={handleTestEmail}
          className="px-4 py-2 text-white bg-blue-500 rounded transition-colors hover:bg-blue-600"
        >
          Test Email
        </button>
      </div>
      {/* Welcome Banner */}
      <div className="p-6 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg">
        <h1 className="mb-2 text-3xl font-bold">Welcome back, {profile?.username}!</h1>
        <p className="text-indigo-100">Stay connected with your university community</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Friends</p>
              <h3 className="text-2xl font-bold">{stats.friendCount}</h3>
            </div>
            <Users className="w-10 h-10 text-indigo-500" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Friend Requests</p>
              <h3 className="text-2xl font-bold">{stats.pendingRequests}</h3>
            </div>
            <UserPlus className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Unread Messages</p>
              <h3 className="text-2xl font-bold">{stats.unreadMessages}</h3>
            </div>
            <MessageSquare className="w-10 h-10 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Quick Links</h2>
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (user?.id) {
                    navigate(`/dashboard/forum/user/${user.id}`);
                  }
                }}
                className="flex items-center p-3 space-x-3 w-full text-left rounded-lg hover:bg-gray-50"
              >
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <span>My Posts</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/events')}
                className="flex items-center p-3 space-x-3 w-full text-left rounded-lg hover:bg-gray-50"
              >
                <Calendar className="w-5 h-5 text-green-500" />
                <span>Upcoming Events</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/friends')}
                className="flex items-center p-3 space-x-3 w-full text-left rounded-lg hover:bg-gray-50"
              >
                <Users className="w-5 h-5 text-blue-500" />
                <span>Find Friends</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm lg:col-span-2">
          <div className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="py-4 text-center text-gray-500">No recent activity</p>
              ) : (
                activities.map((activity) => (
                  <div
                    key={`activity-${activity.id}`}
                    className="flex items-center p-3 space-x-3 rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => handleActivityClick(activity)}
                  >
                    {getActivityIcon(activity.activity_type)}
                    <div className="flex-1">
                      <p className="text-gray-800">{activity.content}</p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* People You May Know */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold">People You May Know</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {suggestedUsers.map((suggestedUser, index) => (
              <div key={`suggested-${suggestedUser.id}-${index}`} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {suggestedUser.avatar_url ? (
                    <img
                      src={suggestedUser.avatar_url}
                      alt={suggestedUser.username}
                      className="object-cover w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="flex justify-center items-center w-12 h-12 bg-gray-200 rounded-full">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestedUser.username}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{suggestedUser.department}</p>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/profile/${suggestedUser.id}`)}
                  className="flex-shrink-0 bg-white hover:bg-gray-50 text-indigo-600 px-3 py-1.5 border border-indigo-600 rounded-full text-sm font-medium"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}