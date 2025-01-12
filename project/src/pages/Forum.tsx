import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ForumPost from '../components/Forum/ForumPost';
import { Profile } from '../types/database.types';

interface ForumPostInterface {
  id: string;
  title: string;
  content: string;
  category: string;
  user_id: string;
  created_at: string;
  profiles: Profile;
  attachment_url?: string;
  share_count: number;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export default function Forum() {
  const [posts, setPosts] = useState<ForumPostInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          id,
          title,
          content,
          category,
          user_id,
          attachment_url,
          created_at,
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .returns<ForumPostInterface[]>();

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostDelete = () => {
    fetchPosts();
  };

  return (
    <div className="px-4 py-8 mx-auto max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Forum</h1>
        <button
          onClick={() => navigate('/dashboard/forum/create')}
          className="px-4 py-2 text-white bg-indigo-600 rounded-md transition-colors hover:bg-indigo-700"
        >
          Create Topic
        </button>
      </div>

      {/* Posts Display Section */}
      {loading ? (
        <div className="py-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 border-indigo-600 animate-spin" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <ForumPost
              key={post.id}
              post={post}
              onDelete={handlePostDelete}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          No posts found.
        </div>
      )}
    </div>
  );
}
