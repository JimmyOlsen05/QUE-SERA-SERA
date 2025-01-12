import { useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ForumPost from '../../components/Forum/ForumPost';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from 'react';
interface LocationState {
  filter?: string;
  userId?: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  category: string;
  user_id: string;
  attachment_url?: string;
  share_count: number;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name: string;
    university: string;
    bio: string;
  };
}

export default function Forum() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { user } = useAuthStore();
  const state = location.state as LocationState;

  useEffect(() => {
    async function fetchPosts() {
      try {
        let query = supabase
          .from('forum_posts')
          .select(`
            *,
            profiles(id, username, avatar_url, full_name, university, bio)
          `)
          .order('created_at', { ascending: false });

        // If we're filtering for a specific user's posts
        if (state?.filter === 'user' && state?.userId) {
          query = query.eq('user_id', state.userId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [state?.filter, state?.userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 rounded-full border-b-2 border-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {state?.filter === 'user' ? 'My Forum Posts' : 'Forum Posts'}
        </h1>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            {state?.filter === 'user' 
              ? "You haven't created any posts yet." 
              : "No posts found."}
          </div>
        ) : (
          posts.map((post) => (
            <ForumPost
              key={post.id}
              post={{
                ...post,
                author: {
                  id: post.profiles.id,
                  username: post.profiles.username,
                  avatar_url: post.profiles.avatar_url || ''
                }
              }}
              showActions={post.user_id === user?.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
